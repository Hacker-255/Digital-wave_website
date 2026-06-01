export type WorkflowStatus = 'active' | 'inactive';
export type Workflow = {
  _id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: { type: string; entity?: string; field?: string; from?: string; to?: string };
  conditions: Array<{ field: string; operator: string; value: string }>;
  actions: Array<{ type: string; targetEntity: string; payload: Record<string, string> }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowRun = {
  _id: string;
  workflowId: string;
  status: 'success' | 'failed';
  triggerData: Record<string, unknown>;
  result: unknown;
  errorMessage?: string;
  startedAt: string;
  completedAt: string;
};

type Store = {
  workflows: Workflow[];
  runs: WorkflowRun[];
};

const globalStore = globalThis as typeof globalThis & { digitalWaveWorkflowStore?: Store };

export function getWorkflowStore() {
  if (!globalStore.digitalWaveWorkflowStore) {
    globalStore.digitalWaveWorkflowStore = {
      workflows: [],
      runs: [],
    };
  }
  return globalStore.digitalWaveWorkflowStore;
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function runWorkflow(workflow: Workflow, triggerData: Record<string, unknown> = {}) {
  const store = getWorkflowStore();
  const now = new Date().toISOString();
  const run: WorkflowRun = {
    _id: createId('run'),
    workflowId: workflow._id,
    status: 'success',
    triggerData,
    result: {
      workflow: workflow.name,
      actions: workflow.actions.map((action) => ({
        type: action.type,
        targetEntity: action.targetEntity,
        payload: action.payload,
        status: 'simulated',
      })),
    },
    startedAt: now,
    completedAt: now,
  };
  store.runs.unshift(run);
  return run;
}
