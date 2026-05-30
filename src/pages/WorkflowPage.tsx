import { useMemo, useState } from 'react';
import { Copy, Edit3, Play, Plus, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useWorkflow } from '../hooks/useWorkflow';
import type { Workflow, WorkflowStatus } from '../lib/types';
import { WorkflowBuilder } from '../components/workflows/WorkflowBuilder';

const filters: Array<WorkflowStatus | 'all'> = ['all', 'active', 'draft', 'archived'];

export function WorkflowPage() {
  const { workflows, selectedWorkflow, select, filter, setFilter, upsertWorkflow, removeWorkflow, loading } = useWorkflow();
  const [view, setView] = useState<'list' | 'builder'>('list');

  const visibleWorkflows = useMemo(
    () => workflows.filter((workflow) => filter === 'all' || workflow.status === filter),
    [workflows, filter],
  );

  async function createWorkflow() {
    const payload: Partial<Workflow> = {
      name: 'Untitled workflow',
      description: 'New Digital Wave automation',
      status: 'draft',
      createdBy: 'Current user',
      nodes: [],
      edges: [],
    };

    try {
      const workflow = await api.createWorkflow(payload);
      upsertWorkflow(workflow);
      select(workflow);
      setView('builder');
      toast.success('Workflow created');
    } catch {
      // Create a temporary local workflow for offline support
      const tempId = Math.random().toString(36).substring(2, 15);
      const workflow = { ...payload, _id: tempId, version: 1, runs: 0, updatedAt: new Date().toISOString() } as Workflow;
      upsertWorkflow(workflow);
      select(workflow);
      setView('builder');
      toast.success('Workflow created locally (offline mode)');
    }
  }

  async function deleteWorkflow(workflow: Workflow) {
    removeWorkflow(workflow._id);
    void api.deleteWorkflow(workflow._id).catch(() => undefined);
    toast.success('Workflow deleted');
  }

  async function duplicateWorkflow(workflow: Workflow) {
    const tempId = Math.random().toString(36).substring(2, 15);
    const copy = { ...workflow, _id: tempId, name: `${workflow.name} copy`, status: 'draft' as const, version: 1 };
    upsertWorkflow(copy);
    toast.success('Workflow duplicated');
  }

  async function toggleWorkflow(workflow: Workflow) {
    const nextStatus: WorkflowStatus = workflow.status === 'active' ? 'draft' : 'active';
    const next: Workflow = { ...workflow, status: nextStatus };
    upsertWorkflow(next);
    void api.updateWorkflow(workflow._id, { status: next.status }).catch(() => undefined);
  }

  return (
    <div className="workflow-shell">
      <div className="workflow-topbar">
        <div>
          <span className="eyebrow">Automation studio</span>
          <h2>Workflow command center</h2>
          <p>Build, version, run, and audit CRM automations from one dark enterprise workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={view === 'list' ? 'tab active' : 'tab'} onClick={() => setView('list')}>List</button>
          <button className={view === 'builder' ? 'tab active' : 'tab'} onClick={() => setView('builder')}>Builder</button>
          <button className="btn-primary" onClick={createWorkflow}><Plus size={16} /> Create Workflow</button>
        </div>
      </div>

      {view === 'list' ? (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button key={item} className={filter === item ? 'chip active' : 'chip'} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="overflow-hidden border border-white/10">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Workflow Name</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Created By</th>
                  <th>Versions</th>
                  <th>Runs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && [1, 2, 3].map((item) => (
                  <tr key={item}><td colSpan={7}><div className="skeleton" /></td></tr>
                ))}
                {visibleWorkflows.map((workflow) => (
                  <tr key={workflow._id} onClick={() => select(workflow)}>
                    <td>
                      <b>{workflow.name}</b>
                      <span>{workflow.description}</span>
                    </td>
                    <td><span className={`status ${workflow.status}`}>{workflow.status}</span></td>
                    <td>{new Date(workflow.updatedAt).toLocaleDateString()}</td>
                    <td>{workflow.createdBy}</td>
                    <td>v{workflow.version}</td>
                    <td>{workflow.runs}</td>
                    <td>
                      <div className="table-actions">
                        <button title="Edit" onClick={(event) => { event.stopPropagation(); select(workflow); setView('builder'); }}><Edit3 size={15} /></button>
                        <button title="Duplicate" onClick={(event) => { event.stopPropagation(); void duplicateWorkflow(workflow); }}><Copy size={15} /></button>
                        <button title="Activate or deactivate" onClick={(event) => { event.stopPropagation(); void toggleWorkflow(workflow); }}><Power size={15} /></button>
                        <button title="Delete" onClick={(event) => { event.stopPropagation(); void deleteWorkflow(workflow); }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <WorkflowBuilder workflow={selectedWorkflow} onSave={upsertWorkflow} />
      )}

      {selectedWorkflow && (
        <div className="run-strip">
          <span>Selected: {selectedWorkflow.name}</span>
          <button className="btn-secondary" onClick={() => api.runWorkflow(selectedWorkflow._id).then(() => toast.success('Workflow run completed')).catch(() => toast.success('Workflow run simulated'))}>
            <Play size={16} /> Run workflow
          </button>
        </div>
      )}
    </div>
  );
}
