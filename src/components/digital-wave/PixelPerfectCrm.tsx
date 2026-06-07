import { useMemo } from 'react';
import {
  Bell, BriefcaseBusiness, Building2, CalendarDays, CheckCircle2, ChevronDown,
  CircleHelp, Columns3, CreditCard, FileText, FolderKanban, Home, Import,
  LayoutGrid, Mail, Menu, MoreHorizontal, Network, PanelLeftClose, Plus,
  Search, Settings, Shield, SlidersHorizontal, SortAsc, Star, Target,
  Upload, Users, Workflow,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

type Page = 'Dashboard' | 'Companies' | 'People' | 'Leads';

type PixelPerfectCrmProps = {
  page: Page;
  onNavigate: (page: string) => void;
  onOpenChat?: () => void;
  onOpenCommand?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onAdd?: (type: 'Companies' | 'People' | 'Leads') => void;
};

const people = [
  ['John Doe', 'john@novagrid.com', 'NovaGrid Systems', 'CTO', '+1 (555) 123-4567', 'Customer', ['Technology', 'Important'], '2 hours ago', 'Mahmoud Mostafa'],
  ['Sarah Lee', 'sarah@northstar.com', 'Northstar Automation', 'Head of Ops', '+1 (555) 987-6543', 'Customer', ['Automation', 'VIP'], '1 day ago', 'Asmaa Hassan'],
  ['Mike Ross', 'mike@blueharbor.com', 'Blue Harbor Logistics', 'Operations Manager', '+1 (555) 456-7890', 'Customer', ['Logistics', 'Important'], '2 days ago', 'Mahmoud Mostafa'],
  ['Emily Carter', 'emily@skybridge.com', 'SkyBridge Tech', 'Sales Director', '+1 (555) 234-5678', 'Lead', ['Technology', 'New'], '3 days ago', 'Asmaa Hassan'],
  ['David Wilson', 'david@datapulse.com', 'DataPulse Labs', 'Product Manager', '+1 (555) 345-6789', 'Customer', ['Software', 'VIP'], '4 days ago', 'Omar Khaled'],
  ['James Miller', 'james@apex.com', 'Apex Software', 'CEO', '+1 (555) 876-5432', 'Lead', ['Software', 'New'], '5 days ago', 'Mahmoud Mostafa'],
  ['Olivia Taylor', 'olivia@cloudbase.com', 'CloudBase Corp', 'Cloud Architect', '+1 (555) 654-3210', 'Customer', ['Cloud', 'Important'], '6 days ago', 'Asmaa Hassan'],
  ['Daniel Kim', 'daniel@arcanum.com', 'Arcanum Systems', 'IT Manager', '+1 (555) 321-0987', 'Lead', ['Technology', 'New'], '1 week ago', 'Omar Khaled'],
] as const;

const companies = [
  ['NovaGrid Systems', 'Technology', 'novagrid.example', '5,000', 'John Doe', 'Active'],
  ['Northstar Automation', 'Automation', 'northstar.example', '1,100', 'Sarah Lee', 'Active'],
  ['Blue Harbor Logistics', 'Logistics', 'blueharbor.example', '8,000', 'Mike Ross', 'Active'],
  ['SkyBridge Tech', 'Technology', 'skybridge.example', '800', 'John Doe', 'Active'],
  ['DataPulse Labs', 'Software', 'datapulse.example', '400', 'Sarah Lee', 'Active'],
  ['Apex Software', 'Software', 'apex.example', '2,500', 'Mike Ross', 'Inactive'],
  ['CloudBase Corp', 'Cloud Services', 'cloudbase.example', '3,200', 'John Doe', 'Active'],
  ['Arcanum Systems', 'Technology', 'arcanum.example', '1,700', 'Sarah Lee', 'Active'],
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

const nav = [
  ['Dashboard', Home], ['Companies', Building2], ['People', Users], ['Opportunities', Shield],
  ['Leads', Target], ['Deals', FileText], ['Tasks', CheckCircle2], ['Meetings', CalendarDays],
  ['Projects', FolderKanban], ['Notes', FileText], ['Email', Mail], ['Reports', LayoutGrid],
  ['Workflows', Workflow], ['Calendar', CalendarDays],
] as const;

const bottomNav = [
  ['Settings', Settings], ['Team', Users], ['Integrations', Network], ['Billing', CreditCard],
] as const;

const companyColors = ['purple', 'black', 'blue', 'sky', 'orange', 'red', 'dark', 'green'];
const avatarClasses = ['male', 'female', 'male2', 'female2'];
const revenueData = [
  { month: 'Jan', thisYear: 600, lastYear: 320 },
  { month: 'Feb', thisYear: 850, lastYear: 420 },
  { month: 'Mar', thisYear: 920, lastYear: 390 },
  { month: 'Apr', thisYear: 1450, lastYear: 680 },
  { month: 'May', thisYear: 1400, lastYear: 620 },
  { month: 'Jun', thisYear: 1950, lastYear: 980 },
  { month: 'Jul', thisYear: 2450, lastYear: 1050 },
  { month: 'Aug', thisYear: undefined, lastYear: 1450 },
  { month: 'Sep', thisYear: undefined, lastYear: 1650 },
  { month: 'Oct', thisYear: undefined, lastYear: 1500 },
  { month: 'Nov', thisYear: undefined, lastYear: 2100 },
  { month: 'Dec', thisYear: undefined, lastYear: 2450 },
];
const sourceData = [
  { name: 'Website', value: 40, color: '#6038f6' },
  { name: 'Referral', value: 32, color: '#2f90fa' },
  { name: 'LinkedIn', value: 24, color: '#36c985' },
  { name: 'Email', value: 16, color: '#fb8b2c' },
  { name: 'Other', value: 16, color: '#d0d5dd' },
];
const insightData = [
  { name: 'Active', value: 8, color: '#2f90fa' },
  { name: 'Inactive', value: 2, color: '#98a2b3' },
  { name: 'Prospect', value: 2, color: '#fb8b2c' },
];

export function PixelPerfectCrm({ page, onNavigate, onOpenChat, onOpenCommand, onImport, onExport, onAdd }: PixelPerfectCrmProps) {
  const content = useMemo(() => {
    if (page === 'Companies') return <CompaniesPage onImport={onImport} onExport={onExport} onAdd={() => onAdd?.('Companies')} />;
    if (page === 'People') return <PeoplePage onImport={onImport} onExport={onExport} onAdd={() => onAdd?.('People')} />;
    if (page === 'Leads') return <LeadsPage onImport={onImport} onExport={onExport} onAdd={() => onAdd?.('Leads')} />;
    return <DashboardPage onOpenCommand={onOpenCommand} onAdd={() => onAdd?.('People')} />;
  }, [onAdd, onExport, onImport, onOpenCommand, page]);

  return (
    <div className="pp-crm-root">
      <div className="pp-crm-shell">
        <Sidebar page={page} onNavigate={onNavigate} onOpenChat={onOpenChat} />
        <main className="pp-main">{content}</main>
      </div>
    </div>
  );
}

function Sidebar({ page, onNavigate, onOpenChat }: { page: Page; onNavigate: (page: string) => void; onOpenChat?: () => void }) {
  return (
    <aside className="pp-sidebar">
      <div className="pp-brand"><div className="pp-logo-mark" /><span>Digital Wave</span><button className="pp-hamb" type="button" aria-label="Open menu"><Menu size={19} /></button></div>
      <div className="pp-profile">
        <Avatar name="Mahmoud Mostafa" size="lg" />
        <div><b>Mahmoud Mostafa</b><small>Admin</small></div>
        <ChevronDown className="pp-chev" size={16} />
      </div>
      <button className="pp-new-btn" type="button" onClick={onOpenChat}><Plus size={18} /> New <ChevronDown size={15} /></button>
      <nav className="pp-nav">
        {nav.map(([label, Icon]) => (
          <button key={label} onClick={() => onNavigate(label)} className={page === label ? 'active' : ''} type="button">
            <span className="pp-nav-ico"><Icon size={16} /></span>{label}
          </button>
        ))}
      </nav>
      <nav className="pp-nav pp-bottom">
        {bottomNav.map(([label, Icon]) => (
          <button key={label} onClick={() => onNavigate(label)} type="button"><span className="pp-nav-ico"><Icon size={16} /></span>{label}</button>
        ))}
      </nav>
      <button className="pp-collapse" type="button"><span><PanelLeftClose size={15} /></span> Collapse</button>
    </aside>
  );
}

function PageTop({ title, subtitle, search, addText, date, onAdd, onOpenCommand }: { title: Page; subtitle?: string; search: string; addText?: string; date?: boolean; onAdd?: () => void; onOpenCommand?: () => void }) {
  const TitleIcon = title === 'Dashboard' ? LayoutGrid : title === 'Companies' ? Building2 : title === 'People' ? Users : Target;
  return (
    <>
      <div className="pp-top-row">
        <div className="pp-title-wrap">
          <h1><TitleIcon size={22} />{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="pp-top-actions">
          <div className="pp-search"><Search size={20} /><input placeholder={search} /><kbd>⌘K</kbd></div>
          {addText && <button className="pp-primary" onClick={onAdd} type="button"><Plus size={17} />{addText}</button>}
          <button className="pp-bell" type="button" aria-label="Notifications"><Bell size={20} /><em>3</em></button>
          <button className="pp-circle-help" onClick={onOpenCommand} type="button" aria-label="Help"><CircleHelp size={19} /></button>
          <Avatar name="Mahmoud Mostafa" size="md" withDot />
        </div>
      </div>
      {date && <div className="pp-dash-toolbar"><button className="pp-date" type="button"><CalendarDays size={15} /> May 16 - May 22, 2025 <ChevronDown size={15} /></button><button className="pp-ghost" onClick={onOpenCommand} type="button"><SlidersHorizontal size={15} /> Customize</button></div>}
    </>
  );
}

function EntityActions({ addText, onImport, onExport, onAdd }: { addText: string; onImport?: () => void; onExport?: () => void; onAdd?: () => void }) {
  return <div className="pp-entity-actions"><button className="pp-ghost" onClick={onImport} type="button"><Import size={15} /> Import</button><button className="pp-ghost" onClick={onExport} type="button"><Upload size={15} /> Export</button><button className="pp-primary" onClick={onAdd} type="button"><Plus size={17} />{addText}<ChevronDown size={15} /></button></div>;
}

function StatCard({ icon, label, value, change, color = 'purple', down = false, spark = false }: { icon: React.ReactNode; label: string; value: string; change: string; color?: string; down?: boolean; spark?: boolean }) {
  return (
    <div className="pp-stat-card">
      <div className={`pp-stat-ico ${color}`}>{icon}</div>
      <div><p>{label}</p><h2>{value}</h2><small className={down ? 'down' : ''}>{down ? '↓' : '↑'} {change} <span>vs last month</span></small></div>
      {spark && <MiniSpark color={color} />}
    </div>
  );
}

function DashboardPage({ onOpenCommand, onAdd }: { onOpenCommand?: () => void; onAdd?: () => void }) {
  return (
    <>
      <PageTop title="Dashboard" subtitle="Welcome back, Mahmoud 👋" search="Search anything..." addText="Quick Add" date onAdd={onAdd} onOpenCommand={onOpenCommand} />
      <section className="pp-stats pp-five">
        <StatCard icon={<BriefcaseBusiness size={28} />} label="Total Revenue" value="$2.45M" change="25.3%" color="purple" spark />
        <StatCard icon={<Building2 size={28} />} label="Active Deals" value="42" change="12.5%" color="blue" spark />
        <StatCard icon={<Target size={28} />} label="New Leads" value="128" change="18.7%" color="green" spark />
        <StatCard icon={<CheckCircle2 size={28} />} label="Tasks Completed" value="256" change="15.3%" color="orange" spark />
        <StatCard icon={<CalendarDays size={28} />} label="Meetings" value="18" change="20%" color="pink" spark />
      </section>
      <section className="pp-dashboard-grid">
        <Card title="Sales Pipeline" action="This Month" className="pp-pipeline-card"><Pipeline /></Card>
        <Card title="Revenue Overview" action="This Year" className="pp-revenue-card"><RevenueChart /></Card>
        <Card title="Upcoming Tasks" link="View All" className="pp-tasks-card"><TaskList /></Card>
        <Card title="Top Companies" link="View All" className="pp-top-companies"><TopCompanies /></Card>
        <Card title="Deals by Source" className="pp-deals-card"><DealsDonut /></Card>
        <Card title="Recent Activity" link="View All" className="pp-activity-card"><Activity /></Card>
      </section>
    </>
  );
}

function CompaniesPage({ onImport, onExport, onAdd }: { onImport?: () => void; onExport?: () => void; onAdd?: () => void }) {
  return (
    <>
      <PageTop title="Companies" search="Search companies, domains..." />
      <EntityActions addText="Add Company" onImport={onImport} onExport={onExport} onAdd={onAdd} />
      <section className="pp-stats pp-four pp-compact">
        <StatCard icon={<Building2 size={27} />} label="Total Companies" value="12" change="20%" color="purple" />
        <StatCard icon={<Users size={27} />} label="Total Employees" value="15,300" change="18%" color="blue" />
        <StatCard icon={<Target size={27} />} label="Active Deals" value="42" change="12%" color="green" />
        <StatCard icon={<LayoutGrid size={27} />} label="Total Revenue" value="$2.45M" change="25%" color="orange" />
      </section>
      <section className="pp-companies-layout">
        <Card className="pp-company-table-card" title="All Companies" titleCount="(12)" action="Filter"><CompaniesTable /></Card>
        <aside className="pp-right-panel">
          <Card title="Company Insights" action="This Month"><CompanyInsights /></Card>
          <Card title="Top Industries"><Industries /></Card>
          <Card title="Recent Activity"><Activity small /></Card>
        </aside>
      </section>
    </>
  );
}

function PeoplePage({ onImport, onExport, onAdd }: { onImport?: () => void; onExport?: () => void; onAdd?: () => void }) {
  return (
    <>
      <PageTop title="People" subtitle="Manage your contacts and relationships" search="Search people..." />
      <EntityActions addText="Add Person" onImport={onImport} onExport={onExport} onAdd={onAdd} />
      <section className="pp-stats pp-five pp-compact">
        <StatCard icon={<Users size={27} />} label="Total People" value="1,248" change="18.2%" color="purple" />
        <StatCard icon={<Building2 size={27} />} label="Customers" value="842" change="14.5%" color="blue" />
        <StatCard icon={<Target size={27} />} label="Leads" value="256" change="22.1%" color="green" />
        <StatCard icon={<Users size={27} />} label="Vendors" value="62" change="4.3%" color="orange" down />
        <StatCard icon={<Users size={27} />} label="Inactive" value="88" change="8.1%" color="pink" down />
      </section>
      <TableShell tabs={[['All People', '1,248'], ['Customers', '842'], ['Leads', '256'], ['Vendors', '62'], ['Inactive', '88']]} search={false}>
        <PeopleTable />
      </TableShell>
    </>
  );
}

function LeadsPage({ onImport, onExport, onAdd }: { onImport?: () => void; onExport?: () => void; onAdd?: () => void }) {
  return (
    <>
      <PageTop title="Leads" subtitle="Manage and track your leads pipeline" search="Search leads..." />
      <EntityActions addText="Add Lead" onImport={onImport} onExport={onExport} onAdd={onAdd} />
      <section className="pp-stats pp-five pp-compact">
        <StatCard icon={<Users size={27} />} label="Total Leads" value="256" change="22.1%" color="purple" />
        <StatCard icon={<Building2 size={27} />} label="New Leads" value="128" change="18.7%" color="blue" />
        <StatCard icon={<BriefcaseBusiness size={27} />} label="Qualified" value="64" change="15.3%" color="orange" />
        <StatCard icon={<Target size={27} />} label="Converted" value="42" change="12.5%" color="green" />
        <StatCard icon={<CalendarDays size={27} />} label="Conversion Rate" value="16.4%" change="2.4%" color="pink" />
      </section>
      <TableShell tabs={[['All Leads', '256'], ['New', '128'], ['Contacted', '64'], ['Qualified', '42'], ['Proposal', '16'], ['Negotiation', '4'], ['Closed Won', '2'], ['Closed Lost', '0']]} search>
        <LeadsTable />
      </TableShell>
    </>
  );
}

function Card({ title, titleCount, action, link, className = '', children }: { title?: string; titleCount?: string; action?: string; link?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`pp-panel ${className}`}>
      {(title || action || link) && <div className="pp-panel-head"><h3>{title} {titleCount && <span>{titleCount}</span>}</h3>{action && <button type="button">{action} <ChevronDown size={14} /></button>}{link && <a>{link}</a>}</div>}
      {children}
    </div>
  );
}

function TableShell({ tabs, search, children }: { tabs: Array<[string, string]>; search: boolean; children: React.ReactNode }) {
  return (
    <section className="pp-table-panel">
      <div className="pp-tabs">{tabs.map((tab, index) => <button className={index === 0 ? 'on' : ''} key={tab[0]} type="button">{tab[0]} <span>{tab[1]}</span></button>)}</div>
      <div className="pp-table-tools">{search && <div className="pp-inner-search"><Search size={18} /><input placeholder="Search leads..." /></div>}<span className="pp-spacer" /><button className="pp-ghost" type="button"><SlidersHorizontal size={15} /> Filter</button><button className="pp-ghost" type="button"><SortAsc size={15} /> Sort</button><button className="pp-ghost" type="button"><Columns3 size={15} /> Columns</button></div>
      {children}
      <Pagination total={search ? 'Showing 1 to 8 of 256 leads' : 'Showing 1 to 8 of 1,248 results'} pages={search ? '32' : '156'} />
    </section>
  );
}

function LeadsTable() {
  return <table className="pp-data-table pp-leads-table"><thead><tr><th><Check /></th><th>Lead</th><th>Company</th><th>Status</th><th>Lead Score</th><th>Source</th><th>Owner</th><th>Last Contact</th><th>Actions</th></tr></thead><tbody>{leads.map((row, index) => <tr key={row[0]}><td><Check /></td><td><PersonCell name={row[0]} sub={`${row[1]}\n${row[2]}`} idx={index} /></td><td><CompanyCell name={row[3]} idx={index} /></td><td><Badge text={row[4]} /></td><td><span className="pp-star"><Star size={14} fill="currentColor" /></span> {row[5]}</td><td>{row[6]}</td><td><Owner name={row[7]} idx={index} /></td><td><span className="pp-phone">☎</span> {row[8]}</td><td className="pp-dots"><MoreHorizontal size={18} /></td></tr>)}</tbody></table>;
}

function PeopleTable() {
  return <table className="pp-data-table pp-people-table"><thead><tr><th><Check /></th><th>Person</th><th>Company</th><th>Job Title</th><th>Email</th><th>Phone</th><th>Status</th><th>Tags</th><th>Last Contact</th><th>Actions</th></tr></thead><tbody>{people.map((row, index) => <tr key={row[0]}><td><Check /></td><td><PersonCell name={row[0]} sub={row[1]} idx={index} /></td><td><CompanyCell name={row[2]} idx={index} /></td><td>{row[3]}</td><td>{row[1]}</td><td>{row[4]}</td><td><Badge text={row[5]} /></td><td><div className="pp-tags">{row[6].map((tag) => <Badge key={tag} text={tag} small />)}</div></td><td><span className="pp-phone">☎</span> {row[7]}</td><td className="pp-dots"><MoreHorizontal size={18} /></td></tr>)}</tbody></table>;
}

function CompaniesTable() {
  return <><table className="pp-data-table pp-company-table"><thead><tr><th>Company</th><th>Domain</th><th>Employees</th><th>Owner</th><th>Created</th><th>Status</th><th /></tr></thead><tbody>{companies.map((row, index) => <tr key={row[0]}><td><CompanyCell name={row[0]} industry={row[1]} idx={index} large /></td><td>{row[2]}</td><td>{row[3]}</td><td><Owner name={row[4]} idx={index} /></td><td>2 days ago</td><td><Badge text={row[5]} /></td><td className="pp-dots"><MoreHorizontal size={18} /></td></tr>)}</tbody></table><Pagination total="Showing 1 to 8 of 12 results" pages="2" /></>;
}

function PersonCell({ name, sub, idx }: { name: string; sub: string; idx: number }) {
  return <div className="pp-person-cell"><Avatar name={name} size="sm" className={avatarClasses[idx % 4]} /><div><b>{name}</b>{sub.split('\n').map((item) => <small key={item}>{item}</small>)}</div></div>;
}

function CompanyCell({ name, industry, idx }: { name: string; industry?: string; idx: number; large?: boolean }) {
  return <div className="pp-company-cell"><CompanyLogo name={name} color={companyColors[idx % companyColors.length]} /><div><b>{name}</b>{industry && <small>{industry}</small>}</div></div>;
}

function Owner({ name, idx }: { name: string; idx: number }) {
  return <div className="pp-owner"><Avatar name={name} size="xs" className={avatarClasses[idx % 4]} /><span>{name}</span></div>;
}

function Check() {
  return <span className="pp-check" />;
}

function Avatar({ name, size = 'sm', className = '', withDot = false }: { name: string; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string; withDot?: boolean }) {
  return <span aria-label={name} className={`pp-avatar ${size} ${className || (name.includes('Asmaa') || name.includes('Sarah') ? 'female' : 'male')}`}>{withDot && <i />}</span>;
}

function CompanyLogo({ name, color }: { name: string; color: string }) {
  return <span className={`pp-company-logo ${color}`}>{name[0]}</span>;
}

function Badge({ text, small = false }: { text: string; small?: boolean }) {
  const key = text.toLowerCase().replace(/\s+/g, '-');
  return <span className={`pp-badge ${small ? 'small' : ''} ${key}`}>{text}</span>;
}

function Pagination({ total, pages }: { total: string; pages: string }) {
  const compact = pages === '2';
  return <div className="pp-pagination"><span>{total}</span><div><button type="button">‹</button><button className="active-page" type="button">1</button><button type="button">2</button>{!compact && <><button type="button">3</button><button type="button">4</button><button type="button">5</button><span>...</span><button type="button">{pages}</button></>}<button type="button">›</button><button className="per" type="button">8 per page <ChevronDown size={13} /></button></div></div>;
}

function MiniSpark({ color }: { color: string }) {
  return <svg className={`pp-spark ${color}`} viewBox="0 0 160 45"><polyline points="0,36 18,36 32,26 48,35 64,24 80,28 94,19 112,25 130,15 146,18 160,12" /></svg>;
}

function Pipeline() {
  const rows = [['New Lead', '128 Leads', '$420,000', 'p1'], ['Qualified', '64 Leads', '$280,000', 'p2'], ['Proposal', '34 Leads', '$152,000', 'p3'], ['Negotiation', '18 Leads', '$98,000', 'p4'], ['Closed Won', '12 Leads', '$65,000', 'p5']];
  return <div className="pp-pipeline">{rows.map((row) => <div className={row[3]} key={row[0]}><b>{row[0]}</b><small>{row[1]}</small><span>{row[2]}</span></div>)}<div className="pp-conversion"><span>Conversion Rate</span><b>18.7%</b><em>↑ 2.5% last month</em></div></div>;
}

function RevenueChart() {
  return (
    <div className="pp-revenue">
      <h2>$2,450,000</h2>
      <small>Up 25.3% vs last year</small>
      <div className="pp-chart-legend"><i />This Year <span />Last Year</div>
      <div className="pp-big-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ppRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6038f6" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#6038f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#d0d5dd" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#344054', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#344054', fontSize: 12 }} tickFormatter={(value) => `$${Number(value) / 1000}M`} />
            <Area type="monotone" dataKey="thisYear" stroke="#6038f6" strokeWidth={3} fill="url(#ppRevenueFill)" connectNulls={false} dot={false} />
            <Area type="monotone" dataKey="lastYear" stroke="#98a2b3" strokeWidth={2} fill="transparent" strokeDasharray="6 6" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
function TaskList() {
  const rows = [['Follow up with NovaGrid Systems', 'Mahmoud Mostafa - May 23, 10:00 AM', 'High'], ['Prepare proposal for Blue Harbor', 'Sarah Lee - May 23, 1:30 PM', 'Medium'], ['Call DataPulse Labs', 'John Doe - May 24, 11:00 AM', 'High'], ['Demo for SkyBridge Tech', 'Mike Ross - May 24, 3:00 PM', 'Medium'], ['Send contract to Apex Software', 'Sarah Lee - May 25, 9:00 AM', 'Low']];
  return <div className="pp-task-list">{rows.map((row) => <div key={row[0]}><span className="pp-empty-round"><CheckCircle2 size={12} /></span><div><b><Building2 size={13} /> {row[0]}</b><small>{row[1]}</small></div><Badge text={row[2]} small /></div>)}</div>;
}

function TopCompanies() {
  const rows = [['NovaGrid Systems', '$320,000'], ['Blue Harbor Logistics', '$280,000'], ['Apex Software', '$210,000'], ['DataPulse Labs', '$180,000'], ['SkyBridge Tech', '$160,000']];
  return <div className="pp-top-company-list">{rows.map((row, index) => <div key={row[0]}><CompanyCell name={row[0]} idx={index} /><span>{row[1]}</span></div>)}</div>;
}

function DealsDonut() {
  return <div className="pp-deals-donut"><div className="pp-donut-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={sourceData} dataKey="value" innerRadius={58} outerRadius={88} stroke="none" startAngle={90} endAngle={-270}>{sourceData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><strong>128</strong><small>Total Deals</small></div><ul><li><i className="dot purple" />Website<span>40 (31.3%)</span></li><li><i className="dot blue" />Referral<span>32 (25.0%)</span></li><li><i className="dot green" />LinkedIn<span>24 (18.8%)</span></li><li><i className="dot orange" />Email<span>16 (12.5%)</span></li><li><i className="dot grey" />Other<span>16 (12.5%)</span></li></ul></div>;
}
function CompanyInsights() {
  return <div className="pp-insights"><div className="pp-insight-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={insightData} dataKey="value" innerRadius={45} outerRadius={74} stroke="none" startAngle={90} endAngle={-270}>{insightData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><strong>12</strong><small>Companies</small></div><ul><li><i className="dot blue" />Active<span>8 (66.7%)</span></li><li><i className="dot grey" />Inactive<span>2 (16.7%)</span></li><li><i className="dot orange" />Prospect<span>2 (16.7%)</span></li></ul></div>;
}

function Industries() {
  const rows = [['Technology', '5 (42%)', 85], ['Software', '3 (25%)', 60], ['Logistics', '2 (17%)', 42], ['Automation', '1 (8%)', 28], ['Cloud Services', '1 (8%)', 28]] as const;
  return <div className="pp-industries">{rows.map((row) => <div key={row[0]}><span>{row[0]}</span><b>{row[1]}</b><em><i style={{ width: `${row[2]}%` }} /></em></div>)}</div>;
}

function Activity({ small = false }: { small?: boolean }) {
  const rows = [['NovaGrid Systems', 'New deal created', '2h ago'], ['Blue Harbor Logistics', 'Company updated', '5h ago'], ['Apex Software', 'New contact added', '1d ago'], ['DataPulse Labs', 'Deal won', '2d ago'], ['Northstar Automation', 'Task completed', '2d ago']];
  return <div className={`pp-activity ${small ? 'small' : ''}`}>{rows.map((row, index) => <div key={row[0]}><span className={`pp-activity-ico ${companyColors[index % 5]}`}><Building2 size={15} /></span><div><b>{row[0]}</b><small>{row[1]}</small></div><time>{row[2]}</time></div>)}</div>;
}
