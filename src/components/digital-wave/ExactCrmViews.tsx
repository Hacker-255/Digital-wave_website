import {
  ArrowDownUp,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Crown,
  DollarSign,
  Download,
  Heart,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  SlidersHorizontal,
  Star,
  Target,
  TrendingUp,
  Upload,
  UserRound,
  Users,
} from 'lucide-react';
import type { CompanyTableRow, CrmDeal, CrmLead, CrmMeeting, CrmPerson, CrmTask } from '../../constants/data';
import { TableActions } from './TableActions';

type ActionHandler<T> = (item: T) => void;

const peopleFallback: CrmPerson[] = [
  { id: 'john-deo', name: 'John Deo', email: 'john@novagrid.com', phone: '+1 (555) 123-4567', title: 'CTO', company: 'NovaGrid Systems', address: '', notes: '', status: 'Customer', tags: 'Technology,Important' },
  { id: 'sarah-lee', name: 'Sarah Lee', email: 'sarah@northstar.com', phone: '+1 (555) 987-6543', title: 'Head of Ops', company: 'Northstar Automation', address: '', notes: '', status: 'Customer', tags: 'Automation,VIP' },
  { id: 'mike-ross', name: 'Mike Ross', email: 'mike@blueharbor.com', phone: '+1 (555) 456-7890', title: 'Operations Manager', company: 'Blue Harbor Logistics', address: '', notes: '', status: 'Customer', tags: 'Logistics,Important' },
  { id: 'emily-carter', name: 'Emily Carter', email: 'emily@skybridge.com', phone: '+1 (555) 234-5678', title: 'Sales Director', company: 'SkyBridge Tech', address: '', notes: '', status: 'Lead', tags: 'Technology,New' },
  { id: 'david-wilson', name: 'David Wilson', email: 'david@datapulse.com', phone: '+1 (555) 345-6789', title: 'Product Manager', company: 'DataPulse Labs', address: '', notes: '', status: 'Customer', tags: 'Software,VIP' },
  { id: 'james-miller', name: 'James Miller', email: 'james@apex.com', phone: '+1 (555) 876-5432', title: 'CEO', company: 'Apex Software', address: '', notes: '', status: 'Lead', tags: 'Software,New' },
  { id: 'olivia-taylor', name: 'Olivia Taylor', email: 'olivia@cloudbase.com', phone: '+1 (555) 654-3210', title: 'Cloud Architect', company: 'CloudBase Corp', address: '', notes: '', status: 'Customer', tags: 'Cloud,Important' },
  { id: 'daniel-kim', name: 'Daniel Kim', email: 'daniel@arcanum.com', phone: '+1 (555) 321-0987', title: 'IT Manager', company: 'Arcanum Systems', address: '', notes: '', status: 'Lead', tags: 'Technology,New' },
];

const leadFallback: CrmLead[] = [
  { id: 'lead-john', name: 'John Deo', email: 'john@novagrid.com', company: 'NovaGrid Systems', source: 'Website', status: 'Qualified', score: '85', owner: 'Mahmoud Mostafa' },
  { id: 'lead-sarah', name: 'Sarah Lee', email: 'sarah@northstar.com', company: 'Northstar Automation', source: 'Referral', status: 'Contacted', score: '72', owner: 'Asmaa Hassan' },
  { id: 'lead-mike', name: 'Mike Ross', email: 'mike@blueharbor.com', company: 'Blue Harbor Logistics', source: 'LinkedIn', status: 'Qualified', score: '68', owner: 'Mahmoud Mostafa' },
  { id: 'lead-emily', name: 'Emily Carter', email: 'emily@skybridge.com', company: 'SkyBridge Tech', source: 'Website', status: 'New', score: '45', owner: 'Asmaa Hassan' },
  { id: 'lead-david', name: 'David Wilson', email: 'david@datapulse.com', company: 'DataPulse Labs', source: 'Cold Email', status: 'Proposal', score: '60', owner: 'Omar Khaled' },
  { id: 'lead-james', name: 'James Miller', email: 'james@apex.com', company: 'Apex Software', source: 'Referral', status: 'Negotiation', score: '90', owner: 'Mahmoud Mostafa' },
  { id: 'lead-olivia', name: 'Olivia Taylor', email: 'olivia@cloudbase.com', company: 'CloudBase Corp', source: 'LinkedIn', status: 'Contacted', score: '55', owner: 'Asmaa Hassan' },
  { id: 'lead-daniel', name: 'Daniel Kim', email: 'daniel@arcanum.com', company: 'Arcanum Systems', source: 'Website', status: 'New', score: '40', owner: 'Omar Khaled' },
];

