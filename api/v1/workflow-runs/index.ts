import { getWorkflowStore } from '../../_workflowStore.js';

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export default function handler(request: { method?: string }, response: VercelResponse) {
  response.setHeader('Content-Type', 'application/json');
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }
  response.status(200).json(getWorkflowStore().runs);
}
