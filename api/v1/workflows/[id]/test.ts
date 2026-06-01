import { getWorkflowStore, runWorkflow } from '../../../_workflowStore.js';

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export default function handler(request: { method?: string; query?: { id?: string }; body?: { triggerData?: Record<string, unknown> } }, response: VercelResponse) {
  response.setHeader('Content-Type', 'application/json');
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const workflow = getWorkflowStore().workflows.find((item) => item._id === String(request.query?.id ?? ''));
  if (!workflow) {
    response.status(404).json({ error: 'Workflow not found' });
    return;
  }
  const run = runWorkflow(workflow, request.body?.triggerData ?? {});
  response.status(200).json({ result: run });
}
