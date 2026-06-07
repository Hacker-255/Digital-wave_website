import type { LucideIcon } from 'lucide-react';
import {
  Users, LayoutDashboard, Workflow, GitMerge, BarChart3, Bot,
  Building2, Target, CheckCircle2, ClipboardList, LayoutGrid, CircuitBoard,
  Settings, MessageCircleQuestion, Terminal, Sparkles, Zap,
  Diamond, Calendar, FolderKanban,
} from 'lucide-react';

export type ModuleItem = {
  id: string;
  label: string;
  detail: string;
};

export type CrmPerson = {
  id: string;
  companyId?: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  company: string;
  address: string;
  notes: string;
  status: string;
  tags: string;
};

export type CrmTask = {
  id: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee: string;
  tags: string;
};

export type CrmNote = {
  id: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
  title: string;
  content: string;
  category: string;
};

export type CrmOpportunity = {
  id: string;
  companyId?: string;
  contactId?: string;
  name: string;
  company: string;
  value: string;
  stage: string;
  probability: string;
  closeDate: string;
  owner: string;
};

export type CrmDeal = {
  id: string;
  companyId?: string;
  contactId?: string;
  leadId?: string;
  name: string;
  company: string;
  value: string;
  stage: string;
  closeDate: string;
  owner: string;
};

export type CrmLead = {
  id: string;
  companyId?: string;
  contactId?: string;
  name: string;
  email: string;
  company: string;
  source: string;
  status: string;
  score: string;
  owner: string;
};

export type CrmMeeting = {
  id: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
  title: string;
  date: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  meetingTime?: string;
  rescheduleId?: string;
  rescheduleUrl?: string;
  duration: string;
  attendees: string;
  location: string;
  notes: string;
};

export type CrmProject = {
  id: string;
  companyId?: string;
  dealId?: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  priority: string;
  budget: string;
};

export type CrmFile = {
  id: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
  name: string;
  type: string;
  size: string;
  owner: string;
  uploadedAt: string;
  tags: string;
};

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

export const FEATURES = [
  { icon: 'Users', title: 'Client Management', description: 'Manage clients with profiles, history, preferences, and communication logs in one place.' },
  { icon: 'LayoutDashboard', title: 'Project Management', description: 'Track projects from planning to delivery with real-time status and team collaboration.' },
  { icon: 'Workflow', title: 'Workflow Automation', description: 'Automate repetitive tasks, triggers, and notifications to streamline operations.' },
  { icon: 'GitMerge', title: 'Sales Pipeline', description: 'Track leads from inquiry to close with visual pipeline stages and forecasting.' },
  { icon: 'BarChart3', title: 'Advanced Analytics', description: 'Revenue insights, team performance, and business metrics at a glance.' },
  { icon: 'Bot', title: 'AI-Powered Insights', description: 'Smart recommendations, client summaries, and predictive analytics.' },
];

