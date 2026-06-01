export type WorkflowAction =
  | 'create_company'
  | 'delete_company'
  | 'assign_owner'
  | 'create_task'
  | 'send_notification'
  | 'webhook'
  | 'filter'
  | 'export';

export type WorkflowStep = {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  actionType?: WorkflowAction;
  config: Record<string, string | number | boolean>;
  next: string[];
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  runCount: number;
};

export type WorkflowExecution = {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startedAt: string;
  finishedAt?: string;
  logs: Array<{ stepId: string; message: string; timestamp: string; status: 'success' | 'failed' }>;
  result?: string;
};

const STORAGE_KEY = 'crm-workflows';
const EXEC_KEY = 'crm-workflow-executions';

function now(): string {
  return new Date().toISOString();
}

function uid(): string {
  return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const defaultWorkflows: WorkflowDefinition[] = [
  {
    id: 'wf-builtin-1',
    name: 'New Company Created',
    description: 'Send notification and log when a new company is added.',
    status: 'active',
    createdAt: now(),
    updatedAt: now(),
    runCount: 12,
    steps: [
      { id: 's1', type: 'trigger', config: { event: 'company_created' }, next: ['s2'] },
      { id: 's2', type: 'action', actionType: 'send_notification', config: { channel: 'in-app', message: 'New company created: {{company.name}}' }, next: ['s3'] },
      { id: 's3', type: 'action', actionType: 'create_task', config: { title: 'Review new company: {{company.name}}', priority: 'medium' }, next: [] },
    ],
  },
  {
    id: 'wf-builtin-2',
    name: 'Large Company Alert',
    description: 'Flag companies with over 1000 employees for executive review.',
    status: 'active',
    createdAt: now(),
    updatedAt: now(),
    runCount: 5,
    steps: [
      { id: 's1', type: 'trigger', config: { event: 'company_created' }, next: ['s2'] },
      { id: 's2', type: 'condition', config: { field: 'employees', operator: '>=', value: 1000 }, next: ['s3'] },
      { id: 's3', type: 'action', actionType: 'send_notification', config: { channel: 'in-app', message: 'Large company added: {{company.name}} ({{company.employees}} employees)' }, next: [] },
    ],
  },
  {
    id: 'wf-builtin-3',
    name: 'Weekly Cleanup',
    description: 'Archive draft workflows older than 30 days.',
    status: 'draft',
    createdAt: now(),
    updatedAt: now(),
    runCount: 0,
    steps: [
      { id: 's1', type: 'trigger', config: { event: 'scheduled', interval: 'weekly' }, next: ['s2'] },
      { id: 's2', type: 'action', actionType: 'send_notification', config: { channel: 'in-app', message: 'Weekly cleanup: review draft workflows.' }, next: [] },
    ],
  },
];

export function loadWorkflows(): WorkflowDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWorkflows));
  return defaultWorkflows;
}

export function saveWorkflows(workflows: WorkflowDefinition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export function loadExecutions(): WorkflowExecution[] {
  try {
    const raw = localStorage.getItem(EXEC_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveExecution(exec: WorkflowExecution): void {
  const all = loadExecutions();
  all.unshift(exec);
  if (all.length > 100) all.length = 100;
  localStorage.setItem(EXEC_KEY, JSON.stringify(all));
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function executeWorkflow(
  workflow: WorkflowDefinition,
  context: Record<string, unknown> = {},
): Promise<WorkflowExecution> {
  const exec: WorkflowExecution = {
    id: uid(),
    workflowId: workflow.id,
    workflowName: workflow.name,
    status: 'running',
    startedAt: now(),
    logs: [],
  };

  try {
    for (const step of workflow.steps) {
      if (step.type === 'condition') {
        exec.logs.push({
          stepId: step.id,
          message: `Evaluating condition: ${step.config.field} ${step.config.operator} ${step.config.value}`,
          timestamp: now(),
          status: 'success',
        });
        // Simulate condition evaluation delay
        await delay(200);
        continue;
      }

      if (step.type === 'action' && step.actionType) {
        const actionLabel = step.actionType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        exec.logs.push({
          stepId: step.id,
          message: `Executing: ${actionLabel} - ${JSON.stringify(step.config)}`,
          timestamp: now(),
          status: 'success',
        });
        await delay(300);
      }
    }

    exec.status = 'success';
    exec.finishedAt = now();
    exec.result = `Workflow "${workflow.name}" completed successfully.`;
    exec.logs.push({
      stepId: 'complete',
      message: `Workflow completed in ${exec.logs.length} steps.`,
      timestamp: now(),
      status: 'success',
    });
  } catch (err) {
    exec.status = 'failed';
    exec.finishedAt = now();
    exec.result = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
    exec.logs.push({
      stepId: 'error',
      message: exec.result,
      timestamp: now(),
      status: 'failed',
    });
  }

  saveExecution(exec);
  return exec;
}

export function createWorkflow(name: string, description: string): WorkflowDefinition {
  const wf: WorkflowDefinition = {
    id: uid(),
    name,
    description,
    status: 'draft',
    steps: [
      {
        id: uid(),
        type: 'trigger',
        config: { event: 'manual' },
        next: [],
      },
    ],
    createdAt: now(),
    updatedAt: now(),
    runCount: 0,
  };
  const all = loadWorkflows();
  all.unshift(wf);
  saveWorkflows(all);
  return wf;
}

export function deleteWorkflow(id: string): void {
  const all = loadWorkflows().filter((w) => w.id !== id);
  saveWorkflows(all);
}
