import { useCallback, useMemo, useState, createElement, useEffect, useRef } from 'react';
import { Building2, Calendar, ChevronDown, LayoutDashboard, List, Plus, Search, SlidersHorizontal, ArrowUpDown, Download, Linkedin, Check, Sparkles, Zap, AlertTriangle, Upload, Users, DollarSign, UserRound, Heart, Target } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useKeyboard } from '../../hooks/useKeyboard';
import { setPresenceClerkId } from '../../hooks/usePresence';
import {
  initialCompanies, initialPeople, initialTasks, initialNotes, initialFiles,
  initialOpportunities, initialDeals, initialLeads, initialMeetings, initialProjects,
  type CompanyTableRow, type CrmPerson, type CrmTask, type CrmNote,
  type CrmOpportunity, type CrmDeal, type CrmLead, type CrmMeeting, type CrmProject, type CrmFile,
} from '../../constants/data';
import type { ModuleItem } from '../../constants/data';
import { DigitalWaveSidebar } from './DigitalWaveSidebar';
import { CompanyTable } from './CompanyTable';
import { DigitalWaveModulePanel } from './DigitalWaveModulePanel';
import { QuickActions } from './QuickActions';
import { QuickAddModal } from './QuickAddModal';
import type { QuickAddType } from './QuickAddModal';
import { CrudModal } from './CrudModal';
import type { CrudField } from './CrudModal';
import { validateForm } from '../../services/validation';
import { DigitalWaveCommandMenu } from './DigitalWaveCommandMenu';
import { DigitalWaveChatPanel } from './DigitalWaveChatPanel';
import { GlobalSearch } from './GlobalSearch';
import { AiExecutePanel } from './AiExecutePanel';
import { AiAssistantPanel } from './AiAssistantPanel';
import { WorkflowDashboard } from './WorkflowDashboard';
import { SettingsPanel } from './SettingsPanel';
import { CrmDashboard } from './CrmDashboard';
import { CsvImportModal, type ImportTarget } from './CsvImportModal';
import { RecordDetailDrawer } from './RecordDetailDrawer';
import { DealPipelineBoard } from './DealPipelineBoard';
import { NotificationCenter } from './NotificationCenter';
import { SyncStatusPill, type SyncStatus } from './SyncStatusPill';
import { ExactCompaniesView, ExactDashboardView, ExactLeadsView, ExactPeopleView } from './ExactCrmViews';
import { AuthRequired } from '../crm/AuthRequired';
import type { ExecuteResult } from '../../services/aiExecutionEngine';
import { checkCrmSchemaHealth, listAllModuleRecords, listCompanies, saveAllModuleRecords, saveCompanies } from '../../services/supabaseCrmService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getPermissions } from '../../services/permissions';
import { recordAuditEvent } from '../../services/auditLogService';
import { loadLocalCrmSnapshot, mergeById, saveLocalCrmSnapshot } from '../../services/crmLocalPersistence';

interface DigitalWaveCrmAppProps {
  clerkMissing: boolean;
}

const AI_MODULES = ['AI Execute', 'AI Ask'];
const MODULE_ACTIONS = ['Companies', 'Workflows', ...AI_MODULES];
const PERSISTED_MODULES = ['People', 'Tasks', 'Notes', 'Opportunities', 'Deals', 'Leads', 'Meetings', 'Projects', 'Files'];

type CrudEntity = CrmPerson | CrmTask | CrmNote | CrmOpportunity | CrmDeal | CrmLead | CrmMeeting | CrmProject | CrmFile | CompanyTableRow;

interface EntityConfig {
  fields: CrudField[];
  empty: () => Record<string, string>;
  toItem: (data: Record<string, string>, id: string) => ModuleItem;
  toEntity: (data: Record<string, string>, id: string) => CrudEntity;
  fromEntity: (item: CrudEntity) => Record<string, string>;
  setter: React.Dispatch<React.SetStateAction<CrudEntity[]>>;
}

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const moduleIconMap: Record<string, typeof Building2> = {
  Companies: Building2, People: Building2, Opportunities: Building2,
  Deals: Building2, Leads: Building2, Meetings: Building2, Projects: Building2,
  Tasks: Building2, Notes: Building2, Dashboards: LayoutDashboard,
  Workflows: LayoutDashboard, 'AI Execute': Zap, 'AI Ask': Sparkles,
  Settings: LayoutDashboard, Documentation: LayoutDashboard,
};

const moduleSubtitleMap: Record<string, string> = {
  Dashboards: 'Welcome back. Here is the health of your CRM workspace.',
  Companies: 'Manage accounts, ownership, revenue, and relationship history.',
  People: 'Manage your contacts and relationships.',
  Leads: 'Manage and track your leads pipeline.',
  Deals: 'Track open revenue and move deals through the pipeline.',
  Tasks: 'Prioritize follow-ups, handoffs, and overdue work.',
  Meetings: 'Keep customer conversations visible for the whole team.',
  Files: 'Attach proposals, contracts, recordings, and customer documents.',
  Settings: 'Control workspace, team, integrations, billing, and permissions.',
};

interface KpiItem {
  label: string;
  value: string;
  trend: string;
  icon: typeof Building2;
  tone: string;
}

function ModuleKpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="digital-wave-kpi-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <section className="digital-wave-kpi-card" key={item.label}>
            <div className="flex items-center gap-4">
              <span className="digital-wave-kpi-icon" style={{ background: item.tone }}>
                <Icon size={22} />
              </span>
              <div>
                <p className="text-sm">{item.label}</p>
                <strong>{item.value}</strong>
                <small>{item.trend}</small>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function DigitalWaveCrmApp({ clerkMissing }: DigitalWaveCrmAppProps) {
  const { user: clerkUser, isSignedIn } = useUser();
  const { role, currentUser, users } = useAuth();
  const permissions = useMemo(() => getPermissions(role), [role]);
  const localSnapshot = useMemo(() => loadLocalCrmSnapshot(), []);
  const audit = useCallback((action: string, entityType: string, entityName: string, outcome: 'success' | 'blocked' | 'failed' = 'success') => {
    recordAuditEvent({
      action,
      entityType,
      entityName,
      outcome,
      actor: currentUser?.email || clerkUser?.emailAddresses[0]?.emailAddress || 'Unknown user',
    });
  }, [clerkUser, currentUser]);
  const [activeModule, setActiveModule] = useState(() => window.location.pathname.startsWith('/crm/workflows') ? 'Workflows' : 'Dashboards');
  const [companies, setCompanies] = useState(() => localSnapshot.companies?.length ? localSnapshot.companies : initialCompanies);
  const [companiesLoaded, setCompaniesLoaded] = useState(false);
  const companiesRef = useRef(companies);
  const [recordsLoaded, setRecordsLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<'filter' | 'sort' | 'options' | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<{ type: string; item: CrudEntity } | null>(null);
  const [savedFilters, setSavedFilters] = useState<Array<{ id: string; name: string; query: string; employeeFilter: boolean }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('digital-wave-saved-filters') || '[]');
    } catch {
      return [];
    }
  });
  const [schemaHealth, setSchemaHealth] = useState<{ ok: boolean; missing: string[] } | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => ({
    state: isSupabaseConfigured ? 'loading' : 'local',
    message: isSupabaseConfigured ? 'Loading CRM data' : 'Saved locally',
  }));

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      setPresenceClerkId(clerkUser.id);
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    if (!isSignedIn) return;
    checkCrmSchemaHealth().then(setSchemaHealth).catch(() => setSchemaHealth({ ok: false, missing: ['schema check failed'] }));
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;

    let cancelled = false;
    listCompanies()
      .then((items) => {
        if (cancelled) return;
        if (items && items.length > 0) {
          setCompanies((current) => {
            const merged = mergeById(current, items);
            companiesRef.current = merged;
            saveLocalCrmSnapshot({ companies: merged });
            return merged;
          });
        } else if (items && items.length === 0) {
          void saveCompanies(companiesRef.current);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setCompaniesLoaded(true);
          setSyncStatus((current) => current.state === 'loading' ? { state: 'local', message: 'Saved locally' } : current);
        }
      });

    return () => { cancelled = true; };
  }, [isSignedIn]);

  useEffect(() => {
    companiesRef.current = companies;
    saveLocalCrmSnapshot({ companies });
    setSyncStatus({ state: isSupabaseConfigured ? 'local' : 'saved', message: isSupabaseConfigured ? 'Saved locally' : 'Saved locally' });
    if (!isSignedIn || !companiesLoaded) return;
    const timer = window.setTimeout(() => {
      setSyncStatus({ state: 'loading', message: 'Syncing companies' });
      void saveCompanies(companies)
        .then(() => setSyncStatus({ state: 'saved', message: 'All changes saved' }))
        .catch(() => setSyncStatus({ state: 'error', message: 'Database sync failed' }));
    }, 500);

    return () => window.clearTimeout(timer);
  }, [companies, companiesLoaded, isSignedIn]);
  const [employeeFilter, setEmployeeFilter] = useState(false);
  const [compactRows, setCompactRows] = useState(false);
  const [hiddenLinkedin, setHiddenLinkedin] = useState(false);
  const [lastAction, setLastAction] = useState('Ready');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiPrompt, setAiPrompt] = useState('Summarize my companies and next CRM actions.');
  const [quickAddType, setQuickAddType] = useState<QuickAddType | null>(null);

  const [people, setPeople] = useState<CrmPerson[]>(() => localSnapshot.People?.length ? localSnapshot.People : initialPeople);
  const [tasks, setTasks] = useState<CrmTask[]>(() => localSnapshot.Tasks?.length ? localSnapshot.Tasks : initialTasks);
  const [notes, setNotes] = useState<CrmNote[]>(() => localSnapshot.Notes?.length ? localSnapshot.Notes : initialNotes);
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>(() => localSnapshot.Opportunities?.length ? localSnapshot.Opportunities : initialOpportunities);
  const [deals, setDeals] = useState<CrmDeal[]>(() => localSnapshot.Deals?.length ? localSnapshot.Deals : initialDeals);
  const [leads, setLeads] = useState<CrmLead[]>(() => localSnapshot.Leads?.length ? localSnapshot.Leads : initialLeads);
  const [meetings, setMeetings] = useState<CrmMeeting[]>(() => localSnapshot.Meetings?.length ? localSnapshot.Meetings : initialMeetings);
  const [projects, setProjects] = useState<CrmProject[]>(() => localSnapshot.Projects?.length ? localSnapshot.Projects : initialProjects);
  const [files, setFiles] = useState<CrmFile[]>(() => localSnapshot.Files?.length ? localSnapshot.Files : initialFiles);
  const moduleRecordsRef = useRef({
    People: people,
    Tasks: tasks,
    Notes: notes,
    Opportunities: opportunities,
    Deals: deals,
    Leads: leads,
    Meetings: meetings,
    Projects: projects,
    Files: files,
  });

  useEffect(() => {
    if (!isSignedIn) return;

    let cancelled = false;
    listAllModuleRecords(PERSISTED_MODULES)
      .then((records) => {
        if (cancelled) return;
        const peopleRecords = records.People as CrmPerson[] | null;
        const taskRecords = records.Tasks as CrmTask[] | null;
        const noteRecords = records.Notes as CrmNote[] | null;
        const opportunityRecords = records.Opportunities as CrmOpportunity[] | null;
        const dealRecords = records.Deals as CrmDeal[] | null;
        const leadRecords = records.Leads as CrmLead[] | null;
        const meetingRecords = records.Meetings as CrmMeeting[] | null;
        const projectRecords = records.Projects as CrmProject[] | null;
        const fileRecords = records.Files as CrmFile[] | null;

        const mergedRecords = {
          People: peopleRecords?.length ? mergeById(moduleRecordsRef.current.People, peopleRecords) : moduleRecordsRef.current.People,
          Tasks: taskRecords?.length ? mergeById(moduleRecordsRef.current.Tasks, taskRecords) : moduleRecordsRef.current.Tasks,
          Notes: noteRecords?.length ? mergeById(moduleRecordsRef.current.Notes, noteRecords) : moduleRecordsRef.current.Notes,
          Opportunities: opportunityRecords?.length ? mergeById(moduleRecordsRef.current.Opportunities, opportunityRecords) : moduleRecordsRef.current.Opportunities,
          Deals: dealRecords?.length ? mergeById(moduleRecordsRef.current.Deals, dealRecords) : moduleRecordsRef.current.Deals,
          Leads: leadRecords?.length ? mergeById(moduleRecordsRef.current.Leads, leadRecords) : moduleRecordsRef.current.Leads,
          Meetings: meetingRecords?.length ? mergeById(moduleRecordsRef.current.Meetings, meetingRecords) : moduleRecordsRef.current.Meetings,
          Projects: projectRecords?.length ? mergeById(moduleRecordsRef.current.Projects, projectRecords) : moduleRecordsRef.current.Projects,
          Files: fileRecords?.length ? mergeById(moduleRecordsRef.current.Files, fileRecords) : moduleRecordsRef.current.Files,
        };

        moduleRecordsRef.current = mergedRecords;
        setPeople(mergedRecords.People);
        setTasks(mergedRecords.Tasks);
        setNotes(mergedRecords.Notes);
        setOpportunities(mergedRecords.Opportunities);
        setDeals(mergedRecords.Deals);
        setLeads(mergedRecords.Leads);
        setMeetings(mergedRecords.Meetings);
        setProjects(mergedRecords.Projects);
        setFiles(mergedRecords.Files);
        saveLocalCrmSnapshot(mergedRecords);

        const hasAnyRecords = Object.values(records).some((items) => Array.isArray(items) && items.length > 0);
        if (!hasAnyRecords) {
          void saveAllModuleRecords(moduleRecordsRef.current);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setRecordsLoaded(true);
          setSyncStatus((current) => current.state === 'loading' ? { state: 'local', message: 'Saved locally' } : current);
        }
      });

    return () => { cancelled = true; };
  }, [isSignedIn]);

  useEffect(() => {
    moduleRecordsRef.current = {
      People: people,
      Tasks: tasks,
      Notes: notes,
      Opportunities: opportunities,
      Deals: deals,
      Leads: leads,
      Meetings: meetings,
      Projects: projects,
      Files: files,
    };
    saveLocalCrmSnapshot(moduleRecordsRef.current);
    setSyncStatus({ state: isSupabaseConfigured ? 'local' : 'saved', message: isSupabaseConfigured ? 'Saved locally' : 'Saved locally' });
    if (!isSignedIn || !recordsLoaded) return;
    const timer = window.setTimeout(() => {
      setSyncStatus({ state: 'loading', message: 'Syncing CRM records' });
      void saveAllModuleRecords(moduleRecordsRef.current)
        .then(() => setSyncStatus({ state: 'saved', message: 'All changes saved' }))
        .catch(() => setSyncStatus({ state: 'error', message: 'Database sync failed' }));
    }, 500);

    return () => window.clearTimeout(timer);
  }, [deals, files, isSignedIn, leads, meetings, notes, opportunities, people, projects, recordsLoaded, tasks]);

  useEffect(() => {
    localStorage.setItem('digital-wave-saved-filters', JSON.stringify(savedFilters));
  }, [savedFilters]);

  useEffect(() => {
    const flushLocalRecords = () => {
      saveLocalCrmSnapshot({
        companies: companiesRef.current,
        ...moduleRecordsRef.current,
      });
    };

    window.addEventListener('beforeunload', flushLocalRecords);
    return () => {
      flushLocalRecords();
      window.removeEventListener('beforeunload', flushLocalRecords);
    };
  }, []);

  const [crudModal, setCrudModal] = useState<{ type: string; item?: CrudEntity } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; item: CrudEntity } | null>(null);
  const [crudSaving, setCrudSaving] = useState(false);
  const [crudError, setCrudError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const personFields: CrudField[] = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'title', label: 'Job Title' },
    { key: 'company', label: 'Company' },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Lead', 'Customer', 'Inactive'] },
    { key: 'tags', label: 'Tags', placeholder: 'comma,separated,tags' },
  ];

  const taskFields: CrudField[] = [
    { key: 'title', label: 'Title', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['Todo', 'In Progress', 'Done', 'Cancelled'] },
    { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'assignee', label: 'Assignee' },
    { key: 'tags', label: 'Tags', placeholder: 'comma,separated,tags' },
  ];

  const noteFields: CrudField[] = [
    { key: 'title', label: 'Title', required: true },
    { key: 'content', label: 'Content', type: 'textarea', required: true },
    { key: 'category', label: 'Category', type: 'select', options: ['General', 'Meeting', 'Idea', 'Feedback'] },
  ];

  const opportunityFields: CrudField[] = [
    { key: 'name', label: 'Opportunity Name', required: true },
    { key: 'company', label: 'Company' },
    { key: 'value', label: 'Value ($)', type: 'number' },
    { key: 'stage', label: 'Stage', type: 'select', options: ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
    { key: 'probability', label: 'Probability (%)', type: 'number' },
    { key: 'closeDate', label: 'Close Date', type: 'date' },
    { key: 'owner', label: 'Owner' },
  ];

  const dealFields: CrudField[] = [
    { key: 'name', label: 'Deal Name', required: true },
    { key: 'company', label: 'Company' },
    { key: 'value', label: 'Value ($)', type: 'number' },
    { key: 'stage', label: 'Stage', type: 'select', options: ['Qualification', 'Demo', 'Proposal', 'Negotiation', 'Closed'] },
    { key: 'closeDate', label: 'Close Date', type: 'date' },
    { key: 'owner', label: 'Owner' },
  ];

  const leadFields: CrudField[] = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'company', label: 'Company' },
    { key: 'source', label: 'Source', type: 'select', options: ['Website', 'Referral', 'Cold Call', 'Conference', 'Other'] },
    { key: 'status', label: 'Status', type: 'select', options: ['New', 'Contacted', 'Qualified', 'Disqualified'] },
    { key: 'score', label: 'Score', type: 'number' },
    { key: 'owner', label: 'Owner' },
  ];

  const meetingFields: CrudField[] = [
    { key: 'title', label: 'Title', required: true },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'duration', label: 'Duration (minutes)', type: 'number' },
    { key: 'attendees', label: 'Attendees' },
    { key: 'location', label: 'Location' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const projectFields: CrudField[] = [
    { key: 'name', label: 'Project Name', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'] },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' },
    { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
    { key: 'budget', label: 'Budget ($)', type: 'number' },
  ];

  const fileFields: CrudField[] = [
    { key: 'name', label: 'File Name', required: true },
    { key: 'type', label: 'Type', type: 'select', options: ['Proposal', 'Contract', 'Security', 'Invoice', 'Recording', 'Other'] },
    { key: 'size', label: 'Size' },
    { key: 'owner', label: 'Owner' },
    { key: 'uploadedAt', label: 'Uploaded At', type: 'date' },
    { key: 'tags', label: 'Tags' },
    { key: 'companyId', label: 'Company ID' },
    { key: 'dealId', label: 'Deal ID' },
  ];

  const companyFields: CrudField[] = [
    { key: 'name', label: 'Company Name', required: true },
    { key: 'domain', label: 'Domain' },
    { key: 'employees', label: 'Employees', type: 'number' },
    { key: 'owner', label: 'Owner' },
    { key: 'linkedin', label: 'LinkedIn URL' },
  ];

  const entityConfigs: Record<string, EntityConfig> = useMemo(() => ({
    People: {
      fields: personFields,
      empty: () => ({ name: '', email: '', phone: '', title: '', company: '', address: '', notes: '', status: 'Active', tags: '' }),
      toItem: (d, id) => ({ id, label: d.name || 'Unnamed', detail: d.title ? `${d.title}${d.company ? ` at ${d.company}` : ''}` : d.company || 'New person' }),
      toEntity: (d, id) => ({ id, ...d }) as unknown as CrudEntity,
      fromEntity: (item) => {
        const p = item as CrmPerson;
        return { name: p.name || '', email: p.email || '', phone: p.phone || '', title: p.title || '', company: p.company || '', address: p.address || '', notes: p.notes || '', status: p.status || 'Active', tags: p.tags || '' };
      },
      setter: (items) => setPeople(items as CrmPerson[]),
    },
    Tasks: {
      fields: taskFields,
      empty: () => ({ title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', assignee: '', tags: '' }),
      toItem: (d, id) => ({ id, label: d.title || 'Untitled', detail: `${d.priority || 'Medium'} priority${d.dueDate ? ` - Due ${d.dueDate}` : ''}` }),
      toEntity: (d, id) => ({ id, ...d }) as unknown as CrudEntity,
      fromEntity: (item) => {
        const t = item as CrmTask;
        return { title: t.title || '', description: t.description || '', status: t.status || 'Todo', priority: t.priority || 'Medium', dueDate: t.dueDate || '', assignee: t.assignee || '', tags: t.tags || '' };
      },
      setter: (items) => setTasks(items as CrmTask[]),
    },
    Notes: {
      fields: noteFields,
      empty: () => ({ title: '', content: '', category: 'General' }),
      toItem: (d, id) => ({ id, label: d.title || 'Untitled note', detail: `${d.category || 'General'} note` }),
      toEntity: (d, id) => ({ id, ...d }) as unknown as CrudEntity,
      fromEntity: (item) => {
        const n = item as CrmNote;
        return { title: n.title || '', content: n.content || '', category: n.category || 'General' };
      },
      setter: (items) => setNotes(items as CrmNote[]),
    },
    Opportunities: {
      fields: opportunityFields,
      empty: () => ({ name: '', company: '', value: '', stage: 'Discovery', probability: '', closeDate: '', owner: '' }),
      toItem: (d, id) => ({ id, label: d.name || 'Untitled', detail: d.value ? `$${Number(d.value).toLocaleString()} - ${d.stage || 'Discovery'}` : d.stage || 'New opportunity' }),
      toEntity: (d, id) => ({ id, ...d }) as unknown as CrudEntity,
      fromEntity: (item) => {
        const o = item as CrmOpportunity;
        return { name: o.name || '', company: o.company || '', value: o.value || '', stage: o.stage || 'Discovery', probability: o.probability || '', closeDate: o.closeDate || '', owner: o.owner || '' };
      },
      setter: (items) => setOpportunities(items as CrmOpportunity[]),
    },
    Deals: {
      fields: dealFields,
      empty: () => ({ name: '', company: '', value: '', stage: 'Qualification', closeDate: '', owner: '' }),
      toItem: (d, id) => ({ id, label: d.name || 'Untitled', detail: d.value ? `$${Number(d.value).toLocaleString()} - ${d.stage || 'Qualification'}` : d.stage || 'New deal' }),
      toEntity: (d, id) => ({ id, ...d }) as unknown as CrudEntity,
      fromEntity: (item) => {
        const d = item as CrmDeal;
        return { name: d.name || '', company: d.company || '', value: d.value || '', stage: d.stage || 'Qualification', closeDate: d.closeDate || '', owner: d.owner || '' };
      },
      setter: (items) => setDeals(items as CrmDeal[]),
    },
    Leads: {
      fields: leadFields,
      empty: () => ({ name: '', email: '', company: '', source: 'Website', status: 'New', score: '', owner: '' }),
      toItem: (d, id) => ({ id, label: d.name || 'Unnamed', detail: `${d.company || 'No company'} - ${d.status || 'New'} - Score: ${d.score || '-'}` }),
      toEntity: (d, id) => ({ id, ...d }) as unknown as CrudEntity,
      fromEntity: (item) => {
        const l = item as CrmLead;
        return { name: l.name || '', email: l.email || '', company: l.company || '', source: l.source || 'Website', status: l.status || 'New', score: l.score || '', owner: l.owner || '' };
      },
      setter: (items) => setLeads(items as CrmLead[]),
    },
    Meetings: {
      fields: meetingFields,
      empty: () => ({ title: '', date: '', duration: '60', attendees: '', location: '', notes: '' }),
      toItem: (d, id) => ({ id, label: d.title || 'Untitled', detail: `${d.date || 'No date'}${d.duration ? ` - ${d.duration}min` : ''}` }),
      toEntity: (d, id) => ({ id, ...d }) as unknown as CrudEntity,
      fromEntity: (item) => {
        const m = item as CrmMeeting;
        return { title: m.title || '', date: m.date || '', duration: m.duration || '60', attendees: m.attendees || '', location: m.location || '', notes: m.notes || '' };
      },
      setter: (items) => setMeetings(items as CrmMeeting[]),
    },
    Projects: {
      fields: projectFields,
      empty: () => ({ name: '', description: '', status: 'Planning', startDate: '', endDate: '', priority: 'Medium', budget: '' }),
      toItem: (d, id) => ({ id, label: d.name || 'Untitled', detail: `${d.status || 'Planning'} - ${d.priority || 'Medium'} priority` }),
      toEntity: (d, id) => ({ id, ...d }) as unknown as CrudEntity,
      fromEntity: (item) => {
        const p = item as CrmProject;
        return { name: p.name || '', description: p.description || '', status: p.status || 'Planning', startDate: p.startDate || '', endDate: p.endDate || '', priority: p.priority || 'Medium', budget: p.budget || '' };
      },
      setter: (items) => setProjects(items as CrmProject[]),
    },
    Files: {
      fields: fileFields,
      empty: () => ({ name: '', type: 'Other', size: '', owner: '', uploadedAt: new Date().toISOString().slice(0, 10), tags: '', companyId: '', dealId: '' }),
      toItem: (d, id) => ({ id, label: d.name || 'Untitled file', detail: `${d.type || 'File'} - ${d.size || 'No size'} - ${d.uploadedAt || 'No date'}` }),
      toEntity: (d, id) => ({ id, ...d }) as unknown as CrudEntity,
      fromEntity: (item) => {
        const f = item as CrmFile;
        return { name: f.name || '', type: f.type || 'Other', size: f.size || '', owner: f.owner || '', uploadedAt: f.uploadedAt || '', tags: f.tags || '', companyId: f.companyId || '', dealId: f.dealId || '' };
      },
      setter: (items) => setFiles(items as CrmFile[]),
    },
  }), []);

  const moduleItems: Record<string, ModuleItem[]> = useMemo(() => ({
    People: people.map((p) => ({ id: p.id, label: p.name, detail: p.title ? `${p.title}${p.company ? ` at ${p.company}` : ''}` : p.company || 'No details' })),
    Tasks: tasks.map((t) => ({ id: t.id, label: t.title, detail: `${t.priority} priority${t.dueDate ? ` - Due ${t.dueDate}` : ''}` })),
    Notes: notes.map((n) => ({ id: n.id, label: n.title, detail: `${n.category} - Created just now` })),
    Opportunities: opportunities.map((o) => ({ id: o.id, label: o.name, detail: o.value ? `$${Number(o.value).toLocaleString()} - ${o.stage}` : o.stage })),
    Deals: deals.map((d) => ({ id: d.id, label: d.name, detail: d.value ? `$${Number(d.value).toLocaleString()} - ${d.stage}` : d.stage })),
    Leads: leads.map((l) => ({ id: l.id, label: l.name, detail: `${l.company} - ${l.status} - Score: ${l.score || '-'}` })),
    Meetings: meetings.map((m) => ({ id: m.id, label: m.title, detail: `${m.date || 'No date'}${m.duration ? ` - ${m.duration}min` : ''}` })),
    Projects: projects.map((pr) => ({ id: pr.id, label: pr.name, detail: `${pr.status} - ${pr.priority} priority` })),
    Files: files.map((f) => ({ id: f.id, label: f.name, detail: `${f.type} - ${f.size || 'No size'} - ${f.uploadedAt || 'No date'}` })),
  }), [people, tasks, notes, opportunities, deals, leads, meetings, projects, files]);

  const visibleCompanies = useMemo(() =>
    companies
      .filter((c) => !employeeFilter || Number(c.employees || 0) >= 1000)
      .filter((c) => [c.name, c.domain, c.createdBy, c.createdAt].join(' ').toLowerCase().includes(query.toLowerCase())),
    [companies, employeeFilter, query],
  );

  const allSelected = visibleCompanies.length > 0 && visibleCompanies.every((c) => selectedIds.includes(c.id));
  const maxEmployees = Math.max(...companies.map((c) => Number(c.employees || 0)));
  const totalEmployees = companies.reduce((sum, company) => sum + Number(company.employees || 0), 0);
  const activeDeals = deals.filter((deal) => !/closed lost/i.test(deal.stage)).length;
  const totalDealValue = deals.reduce((sum, deal) => sum + Number(String(deal.value || '').replace(/[^0-9.-]/g, '')), 0);
  const openLeads = leads.filter((lead) => lead.status !== 'Converted').length;
  const qualifiedLeads = leads.filter((lead) => /qualified/i.test(lead.status)).length;
  const convertedLeads = leads.filter((lead) => /converted/i.test(lead.status)).length;
  const customerCount = people.filter((person) => /customer/i.test(person.status)).length;
  const vendorCount = people.filter((person) => /vendor/i.test(person.status)).length;
  const inactivePeople = people.filter((person) => /inactive/i.test(person.status)).length;
  const formatCurrency = (value: number) => value >= 1000000 ? `$${(value / 1000000).toFixed(2)}M` : `$${value.toLocaleString()}`;
  const companyKpis: KpiItem[] = [
    { label: 'Total Companies', value: companies.length.toLocaleString(), trend: '+ 20% vs last month', icon: Building2, tone: 'rgba(91,77,245,0.14)' },
    { label: 'Total Employees', value: totalEmployees.toLocaleString(), trend: '+ 18% vs last month', icon: Users, tone: 'rgba(59,130,246,0.14)' },
    { label: 'Active Deals', value: activeDeals.toLocaleString(), trend: '+ 12% vs last month', icon: Target, tone: 'rgba(34,197,94,0.14)' },
    { label: 'Total Revenue', value: formatCurrency(totalDealValue), trend: '+ 25% vs last month', icon: DollarSign, tone: 'rgba(249,115,22,0.14)' },
  ];
  const peopleKpis: KpiItem[] = [
    { label: 'Total People', value: people.length.toLocaleString(), trend: '+ 18.2% vs last month', icon: Users, tone: 'rgba(91,77,245,0.14)' },
    { label: 'Customers', value: customerCount.toLocaleString(), trend: '+ 14.5% vs last month', icon: Building2, tone: 'rgba(59,130,246,0.14)' },
    { label: 'Vendors', value: vendorCount.toLocaleString(), trend: '+ 6.3% vs last month', icon: UserRound, tone: 'rgba(249,115,22,0.14)' },
    { label: 'Inactive', value: inactivePeople.toLocaleString(), trend: '- 8.1% vs last month', icon: Heart, tone: 'rgba(236,72,153,0.14)' },
  ];
  const leadKpis: KpiItem[] = [
    { label: 'Total Leads', value: leads.length.toLocaleString(), trend: '+ 22.1% vs last month', icon: Users, tone: 'rgba(91,77,245,0.14)' },
    { label: 'New Leads', value: openLeads.toLocaleString(), trend: '+ 18.7% vs last month', icon: Building2, tone: 'rgba(59,130,246,0.14)' },
    { label: 'Qualified', value: qualifiedLeads.toLocaleString(), trend: '+ 15.3% vs last month', icon: Target, tone: 'rgba(249,115,22,0.14)' },
    { label: 'Converted', value: convertedLeads.toLocaleString(), trend: '+ 12.5% vs last month', icon: Check, tone: 'rgba(34,197,94,0.14)' },
  ];

  const closeTopmost = useCallback(() => {
    if (deleteConfirm) { setDeleteConfirm(null); return true; }
    if (crudModal) { setCrudModal(null); return true; }
    if (commandOpen) { setCommandOpen(false); return true; }
    if (chatOpen) { setChatOpen(false); return true; }
    if (menuOpen) { setMenuOpen(null); return true; }
    return false;
  }, [deleteConfirm, crudModal, commandOpen, chatOpen, menuOpen]);

  const handleNavigate = useCallback((module: string, id?: string) => {
    setActiveModule(module);
    if (!id) return;
    const collections: Record<string, CrudEntity[]> = {
      Companies: companies,
      People: people,
      Tasks: tasks,
      Notes: notes,
      Opportunities: opportunities,
      Deals: deals,
      Leads: leads,
      Meetings: meetings,
      Projects: projects,
      Files: files,
    };
    const item = collections[module]?.find((record) => (record as { id: string }).id === id);
    if (item) setDetailRecord({ type: module, item });
  }, [companies, deals, files, leads, meetings, notes, opportunities, people, projects, tasks]);

  const keyMap: Record<string, () => void> = {
    'ctrl+k': () => setSearchOpen(true),
    escape: closeTopmost,
  };
  useKeyboard(keyMap);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((i) => i !== id) : [...current, id]);
  }, []);

  const createCompany = useCallback(() => {
    if (!permissions.canCreate) {
      setLastAction('You do not have permission to create companies');
      audit('create_blocked', 'Companies', 'New company', 'blocked');
      return;
    }
    setCrudError('');
    setFieldErrors({});
    setCrudModal({ type: 'Companies', item: undefined });
    setActiveModule('Companies');
  }, [permissions.canCreate]);

  const exportView = useCallback(() => {
    if (!permissions.canExport) {
      setLastAction('You do not have permission to export CRM data');
      audit('export_blocked', 'Companies', 'Companies view', 'blocked');
      return;
    }
    const blob = new Blob([JSON.stringify(visibleCompanies, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'companies-view.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setLastAction('Companies exported');
    audit('export', 'Companies', 'Companies view');
  }, [audit, permissions.canExport, visibleCompanies]);

  const exportAllData = useCallback(() => {
    if (!permissions.canExport) {
      setLastAction('You do not have permission to export CRM data');
      audit('export_blocked', 'CRM', 'All CRM data', 'blocked');
      return;
    }
    const payload = {
      exportedAt: new Date().toISOString(),
      companies,
      people,
      tasks,
      notes,
      opportunities,
      deals,
      leads,
      meetings,
      projects,
      files,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'digital-wave-crm-export.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setLastAction('CRM data exported');
    audit('export', 'CRM', 'All CRM data');
  }, [audit, companies, deals, files, leads, meetings, notes, opportunities, people, projects, tasks, permissions.canExport]);

  const handleCsvImport = useCallback((target: ImportTarget, rows: Array<Record<string, string>>) => {
    if (!permissions.canCreate) {
      setLastAction('You do not have permission to import CRM records');
      audit('import_blocked', target, `${rows.length} rows`, 'blocked');
      return { created: 0, skipped: rows.length, duplicates: rows.map((row) => row.name || row.email || 'Permission denied') };
    }
    const duplicates: string[] = [];
    let created = 0;
    const before = { companies, people, tasks, notes, opportunities, deals, leads, meetings, projects, files };
    const rollback = () => {
      setCompanies(before.companies);
      setPeople(before.people);
      setTasks(before.tasks);
      setNotes(before.notes);
      setOpportunities(before.opportunities);
      setDeals(before.deals);
      setLeads(before.leads);
      setMeetings(before.meetings);
      setProjects(before.projects);
      setFiles(before.files);
      setLastAction(`Rolled back ${target} import`);
      audit('rollback_import', target, `${rows.length} rows`);
    };

    if (target === 'Companies') {
      const existingKeys = new Set(companies.flatMap((company) => [company.domain.toLowerCase(), company.name.toLowerCase()].filter(Boolean)));
      const imported: CompanyTableRow[] = [];
      for (const row of rows) {
        const name = row.name || row.company || row['Company Name'] || '';
        const domain = row.domain || row.website || '';
        const key = (domain || name).toLowerCase();
        if (!name || existingKeys.has(key)) {
          duplicates.push(name || domain || 'Unnamed company');
          continue;
        }
        existingKeys.add(key);
        created += 1;
        imported.push({
          id: genId(),
          name,
          domain,
          createdBy: 'CSV Import',
          owner: row.owner || '',
          createdAt: 'Just now',
          employees: row.employees ? Number(row.employees) || '' : '',
          linkedin: row.linkedin || '',
          color: 'bg-blue-600',
          icon: name.slice(0, 1).toUpperCase() || 'C',
        });
      }
      if (imported.length > 0) setCompanies((current) => [...imported, ...current]);
      setActiveModule('Companies');
    } else if (target === 'People') {
      const existingEmails = new Set(people.map((person) => person.email.toLowerCase()).filter(Boolean));
      const imported: CrmPerson[] = [];
      for (const row of rows) {
        const name = row.name || row['Full Name'] || '';
        const email = row.email || '';
        if (!name || (email && existingEmails.has(email.toLowerCase()))) {
          duplicates.push(name || email || 'Unnamed person');
          continue;
        }
        if (email) existingEmails.add(email.toLowerCase());
        created += 1;
        imported.push({
          id: genId(),
          name,
          email,
          phone: row.phone || '',
          title: row.title || '',
          company: row.company || '',
          address: row.address || '',
          notes: row.notes || '',
          status: row.status || 'Active',
          tags: row.tags || '',
        });
      }
      if (imported.length > 0) setPeople((current) => [...imported, ...current]);
      setActiveModule('People');
    } else if (target === 'Leads') {
      const existingEmails = new Set(leads.map((lead) => lead.email.toLowerCase()).filter(Boolean));
      const imported: CrmLead[] = [];
      for (const row of rows) {
        const name = row.name || '';
        const email = row.email || '';
        if (!name || (email && existingEmails.has(email.toLowerCase()))) { duplicates.push(name || email || 'Unnamed lead'); continue; }
        if (email) existingEmails.add(email.toLowerCase());
        created += 1;
        imported.push({ id: genId(), name, email, company: row.company || '', source: row.source || 'Other', status: row.status || 'New', score: row.score || '', owner: row.owner || '' });
      }
      if (imported.length > 0) setLeads((current) => [...imported, ...current]);
      setActiveModule('Leads');
    } else if (target === 'Deals') {
      const imported: CrmDeal[] = [];
      for (const row of rows) {
        const name = row.name || '';
        if (!name) { duplicates.push(row.company || 'Unnamed deal'); continue; }
        created += 1;
        imported.push({ id: genId(), name, company: row.company || '', value: row.value || '', stage: row.stage || 'Qualification', closeDate: row.closeDate || '', owner: row.owner || '' });
      }
      if (imported.length > 0) setDeals((current) => [...imported, ...current]);
      setActiveModule('Deals');
    } else if (target === 'Tasks') {
      const imported = rows.map((row) => ({ id: genId(), title: row.title || 'Untitled task', description: row.description || '', status: row.status || 'Todo', priority: row.priority || 'Medium', dueDate: row.dueDate || '', assignee: row.assignee || '', tags: row.tags || '' }));
      created = imported.length;
      setTasks((current) => [...imported, ...current]);
      setActiveModule('Tasks');
    } else if (target === 'Notes') {
      const imported = rows.map((row) => ({ id: genId(), title: row.title || 'Untitled note', content: row.content || '', category: row.category || 'General', companyId: companies.find((company) => company.name.toLowerCase() === (row.company || '').toLowerCase())?.id }));
      created = imported.length;
      setNotes((current) => [...imported, ...current]);
      setActiveModule('Notes');
    } else if (target === 'Meetings') {
      const imported = rows.map((row) => ({ id: genId(), title: row.title || 'Untitled meeting', date: row.date || '', duration: row.duration || '60', attendees: row.attendees || '', location: row.location || '', notes: row.notes || '' }));
      created = imported.length;
      setMeetings((current) => [...imported, ...current]);
      setActiveModule('Meetings');
    } else if (target === 'Files') {
      const imported = rows.map((row) => ({ id: genId(), name: row.name || 'Untitled file', type: row.type || 'Other', size: row.size || '', owner: row.owner || '', uploadedAt: row.uploadedAt || new Date().toISOString().slice(0, 10), tags: row.tags || '', companyId: companies.find((company) => company.name.toLowerCase() === (row.company || '').toLowerCase())?.id }));
      created = imported.length;
      setFiles((current) => [...imported, ...current]);
      setActiveModule('Files');
    }

    setLastAction(`Imported ${created} ${target.toLowerCase()}`);
    audit('import', target, `${created} rows`);
    return { created, skipped: duplicates.length, duplicates, rollback };
  }, [audit, companies, deals, files, leads, meetings, notes, opportunities, people, permissions.canCreate, projects, tasks]);

  const handleExecuteAction = useCallback((result: ExecuteResult) => {
    if (!result.success) { setLastAction(result.message); return; }
    switch (result.action) {
      case 'create_company':
        if (!permissions.canCreate) { setLastAction('You do not have permission to create companies'); audit('ai_create_blocked', 'Companies', 'AI command', 'blocked'); return; }
        if (result.data) { setCompanies((prev) => [result.data as CompanyTableRow, ...prev]); setActiveModule('Companies'); }
        audit('ai_create', 'Companies', String((result.data as CompanyTableRow | undefined)?.name || 'AI company'));
        break;
      case 'delete_company':
        if (!permissions.canDelete) { setLastAction('You do not have permission to delete companies'); audit('ai_delete_blocked', 'Companies', 'AI command', 'blocked'); return; }
        if (result.data) { setCompanies((prev) => prev.filter((c) => c.id !== (result.data as { id: string }).id)); }
        audit('ai_delete', 'Companies', String((result.data as { name?: string } | undefined)?.name || 'AI company'));
        break;
      case 'assign_owner':
        if (!permissions.canEdit) { setLastAction('You do not have permission to assign owners'); audit('ai_assign_blocked', 'Companies', 'AI command', 'blocked'); return; }
        if (result.data) { const d = result.data as { companyId: string; owner: string }; setCompanies((prev) => prev.map((c) => c.id === d.companyId ? { ...c, owner: d.owner } : c)); }
        audit('ai_assign_owner', 'Companies', 'AI command');
        break;
      case 'filter': if (result.data) setEmployeeFilter(true); break;
      case 'export': exportView(); break;
    }
    setLastAction(result.message);
  }, [audit, exportView, permissions.canCreate, permissions.canDelete, permissions.canEdit]);

  const handleQuickAdd = useCallback((type: QuickAddType, data: Record<string, string>) => {
    switch (type) {
      case 'Person':
        setPeople((prev) => [...prev, { id: genId(), name: data.name || 'Unnamed', email: data.email || '', phone: '', title: data.title || '', company: data.company || '', address: '', notes: '', status: 'Active', tags: '' }]);
        setActiveModule('People');
        break;
      case 'Task':
        setTasks((prev) => [...prev, { id: genId(), title: data.title || 'Untitled', description: '', status: 'Todo', priority: data.priority || 'Medium', dueDate: data.dueDate || '', assignee: '', tags: '' }]);
        setActiveModule('Tasks');
        break;
      case 'Note':
        setNotes((prev) => [...prev, { id: genId(), title: data.title || 'Untitled note', content: data.content || '', category: 'General' }]);
        setActiveModule('Notes');
        break;
    }
    setLastAction(`${type} added via quick action`);
    setQuickAddType(null);
  }, []);

  const openAdd = useCallback((type: string) => {
    if (!permissions.canCreate) {
      setLastAction(`You do not have permission to create ${type.toLowerCase()}`);
      audit('create_blocked', type, `New ${type}`, 'blocked');
      return;
    }
    setCrudError('');
    setFieldErrors({});
    setCrudModal({ type, item: undefined });
  }, [audit, permissions.canCreate]);

  const openEdit = useCallback((type: string, item: CrudEntity) => {
    if (!permissions.canEdit) {
      setLastAction(`You do not have permission to edit ${type.toLowerCase()}`);
      audit('edit_blocked', type, String((item as { name?: string; title?: string }).name || (item as { title?: string }).title || 'Record'), 'blocked');
      return;
    }
    setCrudError('');
    setFieldErrors({});
    setCrudModal({ type, item });
  }, [audit, permissions.canEdit]);

  const requestDelete = useCallback((type: string, item: CrudEntity) => {
    if (!permissions.canDelete) {
      setLastAction(`You do not have permission to delete ${type.toLowerCase()}`);
      audit('delete_blocked', type, String((item as { name?: string; title?: string }).name || (item as { title?: string }).title || 'Record'), 'blocked');
      return;
    }
    setDeleteConfirm({ type, item });
  }, [audit, permissions.canDelete]);

  const handleCrudSave = useCallback((data: Record<string, string>) => {
    if (!crudModal) return;
    const { type, item } = crudModal;
    const config = entityConfigs[type];
    if (!config) return;
    if (item && !permissions.canEdit) { setCrudError('You do not have permission to edit this record'); audit('edit_blocked', type, 'Record', 'blocked'); return; }
    if (!item && !permissions.canCreate) { setCrudError('You do not have permission to create records'); audit('create_blocked', type, 'Record', 'blocked'); return; }

    const result = validateForm(type, data, config.fields);
    if (!result.valid) { setFieldErrors(result.errors); return; }
    setFieldErrors({});

    setCrudSaving(true);
    setCrudError('');

    setTimeout(() => {
      if (item) {
        const updated = config.fromEntity(item);
        const merged = { ...updated, ...data };
        const entity = config.toEntity(merged, (item as { id: string }).id);
        config.setter((prev: CrudEntity[]) => prev.map((p) => ((p as { id: string }).id === (item as { id: string }).id) ? entity : p));
        setLastAction(`${type} updated`);
        audit('update', type, String(data.name || data.title || 'Record'));
      } else {
        const id = genId();
        const entity = config.toEntity(data, id);
        config.setter((prev: CrudEntity[]) => [entity, ...prev]);
        setLastAction(`${type} created`);
        audit('create', type, String(data.name || data.title || 'Record'));
      }
      setCrudSaving(false);
      setCrudModal(null);
    }, 200);
  }, [audit, crudModal, entityConfigs, permissions.canCreate, permissions.canEdit]);

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
    if (!permissions.canDelete) {
      setLastAction(`You do not have permission to delete ${deleteConfirm.type.toLowerCase()}`);
      audit('delete_blocked', deleteConfirm.type, 'Record', 'blocked');
      setDeleteConfirm(null);
      return;
    }
    const { type, item } = deleteConfirm;
    const id = (item as { id: string }).id;

    switch (type) {
      case 'People': setPeople((prev) => prev.filter((p) => p.id !== id)); break;
      case 'Tasks': setTasks((prev) => prev.filter((t) => t.id !== id)); break;
      case 'Notes': setNotes((prev) => prev.filter((n) => n.id !== id)); break;
      case 'Opportunities': setOpportunities((prev) => prev.filter((o) => o.id !== id)); break;
      case 'Deals': setDeals((prev) => prev.filter((d) => d.id !== id)); break;
      case 'Leads': setLeads((prev) => prev.filter((l) => l.id !== id)); break;
      case 'Meetings': setMeetings((prev) => prev.filter((m) => m.id !== id)); break;
      case 'Projects': setProjects((prev) => prev.filter((pr) => pr.id !== id)); break;
      case 'Files': setFiles((prev) => prev.filter((f) => f.id !== id)); break;
      case 'Companies': setCompanies((prev) => prev.filter((c) => c.id !== id)); break;
    }
    setLastAction(`${type.slice(0, -1) || type} deleted`);
    audit('delete', type, String((item as { name?: string; title?: string }).name || (item as { title?: string }).title || 'Record'));
    setDeleteConfirm(null);
  }, [audit, deleteConfirm, permissions.canDelete]);

  const handleDuplicate = useCallback((type: string, item: CrudEntity) => {
    if (!permissions.canCreate) {
      setLastAction(`You do not have permission to duplicate ${type.toLowerCase()}`);
      audit('duplicate_blocked', type, String((item as { name?: string; title?: string }).name || (item as { title?: string }).title || 'Record'), 'blocked');
      return;
    }
    const config = entityConfigs[type];
    if (!config) return;
    const id = genId();
    const data = config.fromEntity(item);
    const entity = config.toEntity(data, id);
    config.setter((prev: CrudEntity[]) => [entity, ...prev]);
    setLastAction(`${type.slice(0, -1) || type} duplicated`);
    audit('duplicate', type, String(data.name || data.title || 'Record'));
  }, [audit, entityConfigs, permissions.canCreate]);

  const handleCompanyEdit = useCallback((company: CompanyTableRow) => {
    setCrudError('');
    setFieldErrors({});
    setCrudModal({ type: 'Companies', item: company });
  }, []);

  const openDetail = useCallback((type: string, item: CrudEntity) => {
    setDetailRecord({ type, item });
  }, []);

  const handleCompanyDelete = useCallback((company: CompanyTableRow) => {
    setDeleteConfirm({ type: 'Companies', item: company });
  }, []);

  const handleCompanyDuplicate = useCallback((company: CompanyTableRow) => {
    const newCompany: CompanyTableRow = {
      ...company,
      id: `new-${Date.now()}`,
      name: `${company.name} (copy)`,
      createdAt: 'Just now',
    };
    setCompanies((prev) => [newCompany, ...prev]);
    setLastAction('Company duplicated');
  }, []);

  const saveCurrentFilter = useCallback(() => {
    const name = query || (employeeFilter ? 'Companies over 1K employees' : 'All companies');
    setSavedFilters((current) => [{ id: genId(), name, query, employeeFilter }, ...current].slice(0, 8));
    setLastAction('Saved filter created');
    audit('save_filter', 'Companies', name);
  }, [audit, employeeFilter, query]);

  const applySavedFilter = useCallback((filterId: string) => {
    const filter = savedFilters.find((item) => item.id === filterId);
    if (!filter) return;
    setQuery(filter.query);
    setEmployeeFilter(filter.employeeFilter);
    setLastAction(`Applied saved filter: ${filter.name}`);
  }, [savedFilters]);

  const mergeSelectedCompanies = useCallback(() => {
    if (selectedIds.length < 2) {
      setLastAction('Select at least two companies to merge');
      return;
    }
    if (!permissions.canEdit || !permissions.canDelete) {
      setLastAction('You do not have permission to merge companies');
      audit('merge_blocked', 'Companies', `${selectedIds.length} selected`, 'blocked');
      return;
    }

    setCompanies((current) => {
      const selected = current.filter((company) => selectedIds.includes(company.id));
      const primary = selected[0];
      if (!primary) return current;
      const merged: CompanyTableRow = {
        ...primary,
        employees: selected.reduce((max, company) => Math.max(max, Number(company.employees || 0)), 0) || primary.employees,
        linkedin: primary.linkedin || selected.find((company) => company.linkedin)?.linkedin || '',
        owner: primary.owner || selected.find((company) => company.owner)?.owner || '',
        createdAt: 'Merged just now',
      };
      const mergedNames = new Set(selected.map((company) => company.id));
      return [merged, ...current.filter((company) => !mergedNames.has(company.id))];
    });
    setSelectedIds([]);
    setLastAction('Selected companies merged');
    audit('merge', 'Companies', `${selectedIds.length} companies`);
  }, [audit, permissions.canDelete, permissions.canEdit, selectedIds]);

  const moveDealStage = useCallback((dealId: string, stage: string) => {
    setDeals((current) => current.map((deal) => deal.id === dealId ? { ...deal, stage } : deal));
    setLastAction(`Deal moved to ${stage}`);
    audit('move_stage', 'Deals', stage);
  }, [audit]);

  const convertLead = useCallback((lead: CrmLead) => {
    if (!permissions.canCreate || !permissions.canEdit) {
      setLastAction('You do not have permission to convert leads');
      audit('convert_lead_blocked', 'Leads', lead.name, 'blocked');
      return;
    }

    const existingCompany = companies.find((company) => company.name.toLowerCase() === lead.company.toLowerCase());
    const companyId = existingCompany?.id || genId();
    const contactId = genId();
    const dealId = genId();

    if (!existingCompany) {
      setCompanies((current) => [{
        id: companyId,
        name: lead.company || `${lead.name} Company`,
        domain: lead.email.includes('@') ? lead.email.split('@')[1] : '',
        createdBy: 'Lead conversion',
        owner: lead.owner || currentUser?.email || '',
        createdAt: 'Just now',
        employees: '',
        linkedin: '',
        color: 'bg-blue-600',
        icon: (lead.company || lead.name || 'C')[0].toUpperCase(),
      }, ...current]);
    }

    setPeople((current) => [{
      id: contactId,
      companyId,
      name: lead.name,
      email: lead.email,
      phone: '',
      title: '',
      company: lead.company,
      address: '',
      notes: `Converted from ${lead.source || 'lead'} with score ${lead.score || '-'}.`,
      status: 'Active',
      tags: 'converted-lead',
    }, ...current]);

    setDeals((current) => [{
      id: dealId,
      companyId,
      contactId,
      leadId: lead.id,
      name: `${lead.company || lead.name} - New Deal`,
      company: lead.company,
      value: String(Math.max(5000, Number(lead.score || 50) * 700)),
      stage: 'Qualification',
      closeDate: '',
      owner: lead.owner || currentUser?.email || '',
    }, ...current]);

    setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status: 'Converted', companyId, contactId } : item));
    setLastAction(`${lead.name} converted to contact and deal`);
    audit('convert_lead', 'Leads', lead.name);
  }, [audit, companies, currentUser, permissions.canCreate, permissions.canEdit]);

  const handleCompanyCrudSave = useCallback((data: Record<string, string>) => {
    if (!crudModal) return;
    const item = crudModal.item as CompanyTableRow | undefined;
    if (item && !permissions.canEdit) { setCrudError('You do not have permission to edit this company'); audit('edit_blocked', 'Companies', data.name || 'Company', 'blocked'); return; }
    if (!item && !permissions.canCreate) { setCrudError('You do not have permission to create companies'); audit('create_blocked', 'Companies', data.name || 'Company', 'blocked'); return; }

    const result = validateForm('Companies', data, companyFields);
    if (!result.valid) { setFieldErrors(result.errors); return; }
    setFieldErrors({});

    setCrudSaving(true);
    setCrudError('');
    setTimeout(() => {
      if (item) {
        setCompanies((prev) => prev.map((c) => c.id === item.id ? { ...c, name: data.name || c.name, domain: data.domain || c.domain, employees: data.employees ? Number(data.employees) : '', owner: data.owner || c.owner, linkedin: data.linkedin || c.linkedin } : c));
        setLastAction('Company updated');
        audit('update', 'Companies', data.name || item.name);
      } else {
        const newCompany: CompanyTableRow = {
          id: `new-${Date.now()}`,
          name: data.name || 'New Company',
          domain: data.domain || '',
          createdBy: 'Digital Wave Ops',
          owner: data.owner || 'Digital Wave Team',
          createdAt: 'Just now',
          employees: data.employees ? Number(data.employees) : '',
          linkedin: data.linkedin || '',
          color: 'bg-blue-600',
          icon: (data.name || 'N')[0].toUpperCase(),
        };
        setCompanies((prev) => [newCompany, ...prev]);
        setLastAction('Company created');
        audit('create', 'Companies', newCompany.name);
      }
      setCrudSaving(false);
      setCrudModal(null);
    }, 200);
  }, [audit, crudModal, permissions.canCreate, permissions.canEdit]);

  const runCommand = useCallback((action: string) => {
    switch (action) {
      case 'new-company': createCompany(); break;
      case 'search': setQuery(''); break;
      case 'filter': setEmployeeFilter((v) => !v); break;
      case 'sort-name': setCompanies((c) => [...c].sort((a, b) => a.name.localeCompare(b.name))); break;
      case 'sort-employees': setCompanies((c) => [...c].sort((a, b) => Number(b.employees || 0) - Number(a.employees || 0))); break;
      case 'export': exportView(); break;
      case 'delete-selected':
        if (!permissions.canDelete) { setLastAction('You do not have permission to delete selected companies'); audit('delete_selected_blocked', 'Companies', `${selectedIds.length} selected`, 'blocked'); break; }
        setCompanies((c) => c.filter((company) => !selectedIds.includes(company.id)));
        setSelectedIds([]);
        setLastAction('Selected companies deleted');
        audit('delete_selected', 'Companies', `${selectedIds.length} selected`);
        break;
      case 'merge-selected':
        mergeSelectedCompanies();
        break;
      case 'save-filter':
        saveCurrentFilter();
        break;
      case 'ask-ai':
        setAiAnswer(`AI summary: ${companies.length} companies, ${selectedIds.length} selected. Open AI Ask for a live response from the secure Digital Wave backend assistant.`);
        setChatOpen(true);
        setLastAction('AI summary ready');
        break;
      default:
        if (MODULE_ACTIONS.includes(action)) setActiveModule(action);
        else setActiveModule(action);
    }
    setCommandOpen(false);
  }, [audit, createCompany, exportView, companies, selectedIds, permissions.canDelete, mergeSelectedCompanies, saveCurrentFilter]);

  const isAiModule = AI_MODULES.includes(activeModule);
  const isWorkflowsModule = activeModule === 'Workflows';

  const moduleIcon = moduleIconMap[activeModule] || LayoutDashboard;

  const crudModuleTypes = ['People', 'Tasks', 'Notes', 'Opportunities', 'Deals', 'Leads', 'Meetings', 'Projects', 'Files'];
  const isExactScreen = ['Dashboards', 'Companies', 'People', 'Leads'].includes(activeModule);
  const searchPlaceholder = activeModule === 'Companies' ? 'Search companies, domains...' : activeModule === 'People' ? 'Search people...' : activeModule === 'Leads' ? 'Search leads...' : 'Search anything...';
  const addButtonLabel = activeModule === 'Companies' ? 'Add Company' : activeModule === 'People' ? 'Add Person' : activeModule === 'Leads' ? 'Add Lead' : 'Add';

  const renderModulePanel = (type: string) => (
    <DigitalWaveModulePanel
      module={type}
      onOpenCommand={() => setCommandOpen(true)}
      items={moduleItems[type]}
      onAdd={permissions.canCreate ? () => openAdd(type) : undefined}
      onView={(item) => {
        const collections: Record<string, CrudEntity[]> = { People: people, Tasks: tasks, Notes: notes, Opportunities: opportunities, Deals: deals, Leads: leads, Meetings: meetings, Projects: projects, Files: files };
        const entity = collections[type]?.find((record) => (record as { id: string }).id === item.id);
        if (entity) openDetail(type, entity);
      }}
      onEdit={permissions.canEdit ? (item) => {
        const collections: Record<string, CrudEntity[]> = { People: people, Tasks: tasks, Notes: notes, Opportunities: opportunities, Deals: deals, Leads: leads, Meetings: meetings, Projects: projects, Files: files };
        const entity = collections[type]?.find((record) => (record as { id: string }).id === item.id);
        if (entity) openEdit(type, entity);
      } : undefined}
      onDelete={permissions.canDelete ? (item) => {
        const collections: Record<string, CrudEntity[]> = { People: people, Tasks: tasks, Notes: notes, Opportunities: opportunities, Deals: deals, Leads: leads, Meetings: meetings, Projects: projects, Files: files };
        const entity = collections[type]?.find((record) => (record as { id: string }).id === item.id);
        if (entity) requestDelete(type, entity);
      } : undefined}
      onDuplicate={permissions.canCreate ? (item) => {
        const collections: Record<string, CrudEntity[]> = { People: people, Tasks: tasks, Notes: notes, Opportunities: opportunities, Deals: deals, Leads: leads, Meetings: meetings, Projects: projects, Files: files };
        const entity = collections[type]?.find((record) => (record as { id: string }).id === item.id);
        if (entity) handleDuplicate(type, entity);
      } : undefined}
    />
  );

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--crm-app-bg)', color: 'var(--crm-text)' }}>
      <AuthRequired clerkMissing={clerkMissing}>
        <div className="digital-wave-crm-shell">
          <DigitalWaveSidebar
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            onOpenCommand={() => setCommandOpen(true)}
            onOpenChat={() => setChatOpen(true)}
          />
          <section className="digital-wave-main">
            <header className="digital-wave-topbar">
              <div className="digital-wave-title">
                {createElement(moduleIcon, { size: 16 })}
                <div className="digital-wave-title-block">
                  <h1>{activeModule === 'Dashboards' ? 'Dashboard' : activeModule}</h1>
                  <p>{moduleSubtitleMap[activeModule] || 'Manage CRM records, relationships, and activity.'}</p>
                </div>
              </div>
              <div className="digital-wave-header-tools">
                <button className="digital-wave-global-search" onClick={() => setSearchOpen(true)} type="button">
                  <Search size={17} />
                  <span>{searchPlaceholder}</span>
                  <kbd>Ctrl K</kbd>
                </button>
                {!isExactScreen && <SyncStatusPill status={syncStatus} />}
                {activeModule === 'Dashboards' && permissions.canCreate && <QuickActions onAdd={setQuickAddType} />}
                <div className="digital-wave-top-actions">
                  {activeModule === 'Dashboards' && (
                    <>
                      <button onClick={() => setCommandOpen(true)} type="button"><Calendar size={13} /> May 16 - May 22, 2025 <ChevronDown size={13} /></button>
                      <button onClick={() => setCommandOpen(true)} type="button"><SlidersHorizontal size={12} /> Customize</button>
                    </>
                  )}
                  {['Companies', 'People', 'Leads'].includes(activeModule) && permissions.canCreate && <button onClick={() => setImportOpen(true)} type="button"><Upload size={13} /> Import</button>}
                  {['Companies', 'People', 'Leads'].includes(activeModule) && permissions.canExport && <button onClick={exportAllData} type="button"><Download size={13} /> Export</button>}
                  {activeModule === 'Companies' && permissions.canCreate && (
                    <button className="exact-primary-action" onClick={createCompany} type="button"><Plus size={15} /> {addButtonLabel}</button>
                  )}
                  {['People', 'Leads'].includes(activeModule) && permissions.canCreate && (
                    <button className="exact-primary-action" onClick={() => openAdd(activeModule)} type="button"><Plus size={15} /> {addButtonLabel} <ChevronDown size={13} /></button>
                  )}
                  {isWorkflowsModule && permissions.canManageWorkflows && (
                    <button onClick={() => setCommandOpen(true)} type="button"><SlidersHorizontal size={12} /> Actions</button>
                  )}
                  {!isExactScreen && <button onClick={() => setCommandOpen(true)} type="button"><SlidersHorizontal size={12} /> Ctrl K</button>}
                </div>
                <NotificationCenter
                  schemaHealth={schemaHealth}
                  companiesLoaded={companiesLoaded}
                  recordsLoaded={recordsLoaded}
                  lastAction={lastAction}
                />
                <button className="exact-help-button" onClick={() => setCommandOpen(true)} type="button">?</button>
                {currentUser?.avatar ? <img className="exact-top-avatar" src={currentUser.avatar} alt="" /> : <span className="exact-top-avatar">{currentUser?.name?.[0] || 'M'}</span>}
              </div>
            </header>

            {activeModule === 'Dashboards' ? (
              <ExactDashboardView
                companies={companies}
                deals={deals}
                leads={leads}
                tasks={tasks}
                meetings={meetings}
                onNavigate={setActiveModule}
                onOpenCommand={() => setCommandOpen(true)}
              />
            ) : activeModule === 'Companies' ? (
              <ExactCompaniesView
                companies={visibleCompanies}
                selectedIds={selectedIds}
                allSelected={allSelected}
                onToggleSelected={toggleSelected}
                onToggleAll={() => setSelectedIds(allSelected ? [] : visibleCompanies.map((c) => c.id))}
                onView={(company) => openDetail('Companies', company)}
                onEdit={permissions.canEdit ? handleCompanyEdit : undefined}
                onDelete={permissions.canDelete ? handleCompanyDelete : undefined}
                onDuplicate={permissions.canCreate ? handleCompanyDuplicate : undefined}
                onFilter={() => setCommandOpen(true)}
                onSort={() => runCommand('sort-name')}
                onColumns={() => setCommandOpen(true)}
              />
            ) : activeModule === 'AI Execute' ? (
              <div className="digital-wave-table-card">
                <div className="p-4 min-h-[400px]">
                  <AiExecutePanel companies={companies} selectedIds={selectedIds} onExecuteAction={handleExecuteAction} />
                </div>
              </div>
            ) : activeModule === 'AI Ask' ? (
              <div className="digital-wave-table-card">
                <div className="p-4 min-h-[400px]">
                  <AiAssistantPanel companies={companies} selectedIds={selectedIds} />
                </div>
              </div>
            ) : activeModule === 'Workflows' ? (
              <div className="digital-wave-table-card">
                <div className="p-4 min-h-[400px]">
                  <WorkflowDashboard />
                </div>
              </div>
            ) : activeModule === 'Deals' ? (
              <div className="space-y-4">
                <DealPipelineBoard deals={deals} onMoveDeal={moveDealStage} onOpenDeal={(deal) => openDetail('Deals', deal)} />
                {renderModulePanel('Deals')}
              </div>
            ) : activeModule === 'People' ? (
              <ExactPeopleView
                people={people}
                onOpen={(person) => openDetail('People', person)}
                onEdit={permissions.canEdit ? (person) => openEdit('People', person) : undefined}
                onDelete={permissions.canDelete ? (person) => requestDelete('People', person) : undefined}
                onDuplicate={permissions.canCreate ? (person) => handleDuplicate('People', person) : undefined}
                onFilter={() => setCommandOpen(true)}
                onSort={() => setCommandOpen(true)}
                onColumns={() => setCommandOpen(true)}
              />
            ) : activeModule === 'Leads' ? (
              <ExactLeadsView
                leads={leads}
                onOpen={(lead) => openDetail('Leads', lead)}
                onEdit={permissions.canEdit ? (lead) => openEdit('Leads', lead) : undefined}
                onDelete={permissions.canDelete ? (lead) => requestDelete('Leads', lead) : undefined}
                onDuplicate={permissions.canCreate ? (lead) => handleDuplicate('Leads', lead) : undefined}
                onFilter={() => setCommandOpen(true)}
                onConvert={convertLead}
                onSort={() => setCommandOpen(true)}
                onColumns={() => setCommandOpen(true)}
              />
            ) : crudModuleTypes.includes(activeModule) ? (
              renderModulePanel(activeModule)
            ) : activeModule === 'Settings' ? (
              <div className="digital-wave-table-card min-h-[400px] p-0">
                <SettingsPanel />
              </div>
            ) : (
              <DigitalWaveModulePanel module={activeModule} onOpenCommand={() => setCommandOpen(true)} />
            )}
          </section>
        </div>

        <GlobalSearch
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onRun={runCommand}
          entities={{
            companies,
            people,
            tasks,
            notes,
            opportunities,
            deals,
            leads,
            meetings,
            projects,
          }}
          onNavigate={handleNavigate}
        />
        {commandOpen && (
          <DigitalWaveCommandMenu query={query} setQuery={setQuery} onClose={() => setCommandOpen(false)} onRun={runCommand} activeModule={activeModule} />
        )}
        {chatOpen && (
          <DigitalWaveChatPanel prompt={aiPrompt} setPrompt={setAiPrompt} answer={aiAnswer} onAsk={() => runCommand('ask-ai')} onClose={() => setChatOpen(false)} />
        )}
        {quickAddType && (
          <QuickAddModal type={quickAddType} onClose={() => setQuickAddType(null)} onSave={handleQuickAdd} />
        )}
        {importOpen && (
          <CsvImportModal onClose={() => setImportOpen(false)} onImport={handleCsvImport} />
        )}
        <RecordDetailDrawer
          record={detailRecord}
          related={{ companies, people, tasks, notes, deals, meetings, files }}
          onClose={() => setDetailRecord(null)}
          onEdit={detailRecord && permissions.canEdit ? () => {
            setCrudModal(detailRecord);
            setDetailRecord(null);
          } : undefined}
        />

        {crudModal && (
          crudModal.type === 'Companies' ? (
            <CrudModal
              title={crudModal.item ? 'Edit Company' : 'Add Company'}
              fields={companyFields}
              initial={crudModal.item ? { name: (crudModal.item as CompanyTableRow).name, domain: (crudModal.item as CompanyTableRow).domain, employees: String((crudModal.item as CompanyTableRow).employees || ''), owner: (crudModal.item as CompanyTableRow).owner, linkedin: (crudModal.item as CompanyTableRow).linkedin } : { name: '', domain: '', employees: '', owner: '', linkedin: '' }}
              onClose={() => setCrudModal(null)}
              onSave={handleCompanyCrudSave}
              saving={crudSaving}
              error={crudError}
              fieldErrors={fieldErrors}
              entityType="Companies"
            />
          ) : (
            <CrudModal
              title={crudModal.item ? `Edit ${crudModal.type.slice(0, -1)}` : `Add ${crudModal.type.slice(0, -1)}`}
              fields={entityConfigs[crudModal.type]?.fields || []}
              initial={crudModal.item ? entityConfigs[crudModal.type]?.fromEntity(crudModal.item) || {} : entityConfigs[crudModal.type]?.empty() || {}}
              onClose={() => setCrudModal(null)}
              onSave={handleCrudSave}
              saving={crudSaving}
              error={crudError}
              fieldErrors={fieldErrors}
              entityType={crudModal.type}
            />
          )
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--crm-overlay)' }} onClick={() => setDeleteConfirm(null)}>
            <div
              className="w-full max-w-sm rounded-xl border p-5 shadow-2xl"
              style={{ background: 'var(--crm-dropdown-bg)', borderColor: 'var(--crm-border-accent)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400"><AlertTriangle size={16} /></div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Delete {deleteConfirm.type.slice(0, -1)}?</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteConfirm(null)} type="button" className="rounded-lg px-3 py-1.5 text-xs transition" style={{ color: 'var(--crm-text-secondary)' }}>Cancel</button>
                <button onClick={confirmDelete} type="button" className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-red-400">Delete</button>
              </div>
            </div>
          </div>
        )}
      </AuthRequired>
    </main>
  );
}
