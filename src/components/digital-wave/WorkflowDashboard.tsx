import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Activity, CheckCircle, ClipboardList, FileEdit, ListFilter, Play, Plus, Power, Trash2 } from 'lucide-react';
import {
  createWorkflow,
  deleteWorkflow as deleteSupabaseWorkflow,
  getWorkflows,
  setWorkflowEnabled,
  updateWorkflow,
  type ActionType,
  type TriggerType,
  type Workflow,
  type WorkflowAction,
  type WorkflowCondition,
  type WorkflowStatus,
} from '../../services/supabaseWorkflowService';
type WorkflowRun = {
  _id: string;
  workflowId: string;
  status: 'success' | 'failed';
  triggerData: Record<string, unknown>;
  result: unknown;
  errorMessage?: string;
  startedAt: string;
  completedAt: string;
};

const triggerOptions: Array<{ label: string; value: TriggerType }> = [
  { label: 'Contact created', value: 'contact.created' },
  { label: 'Company created', value: 'company.created' },
  { label: 'Deal created', value: 'deal.created' },
  { label: 'Deal stage changed', value: 'deal.stage_changed' },
  { label: 'Task completed', value: 'task.completed' },
  { label: 'Manual trigger', value: 'manual' },
];

const actionOptions: Array<{ label: string; value: ActionType }> = [
  { label: 'Create task', value: 'create_task' },
  { label: 'Create note', value: 'create_note' },
  { label: 'Update deal stage', value: 'update_deal_stage' },
  { label: 'Assign record to user', value: 'assign_record' },
  { label: 'Create activity/notification', value: 'create_activity' },
];

function emptyWorkflow(): Partial<Workflow> {
  return {
    name: '',
    description: '',
    status: 'inactive',
    trigger: { type: 'manual', entity: '', field: '', from: '', to: '' },
    conditions: [],
    actions: [{ type: 'create_task', targetEntity: 'task', payload: { title: 'Follow up with {{contact.name}}', dueDate: 'tomorrow', assignedTo: '{{contact.ownerId}}' } }],
  };
}