export const PRICING_PLANS = [
  { name: 'Starter', price: '$29', period: '/month', description: 'For small teams just getting started.', features: ['Up to 5 team members', '500 clients', 'Basic analytics', 'Email support', '1 project workspace'], cta: 'Get Started', popular: false },
  { name: 'Professional', price: '$79', period: '/month', description: 'For growing businesses ready to scale.', features: ['Up to 20 team members', 'Unlimited clients', 'Advanced analytics', 'Priority support', 'API access', 'AI insights', 'Unlimited projects'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: '$199', period: '/month', description: 'For large organizations with custom needs.', features: ['Unlimited team members', 'Unlimited clients', 'Full analytics suite', '24/7 dedicated support', 'Custom integrations', 'Dedicated account manager', 'SSO & SAML'], cta: 'Contact Sales', popular: false },
];

export const TESTIMONIALS = [
  { name: 'Lina Carter', role: 'CEO, TechFlow Solutions', avatar: 'SJ', content: 'This CRM transformed how we manage our clients. Our team productivity has doubled since switching.', rating: 5 },
  { name: 'Omar Hale', role: 'CTO, CloudBase Inc', avatar: 'MC', content: 'The pipeline management and automation features are incredible. Our conversion rate is up 40%.', rating: 5 },
  { name: 'Maya Stone', role: 'Operations Director, DevStack', avatar: 'ER', content: 'Beautiful UI and incredibly intuitive. My team adapted in days, not weeks.', rating: 5 },
  { name: 'David Park', role: 'CEO, Arcanum Systems', avatar: 'DP', content: 'We evaluated 6 CRMs before choosing Digital Wave. The AI-powered insights alone make it worth it.', rating: 5 },
  { name: 'Lisa Thompson', role: 'Founder, DataPulse LLC', avatar: 'LT', content: 'The workflow automation saved us 20 hours per week. Our team can finally focus on what matters.', rating: 4 },
  { name: 'James Wilson', role: 'CTO, SkyBridge Tech', avatar: 'JW', content: 'Enterprise-grade security with consumer-grade UX. That is incredibly rare and exactly what we needed.', rating: 5 },
];

export const FAQ_ITEMS = [
  { question: 'What is Digital Wave CRM?', answer: 'A modern platform for managing clients, projects, teams, and business operations with powerful automation and analytics.' },
  { question: 'Can I migrate data from another system?', answer: 'Yes, we offer seamless migration support from most major CRM and project management platforms.' },
  { question: 'How secure is my data?', answer: 'All data is encrypted at rest and in transit with enterprise-grade security protocols.' },
  { question: 'Is there a free trial?', answer: 'Yes, 14-day free trial on our Professional plan with no credit card required.' },
];

export const companies = ['TechFlow Inc', 'CloudBase Corp', 'DevStack Ltd', 'NexGen Digital', 'Arcanum Systems', 'DataPulse', 'SkyBridge Tech', 'Apex Software'];

export const iconMap: Record<string, LucideIcon> = {
  Users, LayoutDashboard, GitMerge, BarChart3, Bot, Workflow,
};

export const barHeights = [35, 55, 40, 70, 50, 85, 60, 45, 75, 55, 90, 65];

export const sidebarItems: Array<[LucideIcon, string, string]> = [
  [Building2, 'Companies', 'bg-violet-500/30 text-violet-100'],
  [Users, 'People', 'bg-indigo-500/30 text-indigo-100'],
  [Target, 'Opportunities', 'bg-red-500/30 text-red-100'],
  [Diamond, 'Deals', 'bg-pink-500/30 text-pink-100'],
  [Zap, 'Leads', 'bg-amber-500/30 text-amber-100'],
  [Calendar, 'Meetings', 'bg-cyan-500/30 text-cyan-100'],
  [ClipboardList, 'Files', 'bg-sky-500/30 text-sky-100'],
  [FolderKanban, 'Projects', 'bg-blue-500/30 text-blue-100'],
  [CheckCircle2, 'Tasks', 'bg-emerald-500/30 text-emerald-100'],
  [ClipboardList, 'Notes', 'bg-teal-500/30 text-teal-100'],
  [LayoutGrid, 'Dashboards', 'bg-slate-500/30 text-slate-100'],
  [CircuitBoard, 'Workflows', 'bg-orange-500/30 text-orange-100'],
];

export const aiSidebarItems: Array<[LucideIcon, string, string]> = [
  [Zap, 'AI Execute', 'bg-amber-500/20 text-amber-200'],
  [Sparkles, 'AI Ask', 'bg-blue-500/20 text-blue-200'],
];

export const otherSidebarItems: Array<[LucideIcon, string]> = [
  [Settings, 'Settings'],
  [MessageCircleQuestion, 'Documentation'],
];

export type CompanyTableRow = {
  id: string;
  name: string;
  domain: string;
  createdBy: string;
  owner: string;
  createdAt: string;
  employees: number | '';
  linkedin: string;
  color: string;
  icon: string;
};

export const initialCompanies: CompanyTableRow[] = [
  { id: 'novagrid', name: 'NovaGrid Systems', domain: 'novagrid.example', createdBy: 'System', owner: '', createdAt: '2 days ago', employees: 5000, linkedin: '', color: 'bg-red-500', icon: 'A' },
  { id: 'northstar', name: 'Northstar Automation', domain: 'northstar.example', createdBy: 'System', owner: '', createdAt: '2 days ago', employees: 1100, linkedin: '', color: 'bg-stone-200 text-stone-950', icon: 'AI' },
  { id: 'blueharbor', name: 'Blue Harbor Logistics', domain: 'blueharbor.example', createdBy: 'System', owner: '', createdAt: '2 days ago', employees: 8000, linkedin: '', color: 'bg-violet-500', icon: 'S' },
  { id: 'skybridge', name: 'SkyBridge Tech', domain: 'skybridge.example', createdBy: 'System', owner: '', createdAt: '2 days ago', employees: 800, linkedin: '', color: 'bg-slate-900', icon: 'F' },
  { id: 'datapulse', name: 'DataPulse Labs', domain: 'datapulse.example', createdBy: 'System', owner: '', createdAt: '2 days ago', employees: 400, linkedin: '', color: 'bg-white text-black', icon: 'N' },
  { id: 'apex', name: 'Apex Software', domain: 'apex.example', createdBy: 'Digital Wave Ops', owner: '', createdAt: '2 days ago', employees: '', linkedin: '', color: 'bg-green-700', icon: 'H' },
  { id: 'cloudbase', name: 'CloudBase Corp', domain: 'cloudbase.example', createdBy: 'Digital Wave Ops', owner: '', createdAt: '2 days ago', employees: '', linkedin: '', color: 'bg-black', icon: 'P' },
  { id: 'arcanum', name: 'Arcanum Systems', domain: 'arcanum.example', createdBy: 'Digital Wave Ops', owner: '', createdAt: '2 days ago', employees: '', linkedin: '', color: 'bg-zinc-700', icon: 'E' },
  { id: 'devstack', name: 'DevStack Ltd', domain: 'devstack.example', createdBy: 'Digital Wave Ops', owner: '', createdAt: '2 days ago', employees: '', linkedin: '', color: 'bg-transparent text-red-500', icon: 'A' },
  { id: 'techflow', name: 'TechFlow Solutions', domain: 'techflow.example', createdBy: 'Digital Wave Ops', owner: '', createdAt: '2 days ago', employees: '', linkedin: '', color: 'bg-black', icon: 'O' },
  { id: 'nexgen', name: 'NexGen Digital', domain: 'nexgen.example', createdBy: 'Digital Wave Ops', owner: '', createdAt: '2 days ago', employees: '', linkedin: '', color: 'bg-orange-600', icon: 'L' },
];

export const initialPeople: CrmPerson[] = [
  { id: 'p1', companyId: 'novagrid', name: 'Lina Carter', email: 'sarah@novagrid.example', phone: '+1-555-0101', title: 'CEO', company: 'NovaGrid Systems', address: '123 Market St, San Francisco, CA', notes: 'Key decision maker for enterprise deal', status: 'Active', tags: 'vip,enterprise' },
  { id: 'p2', companyId: 'northstar', name: 'Omar Hale', email: 'marcus@northstar.example', phone: '+1-555-0102', title: 'CTO', company: 'Northstar Automation', address: '456 Tech Blvd, Austin, TX', notes: 'Technical evaluator for platform integration', status: 'Active', tags: 'technical,decision-maker' },
  { id: 'p3', companyId: 'devstack', name: 'Maya Stone', email: 'emily@devstack.io', phone: '+1-555-0103', title: 'Operations Director', company: 'DevStack', address: '789 Innovation Dr, New York, NY', notes: 'Interested in workflow automation', status: 'Lead', tags: 'operations' },
];

export const initialTasks: CrmTask[] = [
  { id: 't1', companyId: 'novagrid', dealId: 'd1', title: 'Send proposal follow-up', description: 'Follow up on the enterprise proposal sent last week', status: 'In Progress', priority: 'High', dueDate: '2026-06-05', assignee: 'me', tags: 'proposal,enterprise' },
  { id: 't2', companyId: 'northstar', dealId: 'd2', title: 'Prepare security answers', description: 'Complete security questionnaire for Northstar Automation', status: 'Todo', priority: 'Urgent', dueDate: '2026-06-03', assignee: 'me', tags: 'security,compliance' },
  { id: 't3', companyId: 'novagrid', title: 'Schedule onboarding call', description: 'Set up onboarding for new NovaGrid Systems team members', status: 'Todo', priority: 'Medium', dueDate: '2026-06-10', assignee: 'me', tags: 'onboarding' },
];

export const initialNotes: CrmNote[] = [
  { id: 'n1', companyId: 'novagrid', dealId: 'd1', title: 'NovaGrid discovery notes', content: 'Discussed their cloud infrastructure needs. They are looking to migrate 200+ servers and need a CRM that can handle complex workflow automation. Key stakeholders include Sarah (CEO) and their VP of Engineering.', category: 'Meeting' },
  { id: 'n2', companyId: 'northstar', dealId: 'd2', title: 'Northstar security review', content: 'Reviewed their security requirements. They need SOC2 compliance documentation and penetration testing results before proceeding.', category: 'Feedback' },
  { id: 'n3', companyId: 'blueharbor', title: 'Blue Harbor negotiation', content: 'Preliminary budget discussion. They are looking at $40-60k annual contract with potential expansion.', category: 'Idea' },
];

export const initialOpportunities: CrmOpportunity[] = [
  { id: 'o1', name: 'NovaGrid Systems expansion', company: 'NovaGrid Systems', value: '84000', stage: 'Proposal', probability: '60', closeDate: '2026-07-15', owner: 'me' },
  { id: 'o2', name: 'Northstar Automation platform', company: 'Northstar Automation', value: '62000', stage: 'Discovery', probability: '30', closeDate: '2026-08-01', owner: 'me' },
  { id: 'o3', name: 'Blue Harbor Logistics rollout', company: 'Blue Harbor Logistics', value: '41000', stage: 'Negotiation', probability: '80', closeDate: '2026-06-30', owner: 'me' },
];

export const initialDeals: CrmDeal[] = [
  { id: 'd1', companyId: 'novagrid', contactId: 'p1', name: 'NovaGrid Systems - Enterprise Plan', company: 'NovaGrid Systems', value: '84000', stage: 'Proposal', closeDate: '2026-07-15', owner: 'me' },
  { id: 'd2', companyId: 'northstar', contactId: 'p2', name: 'Northstar Automation - Pro Plan', company: 'Northstar Automation', value: '62000', stage: 'Demo', closeDate: '2026-08-01', owner: 'me' },
];

export const initialLeads: CrmLead[] = [
  { id: 'l1', companyId: 'skybridge', name: 'James Wilson', email: 'james@skybridge.tech', company: 'SkyBridge Tech', source: 'Website', status: 'New', score: '85', owner: 'me' },
  { id: 'l2', companyId: 'datapulse', name: 'Lisa Thompson', email: 'lisa@datapulse.io', company: 'DataPulse LLC', source: 'Referral', status: 'Contacted', score: '70', owner: 'me' },
  { id: 'l3', companyId: 'arcanum', name: 'David Park', email: 'david@arcanum.systems', company: 'Arcanum Systems', source: 'Conference', status: 'Qualified', score: '92', owner: 'me' },
];

export const initialMeetings: CrmMeeting[] = [
  { id: 'm1', companyId: 'novagrid', contactId: 'p1', dealId: 'd1', title: 'NovaGrid Systems discovery call', date: '2026-06-02', duration: '60', attendees: 'Lina Carter, John Smith', location: 'Zoom', notes: 'Discussed requirements and timeline' },
  { id: 'm2', companyId: 'northstar', contactId: 'p2', dealId: 'd2', title: 'Northstar Automation technical review', date: '2026-06-05', duration: '90', attendees: 'Omar Hale, Tech Team', location: 'Google Meet', notes: 'Deep dive on API integration' },
];

export const initialProjects: CrmProject[] = [
  { id: 'pr1', name: 'NovaGrid Systems Migration', description: 'Migrate NovaGrid Systems from legacy CRM to our platform', status: 'Planning', startDate: '2026-06-15', endDate: '2026-09-15', priority: 'High', budget: '84000' },
  { id: 'pr2', name: 'Northstar Automation Integration', description: 'Build and deploy API integration for Northstar Automation platform', status: 'In Progress', startDate: '2026-05-01', endDate: '2026-07-30', priority: 'Critical', budget: '62000' },
];

export const initialFiles: CrmFile[] = [
  { id: 'f1', companyId: 'novagrid', dealId: 'd1', name: 'NovaGrid proposal.pdf', type: 'Proposal', size: '2.4 MB', owner: 'me', uploadedAt: '2026-05-30', tags: 'proposal,enterprise' },
  { id: 'f2', companyId: 'northstar', dealId: 'd2', name: 'Security questionnaire.xlsx', type: 'Security', size: '860 KB', owner: 'me', uploadedAt: '2026-05-28', tags: 'security,compliance' },
];
