import { Briefcase, Calendar, CheckSquare, File, FileText, Mail, Phone, Tag, User, X } from 'lucide-react';
import type {
  CompanyTableRow,
  CrmDeal,
  CrmMeeting,
  CrmNote,
  CrmPerson,
  CrmTask,
  CrmFile,
} from '../../constants/data';

type DetailRecord = {
  type: string;
  item: Record<string, unknown>;
};

interface RecordDetailDrawerProps {
  record: DetailRecord | null;
  related: {
    people: CrmPerson[];
    tasks: CrmTask[];
    notes: CrmNote[];
    deals: CrmDeal[];
    meetings: CrmMeeting[];
    companies: CompanyTableRow[];
    files: CrmFile[];
  };
  onClose: () => void;
  onEdit?: () => void;
}

export function RecordDetailDrawer({ record, related, onClose, onEdit }: RecordDetailDrawerProps) {
  if (!record) return null;

  const item = record.item;
  const title = String(item.name || item.title || 'Untitled record');
  const companyName = String(item.company || (record.type === 'Companies' ? item.name : '') || '');
  const timeline = buildTimeline(record.type, item, companyName || title, related);

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <aside className="h-full w-full max-w-xl overflow-y-auto border-l shadow-2xl" style={{ background: 'var(--crm-dropdown-bg)', borderColor: 'var(--crm-border-accent)' }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b p-4" style={{ background: 'var(--crm-dropdown-bg)', borderColor: 'var(--crm-border)' }}>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--crm-text-muted)' }}>{record.type.slice(0, -1) || record.type}</p>
            <h2 className="truncate text-lg font-semibold" style={{ color: 'var(--crm-text)' }}>{title}</h2>
          </div>
          <div className="flex gap-2">
            {onEdit && <button onClick={onEdit} className="digital-wave-btn digital-wave-btn-primary" type="button">Edit</button>}
            <button onClick={onClose} className="table-action-btn" type="button" aria-label="Close record details"><X size={15} /></button>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <section className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
            <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Record summary</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {summaryFields(record.type, item).map((field) => (
                <div key={field.label} className="rounded-lg border p-3" style={{ borderColor: 'var(--crm-border-accent)', background: 'var(--crm-card-bg)' }}>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--crm-text-muted)' }}>{field.label}</p>
                  <p className="mt-1 break-words text-sm" style={{ color: 'var(--crm-text)' }}>{field.value || 'Not set'}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
            <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Customer timeline</h3>
            <div className="space-y-2">
              {timeline.length === 0 ? (
                <p className="rounded-lg border p-4 text-center text-xs" style={{ borderColor: 'var(--crm-border)', color: 'var(--crm-text-muted)' }}>No related activity yet. Add notes, tasks, meetings, or deals to build history.</p>
              ) : timeline.map((event, index) => (
                <div key={`${event.title}-${index}`} className="flex gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-card-bg)' }}>
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--crm-surface-alt)', color: event.color }}>
                    <event.icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--crm-text)' }}>{event.title}</p>
                    <p className="text-xs" style={{ color: 'var(--crm-text-muted)' }}>{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function summaryFields(type: string, item: Record<string, unknown>) {
  const common: Array<[string, unknown]> = [
    ['Owner', item.owner || item.assignee || ''],
    ['Status / Stage', item.status || item.stage || ''],
    ['Company', item.company || (type === 'Companies' ? item.name : '') || ''],
  ];
  const typed: Record<string, Array<[string, unknown]>> = {
    Companies: [['Domain', item.domain], ['Employees', item.employees], ['LinkedIn', item.linkedin]],
    People: [['Email', item.email], ['Phone', item.phone], ['Title', item.title], ['Tags', item.tags]],
    Leads: [['Email', item.email], ['Source', item.source], ['Score', item.score]],
    Deals: [['Value', item.value ? `$${Number(item.value).toLocaleString()}` : ''], ['Close date', item.closeDate]],
    Opportunities: [['Value', item.value ? `$${Number(item.value).toLocaleString()}` : ''], ['Probability', item.probability ? `${item.probability}%` : ''], ['Close date', item.closeDate]],
    Tasks: [['Priority', item.priority], ['Due date', item.dueDate]],
    Meetings: [['Date', item.date], ['Duration', item.duration], ['Attendees', item.attendees], ['Location', item.location]],
    Projects: [['Priority', item.priority], ['Budget', item.budget ? `$${Number(item.budget).toLocaleString()}` : ''], ['Dates', [item.startDate, item.endDate].filter(Boolean).join(' -> ')]],
    Notes: [['Category', item.category], ['Content', item.content]],
    Files: [['Type', item.type], ['Size', item.size], ['Uploaded', item.uploadedAt], ['Tags', item.tags]],
  };
  return [...common, ...(typed[type] || [])]
    .filter(([, value]) => value !== undefined)
    .map(([label, value]) => ({ label, value: String(value ?? '') }));
}

function buildTimeline(type: string, item: Record<string, unknown>, subject: string, related: RecordDetailDrawerProps['related']) {
  const lower = subject.toLowerCase();
  const companyId = String(item.companyId || (type === 'Companies' ? item.id : '') || '');
  const contactId = String(item.contactId || (type === 'People' ? item.id : '') || '');
  const dealId = String(item.dealId || (type === 'Deals' ? item.id : '') || '');
  const leadId = String(item.leadId || (type === 'Leads' ? item.id : '') || '');
  const matchesCompany = (value?: string) => value?.toLowerCase().includes(lower) || lower.includes(value?.toLowerCase() || '__no_match__');
  const matchesRelation = (record: { companyId?: string; contactId?: string; dealId?: string; leadId?: string }) =>
    Boolean((companyId && record.companyId === companyId) || (contactId && record.contactId === contactId) || (dealId && record.dealId === dealId) || (leadId && record.leadId === leadId));
  const events = [
    ...related.deals.filter((deal) => matchesRelation(deal) || matchesCompany(deal.company) || (type === 'Deals' && matchesCompany(deal.name))).map((deal) => ({ icon: Briefcase, color: '#22c55e', title: deal.name, detail: `Deal - ${deal.stage} - $${Number(deal.value || 0).toLocaleString()}` })),
    ...related.tasks.filter((task) => matchesRelation(task) || matchesCompany(task.description) || matchesCompany(task.assignee) || matchesCompany(task.tags)).map((task) => ({ icon: CheckSquare, color: '#38bdf8', title: task.title, detail: `Task - ${task.status} - ${task.priority} priority` })),
    ...related.meetings.filter((meeting) => matchesRelation(meeting) || matchesCompany(meeting.title) || matchesCompany(meeting.attendees) || matchesCompany(meeting.notes)).map((meeting) => ({ icon: Calendar, color: '#a78bfa', title: meeting.title, detail: `Meeting - ${meeting.date || 'No date'} - ${meeting.duration || 60} min` })),
    ...related.notes.filter((note) => matchesRelation(note) || matchesCompany(note.title) || matchesCompany(note.content)).map((note) => ({ icon: FileText, color: '#f59e0b', title: note.title, detail: `Note - ${note.category}` })),
    ...related.files.filter((file) => matchesRelation(file) || matchesCompany(file.name) || matchesCompany(file.tags)).map((file) => ({ icon: File, color: '#38bdf8', title: file.name, detail: `File - ${file.type} - ${file.size || 'No size'}` })),
    ...related.people.filter((person) => matchesRelation(person) || matchesCompany(person.company) || (type === 'People' && matchesCompany(person.name))).map((person) => ({ icon: User, color: '#ec4899', title: person.name, detail: `${person.title || 'Contact'} - ${person.email}` })),
  ];
  if (item.owner) {
    events.push({ icon: User, color: '#a78bfa', title: 'Ownership assigned', detail: `Current owner: ${String(item.owner)}` });
  }
  if ('email' in (related.people[0] || {})) {
    events.push({ icon: Mail, color: '#22c55e', title: 'Email activity', detail: 'Email sync is not connected yet.' });
    events.push({ icon: Phone, color: '#38bdf8', title: 'Call log', detail: 'Call logging is ready for future activity capture.' });
    events.push({ icon: Tag, color: '#f59e0b', title: 'Segmentation', detail: 'Tags will help build saved customer segments.' });
  }
  return events.slice(0, 12);
}
