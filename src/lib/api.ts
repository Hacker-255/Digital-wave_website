import type { Workflow, WorkflowRun, WorkflowVersion } from './types';

interface APIErrorResponse {
  error?: string;
  message?: string;
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const fallbackWorkflows: Workflow[] = [
  {
    _id: 'wf-1',
    name: 'Lead intake and routing',
    description: 'Create a task, assign owner, and notify sales when a qualified lead lands.',
    status: 'active',
    version: 4,
    createdBy: 'Digital Wave Ops',
    runs: 128,
    updatedAt: new Date().toISOString(),
    nodes: [
      { id: 'trigger-1', type: 'input', position: { x: 80, y: 110 }, data: { label: 'Lead Created', kind: 'Trigger Node' } },
      { id: 'condition-1', position: { x: 340, y: 60 }, data: { label: 'Score above 70', kind: 'Condition Node' } },
      { id: 'action-1', position: { x: 620, y: 110 }, data: { label: 'Assign User', kind: 'Action Node' } },
      { id: 'action-2', position: { x: 900, y: 110 }, data: { label: 'Send Notification', kind: 'Action Node' } },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'condition-1', animated: true },
      { id: 'e2-3', source: 'condition-1', target: 'action-1', animated: true },
      { id: 'e3-4', source: 'action-1', target: 'action-2', animated: true },
    ],
  },
  {
    _id: 'wf-2',
    name: 'Opportunity follow-up',
    description: 'Delay 24 hours after new opportunity, then create next-step task.',
    status: 'draft',
    version: 2,
    createdBy: 'Revenue Team',
    runs: 34,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    nodes: [],
    edges: [],
  },
];

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

export const api = {
  async listWorkflows() {
    try {
      return await request<Workflow[]>('/api/workflows');
    } catch {
      return fallbackWorkflows;
    }
  },
  createWorkflow(payload: Partial<Workflow>) {
    return request<Workflow>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateWorkflow(id: string, payload: Partial<Workflow>) {
    return request<Workflow>(`/api/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  deleteWorkflow(id: string) {
    return request<{ ok: boolean }>(`/api/workflows/${id}`, { method: 'DELETE' });
  },
  runWorkflow(id: string) {
    return request<WorkflowRun>(`/api/workflows/${id}/run`, {
      method: 'POST',
      body: JSON.stringify({ inputData: { source: 'manual-run' } }),
    });
  },
  workflowRuns(id: string) {
    return request<WorkflowRun[]>(`/api/workflows/${id}/runs`);
  },
  workflowVersions(id: string) {
    return request<WorkflowVersion[]>(`/api/workflows/${id}/versions`);
  },
  restoreWorkflow(id: string, versionId: string) {
    return request<Workflow>(`/api/workflows/${id}/restore/${versionId}`, { method: 'POST' });
  },
};