export function WorkflowDashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [view, setView] = useState<'list' | 'new' | 'edit' | 'details' | 'runs'>('list');
  const [selected, setSelected] = useState<Workflow | null>(null);
  const [draft, setDraft] = useState<Partial<Workflow>>(emptyWorkflow());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeCount = useMemo(() => workflows.filter((workflow) => workflow.status === 'active').length, [workflows]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const workflowData = await getWorkflows();
      setWorkflows(workflowData);
      setRuns([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load workflows');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function startCreate(template?: Partial<Workflow>) {
    setDraft(template ?? emptyWorkflow());
    setSelected(null);
    setView('new');
    setError('');
  }

  function startEdit(workflow: Workflow) {
    setDraft(workflow);
    setSelected(workflow);
    setView('edit');
    setError('');
  }

  function addCondition() {
    setDraft((current) => ({ ...current, conditions: [...(current.conditions ?? []), { field: 'company.ownerId', operator: 'is_empty', value: '' }] }));
  }

  function updateCondition(index: number, patch: Partial<WorkflowCondition>) {
    setDraft((current) => ({
      ...current,
      conditions: (current.conditions ?? []).map((condition, idx) => idx === index ? { ...condition, ...patch } : condition),
    }));
  }

  function addAction() {
    setDraft((current) => ({ ...current, actions: [...(current.actions ?? []), { type: 'create_activity', targetEntity: 'activity', payload: { type: 'notification', message: 'Workflow action completed' } }] }));
  }

  function updateAction(index: number, patch: Partial<WorkflowAction>) {
    setDraft((current) => ({
      ...current,
      actions: (current.actions ?? []).map((action, idx) => idx === index ? { ...action, ...patch } : action),
    }));
  }

  function updateActionPayload(index: number, key: string, value: string) {
    setDraft((current) => ({
      ...current,
      actions: (current.actions ?? []).map((action, idx) => idx === index ? { ...action, payload: { ...(action.payload ?? {}), [key]: value } } : action),
    }));
  }

  async function saveWorkflow() {
    if (!draft.name?.trim()) { setError('Workflow name is required'); return; }
    if (!draft.actions?.length) { setError('Add at least one action'); return; }
    setSaving(true);
    setError('');
    try {
      const workflow = selected ? await updateWorkflow(selected._id, draft) : await createWorkflow(draft);
      setSelected(workflow);
      setView('details');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save workflow');
    } finally {
      setSaving(false);
    }
  }

  async function deleteWorkflow(workflow: Workflow) {
    if (!confirm(`Delete ${workflow.name}?`)) return;
    await deleteSupabaseWorkflow(workflow._id);
    await load();
  }

  async function toggleWorkflow(workflow: Workflow) {
    await setWorkflowEnabled(workflow._id, workflow.status !== 'active');
    await load();
  }

  async function testWorkflow(workflow: Workflow) {
    const now = new Date().toISOString();
    setRuns((current) => [{
      _id: `run-${Date.now()}`,
      workflowId: workflow._id,
      status: 'success',
      triggerData: sampleTriggerData(),
      result: 'Workflow execution is coming soon.',
      startedAt: now,
      completedAt: now,
    }, ...current]);
    setError('Workflow execution is coming soon.');
    setView('runs');
  }

  function setExample(type: 'contact' | 'deal' | 'task' | 'company') {
    const examples: Record<typeof type, Partial<Workflow>> = {
      contact: {
        name: 'New contact follow-up',
        description: 'Create a follow-up task when a contact is created.',
        status: 'active',
        trigger: { type: 'contact.created', entity: 'contact' },
        actions: [{ type: 'create_task', targetEntity: 'task', payload: { title: 'Follow up with {{contact.name}}', dueDate: 'tomorrow', assignedTo: '{{contact.ownerId}}' } }],
        conditions: [],
      },
      deal: {
        name: 'Deal won note',
        description: 'Create a note when a deal is marked won.',
        status: 'active',
        trigger: { type: 'deal.stage_changed', entity: 'deal', field: 'stage', to: 'Won' },
        conditions: [{ field: 'deal.stage', operator: 'equals', value: 'Won' }],
        actions: [{ type: 'create_note', targetEntity: 'note', payload: { content: 'Deal marked as won.', linkedTo: 'deal' } }],
      },
      task: {
        name: 'Task completed activity',
        description: 'Create an activity when a task is completed.',
        status: 'active',
        trigger: { type: 'task.completed', entity: 'task', field: 'status', to: 'completed' },
        conditions: [],
        actions: [{ type: 'create_activity', targetEntity: 'activity', payload: { type: 'task_completed', message: 'Task {{task.title}} was completed.' } }],
      },
      company: {
        name: 'New company assignment',
        description: 'Assign new unowned companies to the default admin.',
        status: 'active',
        trigger: { type: 'company.created', entity: 'company' },
        conditions: [{ field: 'company.ownerId', operator: 'is_empty', value: '' }],
        actions: [{ type: 'assign_record', targetEntity: 'company', payload: { assignedTo: 'default-admin-user' } }],
      },
    };
    startCreate(examples[type]);
  }

  return (
    <div className="flex h-full min-h-[620px] flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Workflow automation</h2>
          <p className="text-xs text-white/50">{workflows.length} workflows - {activeCount} active - {runs.length} recent runs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setView('list')} className="digital-wave-btn digital-wave-btn-ghost" type="button"><ClipboardList size={13} /> List</button>
          <button onClick={() => setView('runs')} className="digital-wave-btn digital-wave-btn-ghost" type="button"><Activity size={13} /> Runs</button>
          <button onClick={() => startCreate()} className="digital-wave-btn digital-wave-btn-primary" type="button"><Plus size={13} /> Create workflow</button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div>}

      {view === 'list' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setExample('contact')} className="digital-wave-btn digital-wave-btn-ghost" type="button">Example: contact follow-up</button>
            <button onClick={() => setExample('deal')} className="digital-wave-btn digital-wave-btn-ghost" type="button">Example: deal won note</button>
            <button onClick={() => setExample('task')} className="digital-wave-btn digital-wave-btn-ghost" type="button">Example: task activity</button>
            <button onClick={() => setExample('company')} className="digital-wave-btn digital-wave-btn-ghost" type="button">Example: company assignment</button>
          </div>
          {loading ? <WorkflowSkeleton /> : workflows.length === 0 ? (
            <EmptyState title="No workflows yet" body="Create a workflow or start from one of the examples above." />
          ) : workflows.map((workflow) => (
            <div key={workflow._id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <button onClick={() => { setSelected(workflow); setView('details'); }} className="text-left" type="button">
                  <div className="flex items-center gap-2">
                    <b className="text-sm text-white">{workflow.name}</b>
                    <span className={workflow.status === 'active' ? 'status active' : 'status draft'}>{workflow.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/45">{workflow.description || 'No description'}</p>
                  <p className="mt-2 text-[11px] text-white/35"><ListFilter size={11} className="mr-1 inline" />{workflow.trigger?.type ?? 'manual'} - {workflow.actions?.length ?? 0} action(s)</p>
                </button>
                <div className="flex flex-wrap gap-1">
                  <button onClick={() => testWorkflow(workflow)} className="table-action-btn" type="button" title="Test"><Play size={13} /></button>
                  <button onClick={() => startEdit(workflow)} className="table-action-btn" type="button" title="Edit"><FileEdit size={13} /></button>
                  <button onClick={() => toggleWorkflow(workflow)} className="table-action-btn" type="button" title="Activate/deactivate"><Power size={13} /></button>
                  <button onClick={() => deleteWorkflow(workflow)} className="table-action-btn text-red-300" type="button" title="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(view === 'new' || view === 'edit') && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Workflow name"><input value={draft.name ?? ''} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /></Field>
              <Field label="Status">
                <select value={draft.status ?? 'inactive'} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as WorkflowStatus }))}>
                  <option value="inactive">inactive</option>
                  <option value="active">active</option>
                </select>
              </Field>
              <Field label="Description"><textarea value={draft.description ?? ''} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} /></Field>
              <Field label="Trigger">
                <select value={draft.trigger?.type ?? 'manual'} onChange={(e) => setDraft((d) => ({ ...d, trigger: { ...(d.trigger ?? {}), type: e.target.value as TriggerType } }))}>
                  {triggerOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
            </div>

            <BuilderSection title="Conditions" onAdd={addCondition}>
              {(draft.conditions ?? []).length === 0 && <p className="text-xs text-white/40">No conditions. Workflow runs whenever the trigger matches.</p>}
              {(draft.conditions ?? []).map((condition, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-3">
                  <input value={condition.field} onChange={(e) => updateCondition(index, { field: e.target.value })} placeholder="field e.g. company.ownerId" />
                  <select value={condition.operator} onChange={(e) => updateCondition(index, { operator: e.target.value })}>
                    {['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty', 'greater_than', 'less_than'].map((operator) => <option key={operator} value={operator}>{operator}</option>)}
                  </select>
                  <input value={condition.value} onChange={(e) => updateCondition(index, { value: e.target.value })} placeholder="value" />
                </div>
              ))}
            </BuilderSection>

            <BuilderSection title="Actions" onAdd={addAction}>
              {(draft.actions ?? []).map((action, index) => (
                <div key={index} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <select value={action.type} onChange={(e) => updateAction(index, { type: e.target.value as ActionType })}>
                      {actionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <input value={action.targetEntity} onChange={(e) => updateAction(index, { targetEntity: e.target.value })} placeholder="target entity" />
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    {Object.entries(action.payload ?? {}).map(([key, value]) => (
                      <input key={key} value={String(value)} onChange={(e) => updateActionPayload(index, key, e.target.value)} placeholder={key} />
                    ))}
                    <button className="digital-wave-btn digital-wave-btn-ghost" onClick={() => updateActionPayload(index, `field${Object.keys(action.payload ?? {}).length + 1}`, '')} type="button">Add payload field</button>
                  </div>
                </div>
              ))}
            </BuilderSection>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button onClick={() => setView('list')} className="digital-wave-btn digital-wave-btn-ghost" type="button">Cancel</button>
              <button onClick={saveWorkflow} disabled={saving} className="digital-wave-btn digital-wave-btn-primary" type="button">{saving ? 'Saving...' : 'Save workflow'}</button>
            </div>
          </section>
          <aside className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/55">
            <b className="text-white">Template variables</b>
            <p className="mt-2">Use values like <code>{'{{contact.name}}'}</code>, <code>{'{{deal.stage}}'}</code>, and <code>{'{{task.title}}'}</code> inside action payloads.</p>
          </aside>
        </div>
      )}

      {view === 'details' && selected && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-2">
            <div><h3 className="text-base font-semibold text-white">{selected.name}</h3><p className="text-xs text-white/45">{selected.description}</p></div>
            <button onClick={() => testWorkflow(selected)} className="digital-wave-btn digital-wave-btn-primary" type="button"><Play size={13} /> Test workflow</button>
          </div>
          <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-white/70">{JSON.stringify(selected, null, 2)}</pre>
        </div>
      )}

      {view === 'runs' && (
        <div className="space-y-2">
          {runs.length === 0 ? <EmptyState title="No workflow runs yet" body="Test or manually run an active workflow to create run logs." /> : runs.map((run) => (
            <div key={run._id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs">
              <div className="mb-2 flex items-center gap-2"><CheckCircle size={13} className={run.status === 'success' ? 'text-emerald-300' : 'text-red-300'} /><b>{run.status}</b><span className="text-white/40">{new Date(run.startedAt).toLocaleString()}</span></div>
              <pre className="max-h-32 overflow-auto text-white/50">{JSON.stringify(run.result || run.errorMessage, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="workflow-field"><span>{label}</span>{children}</label>;
}

function BuilderSection({ title, onAdd, children }: { title: string; onAdd: () => void; children: ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold text-white">{title}</h3><button onClick={onAdd} className="digital-wave-btn digital-wave-btn-ghost" type="button"><Plus size={12} /> Add</button></div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.03] py-12 text-center"><b className="text-sm text-white">{title}</b><p className="mt-1 text-xs text-white/45">{body}</p></div>;
}

function WorkflowSkeleton() {
  return <div className="space-y-2">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-white/10" />)}</div>;
}

function sampleTriggerData() {
  return {
    contact: { name: 'Maya Stone', ownerId: 'admin-default' },
    company: { name: 'NovaGrid Systems', ownerId: '' },
    deal: { name: 'Website redesign', stage: 'Won', previousStage: 'Proposal' },
    task: { title: 'Send proposal follow-up', status: 'completed' },
  };
}
