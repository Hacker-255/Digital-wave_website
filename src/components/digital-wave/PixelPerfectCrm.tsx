import {
  Activity, BarChart3, Bell, BriefcaseBusiness, Building2, CalendarDays,
  CheckCircle2, ChevronDown, CircleHelp, Columns3, Contact, CreditCard, Download,
  Filter, Home, LineChart, Mail, Menu, MoreHorizontal, Plus, Search, Settings,
  SlidersHorizontal, SortAsc, Sparkles, Target, Upload, Workflow,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import logoUrl from '../../assets/digital-wave-brand-logo.png';
import { useAuth } from '../../contexts/AuthContext';

type PixelPerfectCrmProps = {
  page: string;
  onNavigate: (page: string) => void;
  onOpenChat?: () => void;
  onOpenCommand?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onAdd?: (type: string) => void;
  onSaveView?: () => void;
  onSort?: () => void;
};

const companies = [
  ['NovaGrid Systems', 'Technology', 'novagrid.example', '5,000', 'John Doe', 'Active', '$320,000'],
  ['Northstar Automation', 'Automation', 'northstar.example', '1,100', 'Sarah Lee', 'Active', '$180,000'],
  ['Blue Harbor Logistics', 'Logistics', 'blueharbor.example', '8,000', 'Mike Ross', 'Active', '$280,000'],
  ['SkyBridge Tech', 'Technology', 'skybridge.example', '800', 'John Doe', 'Active', '$160,000'],
  ['DataPulse Labs', 'Software', 'datapulse.example', '400', 'Sarah Lee', 'Active', '$210,000'],
  ['Apex Software', 'Software', 'apex.example', '2,500', 'Mike Ross', 'Inactive', '$98,000'],
  ['CloudBase Corp', 'Cloud Services', 'cloudbase.example', '3,200', 'John Doe', 'Active', '$140,000'],
  ['Arcanum Systems', 'Technology', 'arcanum.example', '1,700', 'Sarah Lee', 'Active', '$120,000'],
] as const;

const people = [
  ['John Doe', 'john@novagrid.com', 'NovaGrid Systems', 'CTO', '+1 (555) 123-4567', 'Customer', 'Technology, Important', '2 hours ago'],
  ['Sarah Lee', 'sarah@northstar.com', 'Northstar Automation', 'Head of Ops', '+1 (555) 987-6543', 'Customer', 'Automation, VIP', '1 day ago'],
  ['Mike Ross', 'mike@blueharbor.com', 'Blue Harbor Logistics', 'Operations Manager', '+1 (555) 456-7890', 'Customer', 'Logistics, Important', '2 days ago'],
  ['Emily Carter', 'emily@skybridge.com', 'SkyBridge Tech', 'Sales Director', '+1 (555) 234-5678', 'Lead', 'Technology, New', '3 days ago'],
  ['David Wilson', 'david@datapulse.com', 'DataPulse Labs', 'Product Manager', '+1 (555) 345-6789', 'Customer', 'Software, VIP', '4 days ago'],
  ['James Miller', 'james@apex.com', 'Apex Software', 'CEO', '+1 (555) 876-5432', 'Lead', 'Software, New', '5 days ago'],
  ['Olivia Taylor', 'olivia@cloudbase.com', 'CloudBase Corp', 'Cloud Architect', '+1 (555) 654-3210', 'Customer', 'Cloud, Important', '6 days ago'],
  ['Daniel Kim', 'daniel@arcanum.com', 'Arcanum Systems', 'IT Manager', '+1 (555) 321-0987', 'Lead', 'Technology, New', '1 week ago'],
] as const;

const leads = [
  ['John Doe', 'CTO', 'john@novagrid.com', 'NovaGrid Systems', 'Qualified', '85', 'Website', 'Mahmoud Mostafa', '2 hours ago'],
  ['Sarah Lee', 'Head of Ops', 'sarah@northstar.com', 'Northstar Automation', 'Contacted', '72', 'Referral', 'Asmaa Hassan', '1 day ago'],
  ['Mike Ross', 'Operations Manager', 'mike@blueharbor.com', 'Blue Harbor Logistics', 'Qualified', '68', 'LinkedIn', 'Mahmoud Mostafa', '2 days ago'],
  ['Emily Carter', 'Sales Director', 'emily@skybridge.com', 'SkyBridge Tech', 'New', '45', 'Website', 'Asmaa Hassan', '3 days ago'],
  ['David Wilson', 'Product Manager', 'david@datapulse.com', 'DataPulse Labs', 'Proposal', '60', 'Cold Email', 'Omar Khaled', '4 days ago'],
  ['James Miller', 'CEO', 'james@apex.com', 'Apex Software', 'Negotiation', '90', 'Referral', 'Mahmoud Mostafa', '5 days ago'],
  ['Olivia Taylor', 'Cloud Architect', 'olivia@cloudbase.com', 'CloudBase Corp', 'Contacted', '55', 'LinkedIn', 'Asmaa Hassan', '6 days ago'],
  ['Daniel Kim', 'IT Manager', 'daniel@arcanum.com', 'Arcanum Systems', 'New', '40', 'Website', 'Omar Khaled', '1 week ago'],
] as const;

const deals = [
  ['NovaGrid Expansion', 'NovaGrid Systems', 'New Lead', '$420,000', 'Mahmoud Mostafa', 'May 24, 2026', 'High'],
  ['Blue Harbor Logistics Rollout', 'Blue Harbor Logistics', 'Qualified', '$280,000', 'Asmaa Hassan', 'May 27, 2026', 'Medium'],
  ['Apex Software Renewal', 'Apex Software', 'Proposal', '$210,000', 'Omar Khaled', 'May 29, 2026', 'High'],
  ['DataPulse Analytics Suite', 'DataPulse Labs', 'Negotiation', '$180,000', 'Mahmoud Mostafa', 'Jun 2, 2026', 'Medium'],
  ['SkyBridge Support Plan', 'SkyBridge Tech', 'Closed Won', '$160,000', 'Asmaa Hassan', 'Jun 4, 2026', 'Low'],
  ['CloudBase Migration', 'CloudBase Corp', 'Qualified', '$140,000', 'Omar Khaled', 'Jun 7, 2026', 'Medium'],
  ['Arcanum Security Package', 'Arcanum Systems', 'New Lead', '$120,000', 'Mahmoud Mostafa', 'Jun 9, 2026', 'High'],
  ['Northstar Automation Upgrade', 'Northstar Automation', 'Proposal', '$98,000', 'Asmaa Hassan', 'Jun 12, 2026', 'Low'],
] as const;

const topNav = [
  ['Contacts', 'People'], ['Companies', 'Companies'], ['Sales', 'Leads'], ['Service', 'Tasks'],
  ['Automation', 'Workflows'], ['Reports', 'Dashboards'],
] as const;

const sideViews: Record<string, string[]> = {
  Dashboard: ['Sales overview', 'Pipeline forecast', 'Team productivity', 'Recent activity'],
  Companies: ['All companies', 'My companies', 'Recently created', 'Active customers', 'Needs follow-up'],
  People: ['All contacts', 'My contacts', 'Customers', 'Leads', 'Inactive contacts'],
  Leads: ['All leads', 'New leads', 'Contacted', 'Qualified', 'Proposal', 'Closed won'],
  Deals: ['All deals', 'My deals', 'Open deals', 'Closing this month', 'Closed won'],
  Tasks: ['All tasks', 'Due today', 'Overdue', 'Assigned to me', 'Completed'],
  Meetings: ['All meetings', 'Upcoming', 'This week', 'Customer calls', 'Completed'],
  Projects: ['All projects', 'Active projects', 'At risk', 'Completed', 'Owned by me'],
  Notes: ['All notes', 'Customer notes', 'Sales notes', 'Support notes', 'Pinned'],
  Files: ['All files', 'Contracts', 'Proposals', 'Invoices', 'Recently uploaded'],
  Opportunities: ['All opportunities', 'Open opportunities', 'High value', 'Closing soon'],
  Workflows: ['All workflows', 'Active workflows', 'Drafts', 'Recently triggered'],
  Settings: ['Workspace settings', 'Team permissions', 'Email setup', 'Billing', 'Integrations'],
  'AI Ask': ['CRM assistant', 'Recent questions', 'Pipeline summary', 'Next actions'],
  'AI Execute': ['Command center', 'Bulk actions', 'AI actions', 'Recent runs'],
};

const moduleMeta: Record<string, { title: string; subtitle: string; eyebrow: string; cta: string; filters: string[]; views: string[] }> = {
  Tasks: {
    title: 'Tasks',
    subtitle: 'Prioritize follow-ups, overdue work, owners, and next actions.',
    eyebrow: 'Productivity',
    cta: 'Create Task',
    filters: ['Task owner', 'Due date', 'Priority', 'Status', 'Related record'],
    views: ['All tasks', 'Due today', 'Overdue', 'Assigned to me', 'Completed'],
  },
  Meetings: {
    title: 'Meetings',
    subtitle: 'Schedule customer calls, demos, reminders, and follow-up activity.',
    eyebrow: 'Calendar',
    cta: 'Create Meeting',
    filters: ['Host', 'Meeting date', 'Company', 'Reminder status', 'Outcome'],
    views: ['All meetings', 'Upcoming', 'This week', 'Customer calls', 'Completed'],
  },
  Projects: {
    title: 'Projects',
    subtitle: 'Track delivery work, owners, status, and customer implementation progress.',
    eyebrow: 'Delivery',
    cta: 'Create Project',
    filters: ['Project owner', 'Status', 'Due date', 'Company', 'Priority'],
    views: ['All projects', 'Active projects', 'At risk', 'Completed', 'Owned by me'],
  },
  Notes: {
    title: 'Notes',
    subtitle: 'Capture account context, customer conversations, and internal handoff details.',
    eyebrow: 'Activity',
    cta: 'Create Note',
    filters: ['Author', 'Company', 'Category', 'Created date', 'Pinned'],
    views: ['All notes', 'Customer notes', 'Sales notes', 'Support notes', 'Pinned'],
  },
  Files: {
    title: 'Files',
    subtitle: 'Organize proposals, contracts, invoices, recordings, and customer documents.',
    eyebrow: 'Documents',
    cta: 'Upload File',
    filters: ['Owner', 'File type', 'Company', 'Uploaded date', 'Tags'],
    views: ['All files', 'Contracts', 'Proposals', 'Invoices', 'Recently uploaded'],
  },
  Opportunities: {
    title: 'Opportunities',
    subtitle: 'Manage qualified revenue opportunities before they become active deals.',
    eyebrow: 'Pipeline',
    cta: 'Create Opportunity',
    filters: ['Owner', 'Stage', 'Value', 'Source', 'Close date'],
    views: ['All opportunities', 'Open opportunities', 'High value', 'Closing soon'],
  },
  Workflows: {
    title: 'Workflows',
    subtitle: 'Review automation rules, recent runs, and workflow health.',
    eyebrow: 'Automation',
    cta: 'Create Workflow',
    filters: ['Status', 'Trigger', 'Owner', 'Last run', 'Errors'],
    views: ['All workflows', 'Active workflows', 'Drafts', 'Recently triggered'],
  },
  Settings: {
    title: 'Settings',
    subtitle: 'Control team access, integrations, billing, email, data, and workspace behavior.',
    eyebrow: 'Administration',
    cta: 'Open Command',
    filters: ['Workspace', 'Team', 'Integrations', 'Billing', 'Security'],
    views: ['Workspace settings', 'Team permissions', 'Email setup', 'Billing', 'Integrations'],
  },
  'AI Ask': {
    title: 'AI Ask',
    subtitle: 'Ask Gemini about CRM changes, deals, tasks, customers, and next actions.',
    eyebrow: 'Artificial intelligence',
    cta: 'Open AI',
    filters: ['CRM context', 'Companies', 'Deals', 'Tasks', 'Meetings'],
    views: ['CRM assistant', 'Recent questions', 'Pipeline summary', 'Next actions'],
  },
  'AI Execute': {
    title: 'AI Execute',
    subtitle: 'Run guided CRM commands, summaries, and safe operational actions.',
    eyebrow: 'Artificial intelligence',
    cta: 'Open Commands',
    filters: ['Action type', 'Module', 'Owner', 'Status', 'Date'],
    views: ['Command center', 'Bulk actions', 'AI actions', 'Recent runs'],
  },
};

const genericRows = [
  ['Follow up with NovaGrid Systems', 'NovaGrid Systems', 'High', 'Mahmoud Mostafa', 'Today', 'Open'],
  ['Prepare proposal for Blue Harbor', 'Blue Harbor Logistics', 'Medium', 'Asmaa Hassan', 'Tomorrow', 'Open'],
  ['Schedule onboarding call', 'DataPulse Labs', 'High', 'Omar Khaled', 'Jun 12, 2026', 'Planned'],
  ['Upload signed contract', 'Apex Software', 'Low', 'Mahmoud Mostafa', 'Jun 14, 2026', 'Waiting'],
  ['Review renewal opportunity', 'CloudBase Corp', 'Medium', 'Asmaa Hassan', 'Jun 18, 2026', 'Open'],
  ['Document customer notes', 'Arcanum Systems', 'Low', 'Omar Khaled', 'Jun 20, 2026', 'Draft'],
] as const;

const revenueData = [
  { month: 'Jan', revenue: 600, forecast: 480 },
  { month: 'Feb', revenue: 820, forecast: 650 },
  { month: 'Mar', revenue: 900, forecast: 740 },
  { month: 'Apr', revenue: 1300, forecast: 950 },
  { month: 'May', revenue: 1500, forecast: 1200 },
  { month: 'Jun', revenue: 2450, forecast: 1600 },
  { month: 'Jul', revenue: 2200, forecast: 1850 },
];

const sourceData = [
  { name: 'Website', value: 40, color: '#0284ff' },
  { name: 'Referral', value: 32, color: '#06c8dc' },
  { name: 'LinkedIn', value: 24, color: '#003b91' },
  { name: 'Email', value: 16, color: '#38bdf8' },
  { name: 'Other', value: 16, color: '#cbd5e1' },
];

export function PixelPerfectCrm({ page, onNavigate, onOpenChat, onOpenCommand, onImport, onExport, onAdd, onSaveView, onSort }: PixelPerfectCrmProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  };

  return (
    <div className="hub-crm">
      <HubTopbar activePage={page} onNavigate={onNavigate} onOpenChat={onOpenChat} onOpenCommand={onOpenCommand} onNotify={showNotice} />
      <div className="hub-body">
        <HubSidebar page={page} onNavigate={onNavigate} onCreate={() => onAdd?.(page)} onSaveView={onSaveView || (() => showNotice('View saved.'))} onInvite={() => setInviteOpen(true)} />
        <main className="hub-main">
          {notice && <div className="hub-inline-notice">{notice}</div>}
          {page === 'Dashboard' && <DashboardPage onOpenCommand={onOpenCommand} onAdd={() => onAdd?.('People')} />}
          {page === 'Companies' && <CompaniesPage onImport={onImport} onExport={onExport} onAdd={() => onAdd?.('Companies')} />}
          {page === 'People' && <PeoplePage onImport={onImport} onExport={onExport} onAdd={() => onAdd?.('People')} />}
          {page === 'Leads' && <LeadsPage onImport={onImport} onExport={onExport} onAdd={() => onAdd?.('Leads')} />}
          {page === 'Deals' && <DealsPage onImport={onImport} onExport={onExport} onAdd={() => onAdd?.('Deals')} />}
          {!['Dashboard', 'Companies', 'People', 'Leads', 'Deals'].includes(page) && (
            <GenericModulePage
              page={page}
              onImport={onImport}
              onExport={onExport}
              onAdd={() => {
                if (page === 'Settings' || page.startsWith('AI')) onOpenCommand?.();
                else onAdd?.(page);
              }}
              onOpenChat={onOpenChat}
              onOpenCommand={onOpenCommand}
              onInvite={() => setInviteOpen(true)}
              onSaveView={onSaveView || (() => showNotice('View saved.'))}
              onSort={onSort || (() => showNotice('Sorted by latest activity.'))}
            />
          )}
        </main>
      </div>
      {inviteOpen && <InviteTeamModal onClose={() => setInviteOpen(false)} />}
    </div>
  );
}