const avatarNames = ['John Deo', 'Sarah Lee', 'Mike Ross', 'Emily Carter', 'David Wilson', 'James Miller', 'Olivia Taylor', 'Daniel Kim'];

function money(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

function numberFromMoney(value: string | number | undefined) {
  return Number(String(value || '').replace(/[^0-9.-]/g, '')) || 0;
}

function Avatar({ name }: { name: string }) {
  const index = avatarNames.indexOf(name);
  return (
    <span className={`exact-avatar exact-avatar-${Math.max(index, 0) % 8}`}>
      {name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
    </span>
  );
}

function CompanyBadge({ name }: { name: string }) {
  const colors = ['purple', 'dark', 'blue', 'sky', 'orange', 'black', 'green'];
  const color = colors[Math.abs(name.length) % colors.length];
  return <span className={`exact-company-badge ${color}`}>{name.slice(0, 2).toUpperCase()}</span>;
}

function StatusBadge({ value }: { value: string }) {
  const key = value.toLowerCase().replace(/\s+/g, '-');
  return <span className={`exact-status ${key}`}>{value}</span>;
}

function TagBadge({ value }: { value: string }) {
  const key = value.toLowerCase().replace(/\s+/g, '-');
  return <span className={`exact-tag ${key}`}>{value}</span>;
}

function MetricCard({ icon: Icon, label, value, trend, tone, spark }: { icon: typeof Users; label: string; value: string; trend: string; tone: string; spark?: string }) {
  return (
    <section className="exact-metric-card">
      <div className={`exact-metric-icon ${tone}`}>
        <Icon size={22} />
      </div>
      <div className="exact-metric-copy">
        <p>{label}</p>
        <strong>{value}</strong>
        <small className={trend.startsWith('-') ? 'down' : ''}>{trend}</small>
      </div>
      {spark && <div className={`exact-sparkline ${spark}`} />}
    </section>
  );
}

function Pagination({ total = '156' }: { total?: string }) {
  return (
    <div className="exact-pagination">
      <button type="button"><ChevronLeft size={16} /></button>
      <button type="button" className="active">1</button>
      <button type="button">2</button>
      <button type="button">3</button>
      <span>...</span>
      <button type="button">{total}</button>
      <button type="button"><ChevronRight size={16} /></button>
      <button type="button" className="per-page">8 per page <ChevronDown size={14} /></button>
    </div>
  );
}

function TableToolButton({ icon: Icon, label, onClick }: { icon: typeof Search; label: string; onClick?: () => void }) {
  return <button className="exact-tool-button" onClick={onClick} type="button"><Icon size={16} /> {label}</button>;
}

export function ExactDashboardView({
  companies,
  deals,
  leads,
  tasks,
  meetings,
  onNavigate,
}: {
  companies: CompanyTableRow[];
  deals: CrmDeal[];
  leads: CrmLead[];
  tasks: CrmTask[];
  meetings: CrmMeeting[];
  onNavigate: (module: string) => void;
}) {
  const totalRevenue = deals.reduce((sum, deal) => sum + numberFromMoney(deal.value), 0) || 2450000;
  const activeDeals = deals.length || 42;
  const newLeads = leads.length || 128;
  const completedTasks = tasks.filter((task) => task.status === 'Done').length || 256;
  const meetingCount = meetings.length || 18;
  const pipelineStages = [
    ['New Lead', '128 Leads', '$420,000', 'purple'],
    ['Qualified', '64 Leads', '$280,000', 'blue'],
    ['Proposal', '34 Leads', '$152,000', 'green'],
    ['Negotiation', '18 Leads', '$98,000', 'orange'],
    ['Closed Won', '12 Leads', '$65,000', 'mint'],
  ];
  const activity = companies.slice(0, 5).map((company, index) => ({
    name: company.name,
    text: index === 0 ? 'New deal created' : index === 1 ? 'Company updated' : index === 2 ? 'New contact added' : index === 3 ? 'Deal won' : 'Task completed',
    time: index === 0 ? '2h ago' : index === 1 ? '5h ago' : `${index}d ago`,
  }));

  return (
    <div className="exact-page">
      <div className="exact-dashboard-metrics">
        <MetricCard icon={DollarSign} label="Total Revenue" value={money(totalRevenue)} trend="+ 25.3% vs last month" tone="purple" spark="purple" />
        <MetricCard icon={Building2} label="Active Deals" value={String(activeDeals)} trend="+ 12.5% vs last month" tone="blue" spark="blue" />
        <MetricCard icon={Target} label="New Leads" value={String(newLeads)} trend="+ 18.7% vs last month" tone="green" spark="green" />
        <MetricCard icon={CheckCircle2} label="Tasks Completed" value={String(completedTasks)} trend="+ 15.3% vs last month" tone="orange" spark="orange" />
        <MetricCard icon={Heart} label="Meetings" value={String(meetingCount)} trend="+ 20% vs last month" tone="pink" spark="pink" />
      </div>

      <div className="exact-dashboard-grid">
        <section className="exact-card exact-pipeline">
          <div className="exact-card-head">
            <h2>Sales Pipeline</h2>
            <button type="button">This Month <ChevronDown size={14} /></button>
          </div>
          <div className="exact-stage-list">
            {pipelineStages.map(([stage, count, value, tone]) => (
              <button key={stage} onClick={() => onNavigate('Leads')} className={`exact-stage ${tone}`} type="button">
                <span><b>{stage}</b><small>{count}</small></span>
                <strong>{value}</strong>
              </button>
            ))}
          </div>
          <div className="exact-conversion"><span>Conversion Rate</span><b>18.7%</b><em>+ 2.5% vs last month</em></div>
        </section>

        <section className="exact-card exact-revenue">
          <div className="exact-card-head">
            <h2>Revenue Overview</h2>
            <button type="button">This Year <ChevronDown size={14} /></button>
          </div>
          <p className="exact-big-money">{money(totalRevenue)}</p>
          <small className="exact-green">+ 25.3% vs last year</small>
          <div className="exact-chart">
            <svg viewBox="0 0 480 260" preserveAspectRatio="none">
              <defs>
                <linearGradient id="exactRevenueFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#635bff" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#635bff" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[40, 85, 130, 175, 220].map((y) => <line key={y} x1="28" x2="468" y1={y} y2={y} />)}
              <path d="M30 220 L72 190 L105 184 L145 145 L185 124 L225 128 L268 78 L302 55 L342 22 L342 228 L30 228 Z" fill="url(#exactRevenueFill)" />
              <path d="M30 220 L72 190 L105 184 L145 145 L185 124 L225 128 L268 78 L302 55 L342 22" className="line-main" />
              <path d="M30 215 L72 202 L105 198 L145 176 L185 162 L225 166 L268 138 L302 132 L342 102 L382 90 L422 105 L468 60" className="line-last" />
            </svg>
            <div className="exact-months">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => <span key={m}>{m}</span>)}</div>
          </div>
        </section>

        <section className="exact-card exact-side-list">
          <div className="exact-card-head"><h2>Upcoming Tasks</h2><button onClick={() => onNavigate('Tasks')} type="button">View All</button></div>
          {(tasks.length ? tasks : [
            { id: 't-a', title: 'Follow up with NovaGrid Systems', assignee: 'Mahmoud Mostafa', dueDate: 'May 23, 10:00 AM', priority: 'High' },
            { id: 't-b', title: 'Prepare proposal for Blue Harbor', assignee: 'Sarah Lee', dueDate: 'May 23, 1:30 PM', priority: 'Medium' },
            { id: 't-c', title: 'Call DataPulse Labs', assignee: 'John Deo', dueDate: 'May 24, 11:00 AM', priority: 'High' },
            { id: 't-d', title: 'Demo for SkyBridge Tech', assignee: 'Mike Ross', dueDate: 'May 24, 3:00 PM', priority: 'Medium' },
            { id: 't-e', title: 'Send contract to Apex Software', assignee: 'Sarah Lee', dueDate: 'May 25, 9:00 AM', priority: 'Low' },
          ] as CrmTask[]).slice(0, 5).map((task) => (
            <button key={task.id} onClick={() => onNavigate('Tasks')} className="exact-task-row" type="button">
              <CheckCircle2 size={16} />
              <span><b>{task.title}</b><small>{task.assignee} • {task.dueDate}</small></span>
              <em className={task.priority.toLowerCase()}>{task.priority}</em>
            </button>
          ))}
        </section>

        <section className="exact-card exact-top-companies">
          <div className="exact-card-head"><h2>Top Companies</h2><button onClick={() => onNavigate('Companies')} type="button">View All</button></div>
          {companies.slice(0, 5).map((company, index) => (
            <button key={company.id} onClick={() => onNavigate('Companies')} className="exact-company-row" type="button">
              <CompanyBadge name={company.name} />
              <span>{company.name}</span>
              <b>{money([320000, 280000, 210000, 180000, 160000][index] || 120000)}</b>
            </button>
          ))}
        </section>

        <section className="exact-card exact-donut-card">
          <div className="exact-card-head"><h2>Deals by Source</h2></div>
          <div className="exact-donut-wrap">
            <div className="exact-donut"><b>{leads.length || 128}</b><span>Total Deals</span></div>
            <div className="exact-legend">
              {['Website 40 (31.3%)', 'Referral 32 (25.0%)', 'LinkedIn 24 (18.8%)', 'Email 16 (12.5%)', 'Other 16 (12.5%)'].map((item, index) => (
                <p key={item}><i className={`dot-${index}`} /> {item}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="exact-card exact-side-list">
          <div className="exact-card-head"><h2>Recent Activity</h2><button type="button">View All</button></div>
          {activity.map((item) => (
            <div key={item.name} className="exact-activity-row">
              <CompanyBadge name={item.name} />
              <span><b>{item.name}</b><small>{item.text}</small></span>
              <time>{item.time}</time>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export function ExactCompaniesView({
  companies,
  selectedIds,
  allSelected,
  onToggleSelected,
  onToggleAll,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onFilter,
}: {
  companies: CompanyTableRow[];
  selectedIds: string[];
  allSelected: boolean;
  onToggleSelected: (id: string) => void;
  onToggleAll: () => void;
  onView: ActionHandler<CompanyTableRow>;
  onEdit?: ActionHandler<CompanyTableRow>;
  onDelete?: ActionHandler<CompanyTableRow>;
  onDuplicate?: ActionHandler<CompanyTableRow>;
  onFilter?: () => void;
}) {
  const rows = companies.slice(0, 8);
  const totalEmployees = companies.reduce((sum, company) => sum + Number(company.employees || 0), 0);
  const actions = [
    ...(onEdit ? [{ key: 'edit', label: 'Edit', icon: Target }] : []),
    ...(onDuplicate ? [{ key: 'duplicate', label: 'Duplicate', icon: Columns3 }] : []),
    ...(onDelete ? [{ key: 'delete', label: 'Delete', icon: MoreHorizontal, danger: true }] : []),
  ];
  return (
    <div className="exact-page">
      <div className="exact-companies-kpis">
        <MetricCard icon={Building2} label="Total Companies" value={String(companies.length)} trend="+ 20% vs last month" tone="purple" />
        <MetricCard icon={Users} label="Total Employees" value={totalEmployees.toLocaleString()} trend="+ 18% vs last month" tone="blue" />
        <MetricCard icon={DollarSign} label="Active Deals" value="42" trend="+ 12% vs last month" tone="green" />
        <MetricCard icon={TrendingUp} label="Total Revenue" value="$2.45M" trend="+ 25% vs last month" tone="orange" />
      </div>
      <div className="exact-company-layout">
        <section className="exact-card exact-data-card">
          <div className="exact-card-head">
            <h2>All Companies ({companies.length}) <ChevronDown size={14} /></h2>
            <TableToolButton icon={SlidersHorizontal} label="Filter" onClick={onFilter} />
          </div>
          <div className="exact-company-table">
            <div className="exact-company-table-head">
              <span>Company</span><span>Domain</span><span>Employees</span><span>Owner</span><span>Created</span><span>Status</span><span />
            </div>
            {rows.map((company, index) => (
              <div className="exact-company-table-row" key={company.id}>
                <button onClick={() => onView(company)} type="button"><CompanyBadge name={company.name} /><span><b>{company.name}</b><small>{['Technology', 'Automation', 'Logistics', 'Technology', 'Software', 'Software', 'Cloud Services', 'Technology'][index] || 'Technology'}</small></span></button>
                <span>{company.domain}</span>
                <span>{Number(company.employees || [5000, 1100, 8000, 800, 400, 2500, 3200, 1700][index] || 0).toLocaleString()}</span>
                <span><Avatar name={['John Deo', 'Sarah Lee', 'Mike Ross'][index % 3]} /> {['John Deo', 'Sarah Lee', 'Mike Ross'][index % 3]}</span>
                <span>{company.createdAt || '2 days ago'}</span>
                <span><StatusBadge value={index === 5 ? 'Inactive' : 'Active'} /></span>
                <span><TableActions actions={actions} onAction={(action) => action === 'edit' ? onEdit?.(company) : action === 'delete' ? onDelete?.(company) : onDuplicate?.(company)} /></span>
              </div>
            ))}
          </div>
          <div className="exact-table-footer"><span>Showing 1 to {rows.length} of {companies.length} results</span><Pagination total="2" /></div>
        </section>
        <aside className="exact-insights">
          <section className="exact-card">
            <div className="exact-card-head"><h2>Company Insights</h2><button type="button">This Month <ChevronDown size={14} /></button></div>
            <div className="exact-donut-wrap compact"><div className="exact-donut"><b>{companies.length}</b><span>Companies</span></div><div className="exact-legend"><p><i className="dot-0" /> Active 8 (66.7%)</p><p><i className="dot-4" /> Inactive 2 (16.7%)</p><p><i className="dot-3" /> Prospect 2 (16.7%)</p></div></div>
          </section>
          <section className="exact-card">
            <h2 className="exact-panel-title">Top Industries</h2>
            {['Technology 5 (42%)', 'Software 3 (25%)', 'Logistics 2 (17%)', 'Automation 1 (8%)', 'Cloud Services 1 (8%)'].map((item, index) => <div className="exact-progress-row" key={item}><span>{item}</span><i style={{ width: `${[92, 70, 52, 28, 28][index]}%` }} /></div>)}
          </section>
          <section className="exact-card">
            <h2 className="exact-panel-title">Recent Activity</h2>
            {rows.slice(0, 3).map((company, index) => <div className="exact-activity-row" key={company.id}><CompanyBadge name={company.name} /><span><b>{company.name}</b><small>{index === 0 ? 'New deal created' : index === 1 ? 'Company updated' : 'New contact added'}</small></span><time>{index === 0 ? '2h ago' : index === 1 ? '5h ago' : '1d ago'}</time></div>)}
          </section>
        </aside>
      </div>
    </div>
  );
}

export function ExactPeopleView({
  people,
  onOpen,
  onEdit,
  onDelete,
  onDuplicate,
  onFilter,
}: {
  people: CrmPerson[];
  onOpen: ActionHandler<CrmPerson>;
  onEdit?: ActionHandler<CrmPerson>;
  onDelete?: ActionHandler<CrmPerson>;
  onDuplicate?: ActionHandler<CrmPerson>;
  onFilter?: () => void;
}) {
  const rows = (people.length >= 8 ? people : peopleFallback).slice(0, 8);
  const actions = [
    ...(onEdit ? [{ key: 'edit', label: 'Edit', icon: Target }] : []),
    ...(onDuplicate ? [{ key: 'duplicate', label: 'Duplicate', icon: Columns3 }] : []),
    ...(onDelete ? [{ key: 'delete', label: 'Delete', icon: MoreHorizontal, danger: true }] : []),
  ];
  return (
    <div className="exact-page">
      <div className="exact-people-kpis">
        <MetricCard icon={Users} label="Total People" value="1,248" trend="+ 18.2% vs last month" tone="purple" />
        <MetricCard icon={Building2} label="Customers" value="842" trend="+ 14.5% vs last month" tone="blue" />
        <MetricCard icon={Crown} label="Leads" value="256" trend="+ 22.1% vs last month" tone="green" />
        <MetricCard icon={UserRound} label="Vendors" value="62" trend="- 4.3% vs last month" tone="orange" />
        <MetricCard icon={Heart} label="Inactive" value="88" trend="- 8.1% vs last month" tone="pink" />
      </div>
      <section className="exact-card exact-data-card">
        <div className="exact-tabs"><button className="active">All People (1,248)</button><button>Customers (842)</button><button>Leads (256)</button><button>Vendors (62)</button><button>Inactive (88)</button><span /><TableToolButton icon={SlidersHorizontal} label="Filter" onClick={onFilter} /><TableToolButton icon={ArrowDownUp} label="Sort" /><TableToolButton icon={Columns3} label="Columns" /></div>
        <div className="exact-people-table">
          <div className="exact-people-head"><span /><span>Person</span><span>Company</span><span>Job Title</span><span>Email</span><span>Phone</span><span>Status</span><span>Tags</span><span>Last Contact</span><span>Actions</span></div>
          {rows.map((person, index) => (
            <div className="exact-people-row" key={person.id}>
              <button className="exact-check" type="button" />
              <button onClick={() => onOpen(person)} type="button" className="exact-person-cell"><Avatar name={person.name} /><span><b>{person.name}</b><small>{person.email}</small></span></button>
              <span><CompanyBadge name={person.company} /> {person.company}</span>
              <span>{person.title}</span>
              <span>{person.email}</span>
              <span>{person.phone}</span>
              <span><StatusBadge value={person.status || (index % 3 === 0 ? 'Lead' : 'Customer')} /></span>
              <span className="exact-tags">{(person.tags || 'Technology,Important').split(',').slice(0, 2).map((tag) => <TagBadge key={tag.trim()} value={tag.trim()} />)}</span>
              <span>{index % 2 === 0 ? <Phone size={14} /> : <Mail size={14} />} {index === 0 ? '2 hours ago' : index === 1 ? '1 day ago' : `${index + 1} days ago`}</span>
              <span><TableActions actions={actions} onAction={(action) => action === 'edit' ? onEdit?.(person) : action === 'delete' ? onDelete?.(person) : onDuplicate?.(person)} /></span>
            </div>
          ))}
        </div>
        <div className="exact-table-footer"><span>Showing 1 to 8 of 1,248 results</span><Pagination /></div>
      </section>
    </div>
  );
}

export function ExactLeadsView({
  leads,
  onOpen,
  onEdit,
  onDelete,
  onDuplicate,
  onFilter,
  onConvert,
}: {
  leads: CrmLead[];
  onOpen: ActionHandler<CrmLead>;
  onEdit?: ActionHandler<CrmLead>;
  onDelete?: ActionHandler<CrmLead>;
  onDuplicate?: ActionHandler<CrmLead>;
  onFilter?: () => void;
  onConvert?: ActionHandler<CrmLead>;
}) {
  const rows = (leads.length >= 8 ? leads : leadFallback).slice(0, 8);
  const actions = [
    ...(onConvert ? [{ key: 'convert', label: 'Convert', icon: CheckCircle2 }] : []),
    ...(onEdit ? [{ key: 'edit', label: 'Edit', icon: Target }] : []),
    ...(onDuplicate ? [{ key: 'duplicate', label: 'Duplicate', icon: Columns3 }] : []),
    ...(onDelete ? [{ key: 'delete', label: 'Delete', icon: MoreHorizontal, danger: true }] : []),
  ];
  return (
    <div className="exact-page">
      <div className="exact-people-kpis">
        <MetricCard icon={Users} label="Total Leads" value="256" trend="+ 22.1% vs last month" tone="purple" />
        <MetricCard icon={Building2} label="New Leads" value="128" trend="+ 18.7% vs last month" tone="blue" />
        <MetricCard icon={Target} label="Qualified" value="64" trend="+ 15.3% vs last month" tone="orange" />
        <MetricCard icon={CheckCircle2} label="Converted" value="42" trend="+ 12.5% vs last month" tone="green" />
        <MetricCard icon={Heart} label="Conversion Rate" value="16.4%" trend="+ 2.4% vs last month" tone="pink" />
      </div>
      <section className="exact-card exact-data-card">
        <div className="exact-tabs lead-tabs"><button className="active">All Leads<br /><b>256</b></button><button>New<br /><b>128</b></button><button>Contacted<br /><b>64</b></button><button>Qualified<br /><b>42</b></button><button>Proposal<br /><b>16</b></button><button>Negotiation<br /><b>4</b></button><button>Closed Won<br /><b>2</b></button><button>Closed Lost<br /><b>0</b></button></div>
        <div className="exact-table-toolbar"><label><Search size={16} /><input placeholder="Search leads..." /></label><span /><TableToolButton icon={SlidersHorizontal} label="Filter" onClick={onFilter} /><TableToolButton icon={ArrowDownUp} label="Sort" /><TableToolButton icon={Columns3} label="Columns" /></div>
        <div className="exact-leads-table">
          <div className="exact-leads-head"><span /><span>Lead</span><span>Company</span><span>Status</span><span>Lead Score</span><span>Source</span><span>Owner</span><span>Last Contact</span><span>Actions</span></div>
          {rows.map((lead, index) => (
            <div className="exact-leads-row" key={lead.id}>
              <button className="exact-check" type="button" />
              <button onClick={() => onOpen(lead)} type="button" className="exact-person-cell"><Avatar name={lead.name} /><span><b>{lead.name}</b><small>{index === 0 ? 'CTO' : index === 1 ? 'Head of Ops' : index === 2 ? 'Operations Manager' : index === 3 ? 'Sales Director' : index === 4 ? 'Product Manager' : index === 5 ? 'CEO' : index === 6 ? 'Cloud Architect' : 'IT Manager'}<br />{lead.email}</small></span></button>
              <span><CompanyBadge name={lead.company} /> {lead.company}</span>
              <span><StatusBadge value={lead.status} /></span>
              <span><Star size={14} className="exact-star" /> {lead.score}</span>
              <span>{lead.source}</span>
              <span><Avatar name={lead.owner} /> {lead.owner}</span>
              <span>{index % 2 === 0 ? <Phone size={14} /> : index === 5 ? <Calendar size={14} /> : <Mail size={14} />} {index === 0 ? '2 hours ago' : index === 1 ? '1 day ago' : index === 7 ? '1 week ago' : `${index} days ago`}</span>
              <span><TableActions actions={actions} onAction={(action) => action === 'convert' ? onConvert?.(lead) : action === 'edit' ? onEdit?.(lead) : action === 'delete' ? onDelete?.(lead) : onDuplicate?.(lead)} /></span>
            </div>
          ))}
        </div>
        <div className="exact-table-footer"><span>Showing 1 to 8 of 256 leads</span><Pagination total="32" /></div>
      </section>
    </div>
  );
}
