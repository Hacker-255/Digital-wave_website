import { createId, getWorkflowStore, type Workflow } from '../../_workflowStore.js';

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export default function handler(request: { method?: string; body?: Partial<Workflow> }, response: VercelResponse) {
  response.setHeader('Content-Type', 'application/json');
  const store = getWorkflowStore();

  if (request.method === 'GET') {
    response.status(200).json(store.workflows);
    return;
  }

  if (request.method === 'POST') {
    const body = request.body ?? {};
    if (!body.name?.trim()) {
      response.status(400).json({ error: 'Workflow name is required' });
      return;
    }
    if (!body.actions?.length) {
      response.status(400).json({ error: 'Add at least one action' });
      return;
    }

    const now = new Date().toISOString();
    const workflow: Workflow = {
      _id: createId('wf'),
      name: body.name,
      description: body.description ?? '',
      status: body.status ?? 'inactive',
      trigger: body.trigger ?? { type: 'manual' },
      conditions: body.conditions ?? [],
      actions: body.actions,
      createdBy: 'Digital Wave Admin',
      createdAt: now,
      updatedAt: now,
    };
    store.workflows.unshift(workflow);
    response.status(201).json(workflow);
    return;
  }

  response.status(405).json({ error: 'Method not allowed' });
}