function HubTopbar({ activePage, onNavigate, onOpenChat, onOpenCommand, onNotify }: { activePage: string; onNavigate: (page: string) => void; onOpenChat?: () => void; onOpenCommand?: () => void; onNotify: (message: string) => void }) {
  return (
    <header className="hub-topbar">
      <button className="hub-menu" type="button" aria-label="Menu" onClick={() => onNavigate('Dashboards')}><Menu size={20} /></button>
      <button className="hub-brand" type="button" onClick={() => onNavigate('Dashboards')}>
        <img src={logoUrl} alt="Digital Wave" />
        <span>Digital Wave</span>
      </button>
      <nav className="hub-topnav">
        {topNav.map(([label, target]) => (
          <button key={label} className={target === activePage || (activePage === 'Dashboard' && target === 'Dashboards') || (label === 'Service' && ['Tasks', 'Meetings', 'Notes'].includes(activePage)) ? 'active' : ''} onClick={() => onNavigate(target)} type="button">
            {label}<ChevronDown size={13} />
          </button>
        ))}
      </nav>
      <div className="hub-global-search">
        <Search size={17} />
        <input placeholder="Search Digital Wave CRM" />
        <kbd>Ctrl K</kbd>
      </div>
      <button className="hub-icon-btn" type="button" onClick={onOpenChat} aria-label="AI Ask"><Sparkles size={18} /></button>
      <button className="hub-icon-btn" type="button" onClick={() => onNotify('You have 3 unread CRM notifications.')} aria-label="Notifications"><Bell size={18} /><em>3</em></button>
      <button className="hub-icon-btn" type="button" onClick={onOpenCommand} aria-label="Help"><CircleHelp size={18} /></button>
      <button className="hub-user" type="button" onClick={() => onNavigate('Settings')}><Avatar name="Mahmoud Mostafa" /><span>Mahmoud</span><ChevronDown size={13} /></button>
    </header>
  );
}

