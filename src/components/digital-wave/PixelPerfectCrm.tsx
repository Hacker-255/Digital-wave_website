import {
  Activity, BarChart3, Bell, BriefcaseBusiness, Building2, CalendarDays,
  CheckCircle2, ChevronDown, CircleHelp, Columns3, Contact, CreditCard, Download,
  Filter, Home, LineChart, Mail, Menu, MoreHorizontal, Plus, Search, Settings,
  SlidersHorizontal, SortAsc, Sparkles, Target, Upload, Workflow,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import logoUrl from '../../assets/digital-wave-brand-logo.png';

type Page = 'Dashboard' | 'Companies' | 'People' | 'Leads' | 'Deals';

type PixelPerfectCrmProps = {
  page: Page;
  onNavigate: (page: string) => void;
  onOpenChat?: () => void;
  onOpenCommand?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onAdd?: (type: 'Companies' | 'People' | 'Leads' | 'Deals') => void;
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

const sideViews = {
  Dashboard: ['Sales overview', 'Pipeline forecast', 'Team productivity', 'Recent activity'],
  Companies: ['All companies', 'My companies', 'Recently created', 'Active customers', 'Needs follow-up'],
  People: ['All contacts', 'My contacts', 'Customers', 'Leads', 'Inactive contacts'],
  Leads: ['All leads', 'New leads', 'Contacted', 'Qualified', 'Proposal', 'Closed won'],
  Deals: ['All deals', 'My deals', 'Open deals', 'Closing this month', 'Closed won'],
} as const;

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

export function PixelPerfectCrm({ page, onNavigate, onOpenChat, onOpenCommand, onImport, onExport, onAdd }: PixelPerfectCrmProps) {
  return (
    <div className="hub-crm">
      <HubTopbar activePage={page} onNavigate={onNavigate} onOpenChat={onOpenChat} onOpenCommand={onOpenCommand} />
      <div className="hub-body">
        <HubSidebar page={page} onNavigate={onNavigate} />
        <main className="hub-main">
          {page === 'Dashboard' && <DashboardPage onOpenCommand={onOpenCommand} onAdd={() => onAdd?.('People')} />}
          {page === 'Companies' && <CompaniesPage onImport={onImport} onExport={onExport} onAdd={() => onAdd?.('Companies')} />}
          {page === 'People' && <PeoplePage onImport={onImport} onExport={onExport} onAdd={() => onAdd?.('People')} />}
          {page === 'Leads' && <LeadsPage onImport={onImport} onExport={onExport} onAdd={() => onAdd?.('Leads')} />}
          {page === 'Deals' && <DealsPage onImport={onImport} onExport={onExport} onAdd={() => onAdd?.('Deals')} />}
        </main>
      </div>
    </div>
  );
}

function HubTopbar({ activePage, onNavigate, onOpenChat, onOpenCommand }: { activePage: Page; onNavigate: (page: string) => void; onOpenChat?: () => void; onOpenCommand?: () => void }) {
  return (
    <header className="hub-topbar">
      <button className="hub-menu" type="button" aria-label="Menu"><Menu size={20} /></button>
      <button className="hub-brand" type="button" onClick={() => onNavigate('Dashboards')}>
        <img src={logoUrl} alt="Digital Wave" />
        <span>Digital Wave</span>
      </button>
      <nav className="hub-topnav">
        {topNav.map(([label, target]) => (
          <button key={label} className={target === activePage || (activePage === 'Dashboard' && target === 'Dashboards') ? 'active' : ''} onClick={() => onNavigate(target)} type="button">
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
      <button className="hub-icon-btn" type="button" aria-label="Notifications"><Bell size={18} /><em>3</em></button>
      <button className="hub-icon-btn" type="button" onClick={onOpenCommand} aria-label="Help"><CircleHelp size={18} /></button>
      <div className="hub-user"><Avatar name="Mahmoud Mostafa" /><span>Mahmoud</span><ChevronDown size={13} /></div>
    </header>
  );
}

function HubSidebar({ page, onNavigate }: { page: Page; onNavigate: (page: string) => void }) {
  return (
    <aside className="hub-sidebar">
      <button className="hub-create" type="button"><Plus size={16} /> Create</button>
      <nav className="hub-sidebar-nav">
        <SideButton icon={<Home size={17} />} label="Dashboard" active={page === 'Dashboard'} onClick={() => onNavigate('Dashboards')} />
        <SideButton icon={<Contact size={17} />} label="Contacts" active={page === 'People'} onClick={() => onNavigate('People')} />
        <SideButton icon={<Building2 size={17} />} label="Companies" active={page === 'Companies'} onClick={() => onNavigate('Companies')} />
        <SideButton icon={<Target size={17} />} label="Leads" active={page === 'Leads'} onClick={() => onNavigate('Leads')} />
        <SideButton icon={<BriefcaseBusiness size={17} />} label="Deals" active={page === 'Deals'} onClick={() => onNavigate('Deals')} />
        <SideButton icon={<CalendarDays size={17} />} label="Tasks" onClick={() => onNavigate('Tasks')} />
        <SideButton icon={<Mail size={17} />} label="Email" onClick={() => onNavigate('Settings')} />
        <SideButton icon={<Workflow size={17} />} label="Workflows" onClick={() => onNavigate('Workflows')} />
        <SideButton icon={<BarChart3 size={17} />} label="Reports" onClick={() => onNavigate('Dashboards')} />
      </nav>
      <div className="hub-sidebar-section">
        <p>Saved views</p>
        {sideViews[page].map((view, index) => <button key={view} className={index === 0 ? 'active-view' : ''} type="button">{view}</button>)}
      </div>
      <div className="hub-sidebar-section">
        <p>Workspace</p>
        <button type="button"><Settings size={14} /> Settings</button>
        <button type="button"><CreditCard size={14} /> Billing</button>
      </div>
    </aside>
  );
}

function SideButton({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return <button className={active ? 'active' : ''} type="button" onClick={onClick}>{icon}<span>{label}</span></button>;
}

function PageHeader({ title, subtitle, object, onImport, onExport, onAdd }: { title: string; subtitle: string; object: 'Company' | 'Person' | 'Lead' | 'Deal'; onImport?: () => void; onExport?: () => void; onAdd?: () => void }) {
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
        <button className="primary" type="button" onClick={onAdd}><Plus size={16} /> Create {object}</button>
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
        <ObjectToolbar views={['All companies', 'My companies', 'Active customers', 'Recently created']} placeholder="Search companies" />
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
        <ObjectToolbar views={['All contacts', 'Customers', 'Leads', 'Vendors', 'Inactive']} placeholder="Search contacts" />
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
        <ObjectToolbar views={['All leads', 'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed won']} placeholder="Search leads" />
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
        <ObjectToolbar views={['All deals', 'My deals', 'Open deals', 'Closing this month', 'Closed won']} placeholder="Search deals" />
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

function ObjectPageLayout({ filters, children }: { filters: string[]; children: ReactNode }) {
  return (
    <section className="hub-object-layout">
      <aside className="hub-filter-panel">
        <div className="hub-filter-head"><Filter size={15} /> Filters</div>
        {filters.map((filter) => <button type="button" key={filter}>{filter}<ChevronDown size={14} /></button>)}
        <button className="hub-save-filter" type="button">Save view</button>
      </aside>
      <div className="hub-object-card">{children}</div>
    </section>
  );
}

function ObjectToolbar({ views, placeholder }: { views: string[]; placeholder: string }) {
  return (
    <>
      <div className="hub-view-tabs">{views.map((view, index) => <button className={index === 0 ? 'active' : ''} type="button" key={view}>{view}</button>)}</div>
      <div className="hub-object-tools">
        <label><Search size={16} /><input placeholder={placeholder} /></label>
        <span />
        <button type="button"><Filter size={15} /> Filter</button>
        <button type="button"><SortAsc size={15} /> Sort</button>
        <button type="button"><Columns3 size={15} /> Edit columns</button>
      </div>
    </>
  );
}

function Kpi({ icon, label, value, trend }: { icon: ReactNode; label: string; value: string; trend: string }) {
  return <div className="hub-kpi"><div className="hub-kpi-icon">{icon}</div><p>{label}</p><strong>{value}</strong><span>{trend} vs last month</span></div>;
}

function Panel({ title, action, className = '', children }: { title: string; action?: string; className?: string; children: ReactNode }) {
  return <section className={`hub-panel ${className}`}><div className="hub-panel-head"><h2>{title}</h2>{action && <button type="button">{action}<ChevronDown size={13} /></button>}</div>{children}</section>;
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
  return <div className="hub-pagination"><span>{label}</span><div><button type="button">Prev</button><button className="active" type="button">1</button><button type="button">2</button><button type="button">Next</button></div></div>;
}
