import { useCallback, useMemo, useState, createElement, useEffect } from 'react';
import { Building2, ChevronDown, LayoutDashboard, List, Plus, Search, SlidersHorizontal, ArrowUpDown, Download, Linkedin, Check, Sparkles, Zap, AlertTriangle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useKeyboard } from '../../hooks/useKeyboard';
import { setPresenceClerkId } from '../../hooks/usePresence';
import {
  initialCompanies, initialPeople, initialTasks, initialNotes,
  initialOpportunities, initialDeals, initialLeads, initialMeetings, initialProjects,
  type CompanyTableRow, type CrmPerson, type CrmTask, type CrmNote,
  type CrmOpportunity, type CrmDeal, type CrmLead, type CrmMeeting, type CrmProject,
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
import { AuthRequired } from '../crm/AuthRequired';
import type { ExecuteResult } from '../../services/aiExecutionEngine';

interface DigitalWaveCrmAppProps {
  clerkMissing: boolean;
}

const AI_MODULES = ['AI Execute', 'AI Ask'];
const MODULE_ACTIONS = ['Companies', 'Workflows', ...AI_MODULES];

type CrudEntity = CrmPerson | CrmTask | CrmNote | CrmOpportunity | CrmDeal | CrmLead | CrmMeeting | CrmProject | CompanyTableRow;

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

export function DigitalWaveCrmApp({ clerkMissing }: DigitalWaveCrmAppProps) {
  const { user: clerkUser, isSignedIn } = useUser();
  const [activeModule, setActiveModule] = useState(() => window.location.pathname.startsWith('/crm/workflows') ? 'Workflows' : 'Companies');
  const [companies, setCompanies] = useState(initialCompanies);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<'filter' | 'sort' | 'options' | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      setPresenceClerkId(clerkUser.id);
    }
  }, [isSignedIn, clerkUser]);
  const [employeeFilter, setEmployeeFilter] = useState(false);
  const [compactRows, setCompactRows] = useState(false);
  const [hiddenLinkedin, setHiddenLinkedin] = useState(false);
  const [lastAction, setLastAction] = useState('Ready');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiPrompt, setAiPrompt] = useState('Summarize my companies and next CRM actions.');
  const [quickAddType, setQuickAddType] = useState<QuickAddType | null>(null);

  const [people, setPeople] = useState<CrmPerson[]>(initialPeople);
  const [tasks, setTasks] = useState<CrmTask[]>(initialTasks);
  const [notes, setNotes] = useState<CrmNote[]>(initialNotes);
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>(initialOpportunities);
  const [deals, setDeals] = useState<CrmDeal[]>(initialDeals);
  const [leads, setLeads] = useState<CrmLead[]>(initialLeads);
  const [meetings, setMeetings] = useState<CrmMeeting[]>(initialMeetings);
  const [projects, setProjects] = useState<CrmProject[]>(initialProjects);

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
      toItem: (d, id) => ({ id, label: d.title || 'Untitled', detail: `${d.priority || 'Medium'} priority${d.dueDate ? ` · Due ${d.dueDate}` : ''}` }),
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
      toItem: (d, id) => ({ id, label: d.name || 'Untitled', detail: d.value ? `$${Number(d.value).toLocaleString()} · ${d.stage || 'Discovery'}` : d.stage || 'New opportunity' }),
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
      toItem: (d, id) => ({ id, label: d.name || 'Untitled', detail: d.value ? `$${Number(d.value).toLocaleString()} · ${d.stage || 'Qualification'}` : d.stage || 'New deal' }),
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
      toItem: (d, id) => ({ id, label: d.name || 'Unnamed', detail: `${d.company || 'No company'} · ${d.status || 'New'} · Score: ${d.score || '—'}` }),
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
      toItem: (d, id) => ({ id, label: d.title || 'Untitled', detail: `${d.date || 'No date'}${d.duration ? ` · ${d.duration}min` : ''}` }),
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
      toItem: (d, id) => ({ id, label: d.name || 'Untitled', detail: `${d.status || 'Planning'} · ${d.priority || 'Medium'} priority` }),
      toEntity: (d, id) => ({ id, ...d }) as unknown as CrudEntity,
      fromEntity: (item) => {
        const p = item as CrmProject;
        return { name: p.name || '', description: p.description || '', status: p.status || 'Planning', startDate: p.startDate || '', endDate: p.endDate || '', priority: p.priority || 'Medium', budget: p.budget || '' };
      },
      setter: (items) => setProjects(items as CrmProject[]),
    },
  }), []);

  const moduleItems: Record<string, ModuleItem[]> = useMemo(() => ({
    People: people.map((p) => ({ id: p.id, label: p.name, detail: p.title ? `${p.title}${p.company ? ` at ${p.company}` : ''}` : p.company || 'No details' })),
    Tasks: tasks.map((t) => ({ id: t.id, label: t.title, detail: `${t.priority} priority${t.dueDate ? ` · Due ${t.dueDate}` : ''}` })),
    Notes: notes.map((n) => ({ id: n.id, label: n.title, detail: `${n.category} · Created just now` })),
    Opportunities: opportunities.map((o) => ({ id: o.id, label: o.name, detail: o.value ? `$${Number(o.value).toLocaleString()} · ${o.stage}` : o.stage })),
    Deals: deals.map((d) => ({ id: d.id, label: d.name, detail: d.value ? `$${Number(d.value).toLocaleString()} · ${d.stage}` : d.stage })),
    Leads: leads.map((l) => ({ id: l.id, label: l.name, detail: `${l.company} · ${l.status} · Score: ${l.score || '—'}` })),
    Meetings: meetings.map((m) => ({ id: m.id, label: m.title, detail: `${m.date || 'No date'}${m.duration ? ` · ${m.duration}min` : ''}` })),
    Projects: projects.map((pr) => ({ id: pr.id, label: pr.name, detail: `${pr.status} · ${pr.priority} priority` })),
  }), [people, tasks, notes, opportunities, deals, leads, meetings, projects]);

  const visibleCompanies = useMemo(() =>
    companies
      .filter((c) => !employeeFilter || Number(c.employees || 0) >= 1000)
      .filter((c) => [c.name, c.domain, c.createdBy, c.createdAt].join(' ').toLowerCase().includes(query.toLowerCase())),
    [companies, employeeFilter, query],
  );

  const allSelected = visibleCompanies.length > 0 && visibleCompanies.every((c) => selectedIds.includes(c.id));
  const maxEmployees = Math.max(...companies.map((c) => Number(c.employees || 0)));

  const closeTopmost = useCallback(() => {
    if (deleteConfirm) { setDeleteConfirm(null); return true; }
    if (crudModal) { setCrudModal(null); return true; }
    if (commandOpen) { setCommandOpen(false); return true; }
    if (chatOpen) { setChatOpen(false); return true; }
    if (menuOpen) { setMenuOpen(null); return true; }
    return false;
  }, [deleteConfirm, crudModal, commandOpen, chatOpen, menuOpen]);

  const handleNavigate = useCallback((module: string, _id?: string) => {
    setActiveModule(module);
  }, []);

  const keyMap: Record<string, () => void> = {
    'ctrl+k': () => setSearchOpen(true),
    escape: closeTopmost,
  };
  useKeyboard(keyMap);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((i) => i !== id) : [...current, id]);
  }, []);

  const createCompany = useCallback(() => {
    const newCompany: CompanyTableRow = {
      id: `new-${Date.now()}`,
      name: `New Company ${companies.length + 1}`,
      domain: `newcompany${companies.length + 1}.com`,
      createdBy: 'Digital Wave Ops',
      owner: 'Digital Wave Team',
      createdAt: 'Just now',
      employees: 25,
      linkedin: '',
      color: 'bg-blue-600',
      icon: 'N',
    };
    setCompanies((current) => [newCompany, ...current]);
    setActiveModule('Companies');
    setLastAction('New company created');
  }, [companies.length]);

  const exportView = useCallback(() => {
    const blob = new Blob([JSON.stringify(visibleCompanies, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'companies-view.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setLastAction('Companies exported');
  }, [visibleCompanies]);

  const handleExecuteAction = useCallback((result: ExecuteResult) => {
    if (!result.success) { setLastAction(result.message); return; }
    switch (result.action) {
      case 'create_company':
        if (result.data) { setCompanies((prev) => [result.data as CompanyTableRow, ...prev]); setActiveModule('Companies'); }
        break;
      case 'delete_company':
        if (result.data) { setCompanies((prev) => prev.filter((c) => c.id !== (result.data as { id: string }).id)); }
        break;
      case 'assign_owner':
        if (result.data) { const d = result.data as { companyId: string; owner: string }; setCompanies((prev) => prev.map((c) => c.id === d.companyId ? { ...c, owner: d.owner } : c)); }
        break;
      case 'filter': if (result.data) setEmployeeFilter(true); break;
      case 'export': exportView(); break;
    }
    setLastAction(result.message);
  }, [exportView]);

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
    setCrudError('');
    setFieldErrors({});
    setCrudModal({ type, item: undefined });
  }, []);

  const openEdit = useCallback((type: string, item: CrudEntity) => {
    setCrudError('');
    setFieldErrors({});
    setCrudModal({ type, item });
  }, []);

  const requestDelete = useCallback((type: string, item: CrudEntity) => {
    setDeleteConfirm({ type, item });
  }, []);

  const handleCrudSave = useCallback((data: Record<string, string>) => {
    if (!crudModal) return;
    const { type, item } = crudModal;
    const config = entityConfigs[type];
    if (!config) return;

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
      } else {
        const id = genId();
        const entity = config.toEntity(data, id);
        config.setter((prev: CrudEntity[]) => [entity, ...prev]);
        setLastAction(`${type} created`);
      }
      setCrudSaving(false);
      setCrudModal(null);
    }, 200);
  }, [crudModal, entityConfigs]);

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
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
      case 'Companies': setCompanies((prev) => prev.filter((c) => c.id !== id)); break;
    }
    setLastAction(`${type.slice(0, -1) || type} deleted`);
    setDeleteConfirm(null);
  }, [deleteConfirm]);

  const handleDuplicate = useCallback((type: string, item: CrudEntity) => {
    const config = entityConfigs[type];
    if (!config) return;
    const id = genId();
    const data = config.fromEntity(item);
    const entity = config.toEntity(data, id);
    config.setter((prev: CrudEntity[]) => [entity, ...prev]);
    setLastAction(`${type.slice(0, -1) || type} duplicated`);
  }, [entityConfigs]);

  const handleCompanyEdit = useCallback((company: CompanyTableRow) => {
    setCrudError('');
    setFieldErrors({});
    setCrudModal({ type: 'Companies', item: company });
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

  const handleCompanyCrudSave = useCallback((data: Record<string, string>) => {
    if (!crudModal) return;
    const item = crudModal.item as CompanyTableRow | undefined;

    const result = validateForm('Companies', data, companyFields);
    if (!result.valid) { setFieldErrors(result.errors); return; }
    setFieldErrors({});

    setCrudSaving(true);
    setCrudError('');
    setTimeout(() => {
      if (item) {
        setCompanies((prev) => prev.map((c) => c.id === item.id ? { ...c, name: data.name || c.name, domain: data.domain || c.domain, employees: data.employees ? Number(data.employees) : '', owner: data.owner || c.owner, linkedin: data.linkedin || c.linkedin } : c));
        setLastAction('Company updated');
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
      }
      setCrudSaving(false);
      setCrudModal(null);
    }, 200);
  }, [crudModal]);

  const runCommand = useCallback((action: string) => {
    switch (action) {
      case 'new-company': createCompany(); break;
      case 'search': setQuery(''); break;
      case 'filter': setEmployeeFilter((v) => !v); break;
      case 'sort-name': setCompanies((c) => [...c].sort((a, b) => a.name.localeCompare(b.name))); break;
      case 'sort-employees': setCompanies((c) => [...c].sort((a, b) => Number(b.employees || 0) - Number(a.employees || 0))); break;
      case 'export': exportView(); break;
      case 'delete-selected':
        setCompanies((c) => c.filter((company) => !selectedIds.includes(company.id)));
        setSelectedIds([]);
        setLastAction('Selected companies deleted');
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
  }, [createCompany, exportView, companies, selectedIds]);

  const isAiModule = AI_MODULES.includes(activeModule);
  const isWorkflowsModule = activeModule === 'Workflows';

  const moduleIcon = moduleIconMap[activeModule] || LayoutDashboard;

  const crudModuleTypes = ['People', 'Tasks', 'Notes', 'Opportunities', 'Deals', 'Leads', 'Meetings', 'Projects'];

  const renderModulePanel = (type: string) => (
    <DigitalWaveModulePanel
      module={type}
      onOpenCommand={() => setCommandOpen(true)}
      items={moduleItems[type]}
      onAdd={() => openAdd(type)}
      onEdit={(item) => openEdit(type, entityConfigs[type]?.toEntity(entityConfigs[type].fromEntity(item as unknown as CrudEntity), (item as { id: string }).id) || (item as unknown as CrudEntity))}
      onDelete={(item) => requestDelete(type, item as unknown as CrudEntity)}
      onDuplicate={(item) => handleDuplicate(type, item as unknown as CrudEntity)}
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
                <h1>{activeModule}</h1>
              </div>
              <div className="flex items-center gap-2">
                <QuickActions onAdd={setQuickAddType} />
                <div className="digital-wave-top-actions">
                  {activeModule === 'Companies' && (
                    <button onClick={createCompany} type="button"><Plus size={13} /> New Company</button>
                  )}
                  {crudModuleTypes.includes(activeModule) && (
                    <button onClick={() => openAdd(activeModule)} type="button"><Plus size={13} /> Add</button>
                  )}
                  {isWorkflowsModule && (
                    <button onClick={() => setCommandOpen(true)} type="button"><SlidersHorizontal size={12} /> Actions</button>
                  )}
                  <button onClick={() => setCommandOpen(true)} type="button"><SlidersHorizontal size={12} /> | Ctrl K</button>
                </div>
              </div>
            </header>

            {activeModule === 'Companies' ? (
              <div className="digital-wave-table-card">
                <div className="digital-wave-viewbar">
                  <div className="digital-wave-view-title">
                    <List size={14} /> All Companies · {visibleCompanies.length} <ChevronDown size={12} />
                  </div>
                  <label className="digital-wave-search">
                    <Search size={13} />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search companies, domains, leads..." />
                  </label>
                  <div className="digital-wave-view-actions">
                    <button onClick={() => setMenuOpen(menuOpen === 'filter' ? null : 'filter')} type="button">Filter</button>
                    <button onClick={() => setMenuOpen(menuOpen === 'sort' ? null : 'sort')} type="button">Sort</button>
                    <button onClick={() => setMenuOpen(menuOpen === 'options' ? null : 'options')} type="button">Options</button>
                  </div>
                  {menuOpen && (
                    <div className="digital-wave-dropdown">
                      {menuOpen === 'filter' && (
                        <button onClick={() => setEmployeeFilter((v) => !v)} type="button"><Check size={12} /> Filter &gt;1K employees {employeeFilter ? 'on' : 'off'}</button>
                      )}
                      {menuOpen === 'sort' && (
                        <>
                          <button onClick={() => runCommand('sort-name')} type="button"><ArrowUpDown size={12} /> Sort by name</button>
                          <button onClick={() => runCommand('sort-employees')} type="button"><ArrowUpDown size={12} /> Sort by employees</button>
                        </>
                      )}
                      {menuOpen === 'options' && (
                        <>
                          <button onClick={() => setCompactRows((v) => !v)} type="button"><List size={12} /> Compact rows</button>
                          <button onClick={() => setHiddenLinkedin((v) => !v)} type="button"><Linkedin size={12} /> Toggle LinkedIn</button>
                          <button onClick={exportView} type="button"><Download size={12} /> Export view</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <CompanyTable
                  companies={visibleCompanies}
                  selectedIds={selectedIds}
                  allSelected={allSelected}
                  compactRows={compactRows}
                  hiddenLinkedin={hiddenLinkedin}
                  toggleSelected={toggleSelected}
                  toggleAll={() => setSelectedIds(allSelected ? [] : visibleCompanies.map((c) => c.id))}
                  onEdit={handleCompanyEdit}
                  onDelete={handleCompanyDelete}
                  onDuplicate={handleCompanyDuplicate}
                />
                <footer className="digital-wave-table-footer">
                  <span>Calculate <ChevronDown size={12} /></span>
                  <span>Count all <b>{visibleCompanies.length}</b></span>
                  <span>Max Empl <b>{maxEmployees.toLocaleString()}</b></span>
                  <span>Selected <b>{selectedIds.length}</b></span>
                </footer>
              </div>
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