function HubSidebar({ page, onNavigate, onCreate, onSaveView, onInvite }: { page: string; onNavigate: (page: string) => void; onCreate?: () => void; onSaveView?: () => void; onInvite?: () => void }) {
  const views = sideViews[page] || ['All records', 'Assigned to me', 'Recently updated', 'Needs attention'];
  const [activeView, setActiveView] = useState(views[0] || '');
  useEffect(() => { setActiveView(views[0] || ''); }, [page]);

  return (
    <aside className="hub-sidebar">
      <button className="hub-create" type="button" onClick={onCreate}><Plus size={16} /> Create</button>
      <nav className="hub-sidebar-nav">
        <SideButton icon={<Home size={17} />} label="Dashboard" active={page === 'Dashboard'} onClick={() => onNavigate('Dashboards')} />
        <SideButton icon={<Contact size={17} />} label="Contacts" active={page === 'People'} onClick={() => onNavigate('People')} />
        <SideButton icon={<Building2 size={17} />} label="Companies" active={page === 'Companies'} onClick={() => onNavigate('Companies')} />
        <SideButton icon={<Target size={17} />} label="Leads" active={page === 'Leads'} onClick={() => onNavigate('Leads')} />
        <SideButton icon={<BriefcaseBusiness size={17} />} label="Deals" active={page === 'Deals'} onClick={() => onNavigate('Deals')} />
        <SideButton icon={<CalendarDays size={17} />} label="Tasks" active={page === 'Tasks'} onClick={() => onNavigate('Tasks')} />
        <SideButton icon={<CalendarDays size={17} />} label="Meetings" active={page === 'Meetings'} onClick={() => onNavigate('Meetings')} />
        <SideButton icon={<FileTextIcon />} label="Notes" active={page === 'Notes'} onClick={() => onNavigate('Notes')} />
        <SideButton icon={<Mail size={17} />} label="Email" onClick={() => onNavigate('Settings')} />
        <SideButton icon={<Workflow size={17} />} label="Workflows" active={page === 'Workflows'} onClick={() => onNavigate('Workflows')} />
        <SideButton icon={<BarChart3 size={17} />} label="Reports" onClick={() => onNavigate('Dashboards')} />
      </nav>
      <div className="hub-sidebar-section">
        <p>Saved views</p>
        {views.map((view) => (
          <button
            key={view}
            className={activeView === view ? 'active-view' : ''}
            type="button"
            onClick={() => { setActiveView(view); onSaveView?.(); }}
          >
            {view}
          </button>
        ))}
      </div>
      <div className="hub-sidebar-section">
        <p>Workspace</p>
        <button type="button" onClick={onInvite}><Contact size={14} /> Invite to team</button>
        <button type="button" onClick={() => onNavigate('Settings')}><Settings size={14} /> Settings</button>
        <button type="button" onClick={() => onNavigate('Settings')}><CreditCard size={14} /> Billing</button>
      </div>
    </aside>
  );
}

