import { getWorkflowStore, type Workflow } from '../../_workflowStore';

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export default function handler(request: { method?: string; query?: { id?: string }; body?: Partial<Workflow> }, response: VercelResponse) {
  response.setHeader('Content-Type', 'application/json');
  const store = getWorkflowStore();
  const id = String(request.query?.id ?? '');
  const workflow = store.workflows.find((item) => item._id === id);

  if (!workflow) {
    response.status(404).json({ error: 'Workflow not found' });
    return;
  }

  if (request.method === 'GET') {
    response.status(200).json(workflow);
    return;
  }

  if (request.method === 'PATCH') {
    const body = request.body ?? {};
    Object.assign(workflow, {
      ...body,
      _id: workflow._id,
      createdAt: workflow.createdAt,
      updatedAt: new Date().toISOString(),
    });
    response.status(200).json(workflow);
    return;
  }

  if (request.method === 'DELETE') {
    store.workflows = store.workflows.filter((item) => item._id !== id);
    response.status(200).json({ ok: true });
    return;
  }

  response.status(405).json({ error: 'Method not allowed' });
}