function FileTextIcon() {
  return <span className="hub-file-icon">N</span>;
}

function SideButton({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return <button className={active ? 'active' : ''} type="button" onClick={onClick}>{icon}<span>{label}</span></button>;
}

function PageHeader({ title, subtitle, object, ctaLabel, onImport, onExport, onAdd }: { title: string; subtitle: string; object: string; ctaLabel?: string; onImport?: () => void; onExport?: () => void; onAdd?: () => void }) {
  return (
    <section className="hub-page-head">
      <div>
        <p className="hub-eyebrow">{object === 'Person' ? 'CRM Contacts' : `${object}s`}</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>
      <div className="hub-page-actions">
        <button type="button" onClick={onImport}><Upload size={15} /> Import</button>
        <button type="button" onClick={onExport}><Download size={15} /> Export</button>
        <button className="primary" type="button" onClick={onAdd}><Plus size={16} /> {ctaLabel || `Create ${object}`}</button>
      </div>
    </section>
  );
}

function DashboardPage({ onOpenCommand, onAdd }: { onOpenCommand?: () => void; onAdd?: () => void }) {
  return (
    <>
      <section className="hub-dashboard-hero">
        <div>
          <p className="hub-eyebrow">Sales workspace</p>
          <h1>Dashboard</h1>
          <span>Monitor revenue, pipeline movement, tasks, and team activity.</span>
        </div>
        <div className="hub-page-actions">
          <button type="button" onClick={onOpenCommand}><SlidersHorizontal size={15} /> Customize</button>
          <button className="primary" type="button" onClick={onAdd}><Plus size={16} /> Quick Add</button>
        </div>
      </section>
      <section className="hub-kpi-grid">
        <Kpi icon={<LineChart size={22} />} label="Total Revenue" value="$2.45M" trend="+25.3%" />
        <Kpi icon={<BriefcaseBusiness size={22} />} label="Active Deals" value="42" trend="+12.5%" />
        <Kpi icon={<Target size={22} />} label="New Leads" value="128" trend="+18.7%" />
        <Kpi icon={<CheckCircle2 size={22} />} label="Tasks Completed" value="256" trend="+15.3%" />
      </section>
      <section className="hub-dashboard-grid">
        <Panel title="Revenue overview" action="This year"><RevenueChart /></Panel>
        <Panel title="Sales pipeline" action="This month"><PipelineBoard /></Panel>
        <Panel title="Upcoming tasks" action="View all"><TaskList /></Panel>
        <Panel title="Deals by source"><Donut /></Panel>
        <Panel title="Recent activity" className="wide"><ActivityList /></Panel>
      </section>
    </>
  );
}

function CompaniesPage({ onImport, onExport, onAdd }: { onImport?: () => void; onExport?: () => void; onAdd?: () => void }) {
  return (
    <>
      <PageHeader title="Companies" subtitle="Manage accounts, owners, domains, lifecycle stage, and revenue." object="Company" onImport={onImport} onExport={onExport} onAdd={onAdd} />
      <ObjectPageLayout filters={['Owner', 'Lifecycle stage', 'Industry', 'Employees', 'Last activity']}>
        <ObjectToolbar views={['All companies', 'My companies', 'Active customers', 'Recently created']} placeholder="Search companies" onFilter={onImport} onSort={onExport} />
        <table className="hub-table">
          <thead><tr><th><Check /></th><th>Company name</th><th>Domain</th><th>Industry</th><th>Employees</th><th>Owner</th><th>Status</th><th>Revenue</th><th /></tr></thead>
          <tbody>{companies.map((row, index) => <tr key={row[0]}><td><Check /></td><td><CompanyCell name={row[0]} index={index} /></td><td>{row[2]}</td><td>{row[1]}</td><td>{row[3]}</td><td>{row[4]}</td><td><Badge label={row[5]} /></td><td>{row[6]}</td><td><MoreHorizontal size={17} /></td></tr>)}</tbody>
        </table>
        <Pagination label="Showing 1-8 of 12 companies" />
      </ObjectPageLayout>
    </>
  );
}

function PeoplePage({ onImport, onExport, onAdd }: { onImport?: () => void; onExport?: () => void; onAdd?: () => void }) {
  return (
    <>
      <PageHeader title="Contacts" subtitle="Track every customer, lead, vendor, and relationship touchpoint." object="Person" onImport={onImport} onExport={onExport} onAdd={onAdd} />
      <ObjectPageLayout filters={['Contact owner', 'Lead status', 'Company', 'Tags', 'Last contacted']}>
        <ObjectToolbar views={['All contacts', 'Customers', 'Leads', 'Vendors', 'Inactive']} placeholder="Search contacts" onFilter={onImport} onSort={onExport} />
        <table className="hub-table">
          <thead><tr><th><Check /></th><th>Name</th><th>Email</th><th>Company</th><th>Job title</th><th>Phone</th><th>Status</th><th>Tags</th><th>Last contact</th><th /></tr></thead>
          <tbody>{people.map((row, index) => <tr key={row[0]}><td><Check /></td><td><PersonCell name={row[0]} index={index} /></td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><Badge label={row[5]} /></td><td><Tags tags={row[6]} /></td><td>{row[7]}</td><td><MoreHorizontal size={17} /></td></tr>)}</tbody>
        </table>
        <Pagination label="Showing 1-8 of 1,248 contacts" />
      </ObjectPageLayout>
    </>
  );
}

function LeadsPage({ onImport, onExport, onAdd }: { onImport?: () => void; onExport?: () => void; onAdd?: () => void }) {
  return (
    <>
      <PageHeader title="Leads" subtitle="Prioritize pipeline work with lead score, source, owner, and last activity." object="Lead" onImport={onImport} onExport={onExport} onAdd={onAdd} />
      <ObjectPageLayout filters={['Lead owner', 'Lead status', 'Lead score', 'Source', 'Last contacted']}>
        <ObjectToolbar views={['All leads', 'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed won']} placeholder="Search leads" onFilter={onImport} onSort={onExport} />
        <table className="hub-table">
          <thead><tr><th><Check /></th><th>Lead</th><th>Company</th><th>Status</th><th>Score</th><th>Source</th><th>Owner</th><th>Last contact</th><th /></tr></thead>
          <tbody>{leads.map((row, index) => <tr key={row[0]}><td><Check /></td><td><PersonCell name={row[0]} meta={`${row[1]} - ${row[2]}`} index={index} /></td><td>{row[3]}</td><td><Badge label={row[4]} /></td><td><strong className="hub-score">{row[5]}</strong></td><td>{row[6]}</td><td>{row[7]}</td><td>{row[8]}</td><td><MoreHorizontal size={17} /></td></tr>)}</tbody>
        </table>
        <Pagination label="Showing 1-8 of 256 leads" />
      </ObjectPageLayout>
    </>
  );
}

function DealsPage({ onImport, onExport, onAdd }: { onImport?: () => void; onExport?: () => void; onAdd?: () => void }) {
  return (
    <>
      <PageHeader title="Deals" subtitle="Manage opportunities, stages, close dates, ownership, and forecast value." object="Deal" onImport={onImport} onExport={onExport} onAdd={onAdd} />
      <section className="hub-kpi-grid">
        <Kpi icon={<BriefcaseBusiness size={22} />} label="Open Deals" value="42" trend="+12.5%" />
        <Kpi icon={<LineChart size={22} />} label="Pipeline Value" value="$2.45M" trend="+25.3%" />
        <Kpi icon={<Target size={22} />} label="Weighted Forecast" value="$860K" trend="+9.4%" />
        <Kpi icon={<CheckCircle2 size={22} />} label="Won This Month" value="12" trend="+18.1%" />
      </section>
      <ObjectPageLayout filters={['Deal owner', 'Deal stage', 'Close date', 'Amount', 'Forecast category']}>
        <ObjectToolbar views={['All deals', 'My deals', 'Open deals', 'Closing this month', 'Closed won']} placeholder="Search deals" onFilter={onImport} onSort={onExport} />
        <div className="hub-deal-stage-strip">
          {['New Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'].map((stage, index) => (
            <div key={stage}>
              <b>{stage}</b>
              <span>{[128, 64, 34, 18, 12][index]} records</span>
              <strong>{['$420,000', '$280,000', '$210,000', '$180,000', '$160,000'][index]}</strong>
            </div>
          ))}
        </div>
        <table className="hub-table">
          <thead><tr><th><Check /></th><th>Deal name</th><th>Company</th><th>Stage</th><th>Amount</th><th>Owner</th><th>Close date</th><th>Priority</th><th /></tr></thead>
          <tbody>{deals.map((row, index) => <tr key={row[0]}><td><Check /></td><td><CompanyCell name={row[0]} index={index} /></td><td>{row[1]}</td><td><Badge label={row[2]} /></td><td><strong className="hub-score">{row[3]}</strong></td><td>{row[4]}</td><td>{row[5]}</td><td><Badge label={row[6]} /></td><td><MoreHorizontal size={17} /></td></tr>)}</tbody>
        </table>
        <Pagination label="Showing 1-8 of 42 deals" />
      </ObjectPageLayout>
    </>
  );
}

function GenericModulePage({
  page,
  onImport,
  onExport,
  onAdd,
  onOpenChat,
  onOpenCommand,
  onInvite,
  onSaveView,
  onSort,
}: {
  page: string;
  onImport?: () => void;
  onExport?: () => void;
  onAdd?: () => void;
  onOpenChat?: () => void;
  onOpenCommand?: () => void;
  onInvite?: () => void;
  onSaveView?: () => void;
  onSort?: () => void;
}) {
  const meta = moduleMeta[page] || {
    title: page,
    subtitle: 'Manage CRM records, ownership, activity, and business context.',
    eyebrow: 'Workspace',
    cta: `Create ${page.replace(/s$/, '')}`,
    filters: ['Owner', 'Status', 'Company', 'Date', 'Priority'],
    views: ['All records', 'Assigned to me', 'Recently updated', 'Needs attention'],
  };

  if (page === 'Settings') {
    return (
      <>
        <PageHeader title="Settings" subtitle={meta.subtitle} object="Setting" ctaLabel="Invite to team" onImport={onOpenCommand} onExport={onExport} onAdd={onInvite} />
        <section className="hub-settings-grid">
          {[
            ['Team & permissions', 'Invite users, assign roles, and control CRM access.', 'Invite to team'],
            ['Email & notifications', 'Configure Resend, CRM notifications, and meeting reminders.', 'Send test email'],
            ['Integrations', 'Manage Gemini, Supabase, Clerk, calendar, WhatsApp, and webhooks.', 'Open integrations'],
            ['Billing', 'Review subscription, invoices, payment methods, and plan limits.', 'Open billing'],
            ['Data management', 'Import, export, rollback, and validate CRM records.', 'Open import center'],
            ['Security audit', 'Review activity logs, sessions, audit trails, and account health.', 'Open audit logs'],
          ].map((card, index) => (
            <article className="hub-settings-card" key={card[0]}>
              <span>{index + 1}</span>
              <h2>{card[0]}</h2>
              <p>{card[1]}</p>
              <button type="button" onClick={index === 0 ? onInvite : index === 1 ? onImport : onOpenCommand}>{card[2]}</button>
            </article>
          ))}
        </section>
      </>
    );
  }

  if (page.startsWith('AI')) {
    return (
      <>
        <PageHeader title={meta.title} subtitle={meta.subtitle} object="AI" ctaLabel="Open AI Ask" onImport={onOpenCommand} onExport={onExport} onAdd={onOpenChat} />
        <section className="hub-ai-panel">
          <div>
            <Sparkles size={26} />
            <h2>Digital Wave AI is ready</h2>
            <p>Use the AI button to ask about recent CRM activity, deals, leads, tasks, meetings, and next actions.</p>
            <button type="button" onClick={onOpenChat}>Open AI Ask</button>
          </div>
          <div className="hub-ai-prompts">
            {['What changed recently in my CRM?', 'Which deals need follow-up?', 'Summarize overdue tasks', 'What should sales do next?'].map((prompt) => (
              <button type="button" key={prompt} onClick={onOpenChat}>{prompt}</button>
            ))}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title={meta.title} subtitle={meta.subtitle} object={meta.title.replace(/s$/, '')} ctaLabel={meta.cta} onImport={onImport} onExport={onExport} onAdd={onAdd} />
      <section className="hub-kpi-grid">
        <Kpi icon={<CheckCircle2 size={22} />} label="Open Records" value="128" trend="+14.2%" />
        <Kpi icon={<Target size={22} />} label="High Priority" value="24" trend="+6.8%" />
        <Kpi icon={<CalendarDays size={22} />} label="Due This Week" value="36" trend="+9.1%" />
        <Kpi icon={<Activity size={22} />} label="Completed" value="256" trend="+15.3%" />
      </section>
      <ObjectPageLayout filters={meta.filters}>
        <ObjectToolbar views={meta.views} placeholder={`Search ${meta.title.toLowerCase()}`} onFilter={onOpenCommand} onSort={onSort || onOpenCommand} onColumns={onOpenCommand} onSaveView={onSaveView} />
        <table className="hub-table">
          <thead><tr><th><Check /></th><th>Name</th><th>Company</th><th>Priority</th><th>Owner</th><th>Due date</th><th>Status</th><th /></tr></thead>
          <tbody>{genericRows.map((row, index) => <tr key={`${page}-${row[0]}`}><td><Check /></td><td><CompanyCell name={row[0]} index={index} /></td><td>{row[1]}</td><td><Badge label={row[2]} /></td><td>{row[3]}</td><td>{row[4]}</td><td><Badge label={row[5]} /></td><td><MoreHorizontal size={17} /></td></tr>)}</tbody>
        </table>
        <Pagination label={`Showing 1-6 of 128 ${meta.title.toLowerCase()}`} />
      </ObjectPageLayout>
    </>
  );
}

function ObjectPageLayout({ filters, children }: { filters: string[]; children: ReactNode }) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const toggleFilter = (filter: string) => {
    setActiveFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  };
  const clearFilters = () => setActiveFilters([]);

  return (
    <section className="hub-object-layout">
      <aside className="hub-filter-panel">
        <div className="hub-filter-head"><Filter size={15} /> Filters</div>
        {filters.map((filter) => <button type="button" key={filter} className={activeFilters.includes(filter) ? 'active' : ''} onClick={() => toggleFilter(filter)}>{filter}<ChevronDown size={14} /></button>)}
        <button className="hub-save-filter" type="button" onClick={clearFilters}>{activeFilters.length ? `Clear ${activeFilters.length} filter${activeFilters.length === 1 ? '' : 's'}` : 'Save view'}</button>
      </aside>
      <div className="hub-object-card">{children}</div>
    </section>
  );
}

function ObjectToolbar({ views, placeholder, onFilter, onSort, onColumns, onSaveView }: { views: string[]; placeholder: string; onFilter?: () => void; onSort?: () => void; onColumns?: () => void; onSaveView?: () => void }) {
  const [activeView, setActiveView] = useState(views[0] || '');

  return (
    <>
      <div className="hub-view-tabs">{views.map((view) => <button className={activeView === view ? 'active' : ''} type="button" key={view} onClick={() => { setActiveView(view); onSaveView?.(); }}>{view}</button>)}</div>
      <div className="hub-object-tools">
        <label><Search size={16} /><input placeholder={placeholder} /></label>
        <span />
        <button type="button" onClick={onFilter}><Filter size={15} /> Filter</button>
        <button type="button" onClick={onSort}><SortAsc size={15} /> Sort</button>
        <button type="button" onClick={onColumns || onFilter}><Columns3 size={15} /> Edit columns</button>
      </div>
    </>
  );
}

function Kpi({ icon, label, value, trend }: { icon: ReactNode; label: string; value: string; trend: string }) {
  return <div className="hub-kpi"><div className="hub-kpi-icon">{icon}</div><p>{label}</p><strong>{value}</strong><span>{trend} vs last month</span></div>;
}

function Panel({ title, action, className = '', children }: { title: string; action?: string; className?: string; children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return <section className={`hub-panel ${className}`}><div className="hub-panel-head"><h2>{title}</h2>{action && <button type="button" onClick={() => setExpanded((value) => !value)} className={expanded ? 'active' : ''}>{expanded ? 'Expanded' : action}<ChevronDown size={13} /></button>}</div>{children}</section>;
}

function RevenueChart() {
  return (
    <div className="hub-chart">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={revenueData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs><linearGradient id="waveRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0284ff" stopOpacity={0.26} /><stop offset="100%" stopColor="#0284ff" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid stroke="#dbe5f3" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#51627a', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#51627a', fontSize: 12 }} />
          <Area dataKey="forecast" type="monotone" stroke="#06c8dc" strokeDasharray="5 5" strokeWidth={2} fill="transparent" dot={false} />
          <Area dataKey="revenue" type="monotone" stroke="#0284ff" strokeWidth={3} fill="url(#waveRevenue)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function PipelineBoard() {
  const stages = [['New Lead', '128', '$420,000'], ['Qualified', '64', '$280,000'], ['Proposal', '34', '$152,000'], ['Negotiation', '18', '$98,000']];
  return <div className="hub-pipeline">{stages.map((stage) => <div key={stage[0]}><b>{stage[0]}</b><span>{stage[1]} records</span><strong>{stage[2]}</strong></div>)}</div>;
}

function TaskList() {
  const tasks = ['Follow up with NovaGrid Systems', 'Prepare proposal for Blue Harbor', 'Call DataPulse Labs', 'Demo for SkyBridge Tech'];
  return <div className="hub-task-list">{tasks.map((task, index) => <div key={task}><CheckCircle2 size={17} /><span><b>{task}</b><small>{index % 2 ? 'Sarah Lee' : 'Mahmoud Mostafa'} - May {23 + index}, 2025</small></span><Badge label={index % 2 ? 'Medium' : 'High'} /></div>)}</div>;
}

function Donut() {
  return <div className="hub-donut"><div className="hub-donut-chart"><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={sourceData} dataKey="value" innerRadius={55} outerRadius={82} stroke="none">{sourceData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><strong>128</strong><span>Total deals</span></div><ul>{sourceData.map((item) => <li key={item.name}><i style={{ background: item.color }} />{item.name}<span>{item.value}</span></li>)}</ul></div>;
}

function ActivityList() {
  return <div className="hub-activity-list">{companies.slice(0, 5).map((company, index) => <div key={company[0]}><Activity size={16} /><span><b>{company[0]}</b><small>{index % 2 ? 'Company updated' : 'New deal created'}</small></span><time>{index + 2}h ago</time></div>)}</div>;
}

function CompanyCell({ name, index }: { name: string; index: number }) {
  return <div className="hub-name-cell"><LogoLetter text={name} index={index} /><span><b>{name}</b><small>Company record</small></span></div>;
}

function PersonCell({ name, meta, index }: { name: string; meta?: string; index: number }) {
  return <div className="hub-name-cell"><Avatar name={name} index={index} /><span><b>{name}</b>{meta && <small>{meta}</small>}</span></div>;
}

function LogoLetter({ text, index }: { text: string; index: number }) {
  return <i className={`hub-letter letter-${index % 6}`}>{text.slice(0, 1)}</i>;
}

function Avatar({ name, index = 0 }: { name: string; index?: number }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2);
  return <i className={`hub-avatar avatar-${index % 6}`}>{initials}</i>;
}

function Badge({ label }: { label: string }) {
  return <em className={`hub-badge ${label.toLowerCase().replace(/\s+/g, '-')}`}>{label}</em>;
}

function Tags({ tags }: { tags: string }) {
  return <span className="hub-tags">{tags.split(', ').map((tag) => <Badge key={tag} label={tag} />)}</span>;
}

function Check() {
  return <span className="hub-check" />;
}

function Pagination({ label }: { label: string }) {
  const [page, setPage] = useState(1);
  return (
    <div className="hub-pagination">
      <span>{label}</span>
      <div>
        <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))}>Prev</button>
        <button className={page === 1 ? 'active' : ''} type="button" onClick={() => setPage(1)}>1</button>
        <button className={page === 2 ? 'active' : ''} type="button" onClick={() => setPage(2)}>2</button>
        <button type="button" onClick={() => setPage((value) => Math.min(2, value + 1))}>Next</button>
      </div>
    </div>
  );
}

function InviteTeamModal({ onClose }: { onClose: () => void }) {
  const { inviteUser, isManager } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setMessage('');
    setInviteLink('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!isManager) {
      setError('Only owners, admins, and managers can invite teammates.');
      return;
    }
    setLoading(true);
    const result = await inviteUser(cleanEmail, role as any);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage(result.warning || 'Invitation sent successfully.');
    setInviteLink(result.inviteLink || '');
    setEmail('');
    setRole('Employee');
  };

  return (
    <div className="hub-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="invite-team-title">
      <section className="hub-invite-modal">
        <div className="hub-invite-head">
          <div>
            <p className="hub-eyebrow">Team access</p>
            <h2 id="invite-team-title">Invite to team</h2>
            <span>Send a secure Digital Wave CRM invitation with the correct role.</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">x</button>
        </div>

        <label className="hub-form-field">
          <span>Email address</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teammate@company.com" type="email" />
        </label>

        <label className="hub-form-field">
          <span>Role</span>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            {['Admin', 'Manager', 'Employee', 'Viewer'].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <div className="hub-role-note">
          <b>{role}</b>
          <p>{role === 'Admin' ? 'Can manage workspace settings, users, data, and CRM records.' : role === 'Manager' ? 'Can invite users and manage team CRM work.' : role === 'Employee' ? 'Can create and manage assigned CRM records.' : 'Can view CRM data without making changes.'}</p>
        </div>

        {error && <div className="hub-invite-alert error">{error}</div>}
        {message && <div className="hub-invite-alert success">{message}</div>}
        {inviteLink && <div className="hub-invite-link"><span>Invite link</span><code>{inviteLink}</code></div>}

        <div className="hub-invite-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary" type="button" onClick={submit} disabled={loading || !email.trim()}>{loading ? 'Sending...' : 'Send invite'}</button>
        </div>
      </section>
    </div>
  );
}
