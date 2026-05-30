import { Workflow } from '../models/Workflow';
import { WorkflowRun } from '../models/WorkflowRun';

export type WorkflowTriggerType =
  | 'contact.created'
  | 'company.created'
  | 'deal.created'
  | 'deal.stage_changed'
  | 'task.completed'
  | 'manual';

type WorkflowActionResult = {
  type: string;
  status: 'success';
  output: Record<string, unknown>;
};

type TriggerData = Record<string, unknown>;

function getPath(source: unknown, path: string): unknown {
  if (!path) return undefined;
  return path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object' && key in value) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

function renderTemplate(value: unknown, triggerData: TriggerData): unknown {
  if (typeof value !== 'string') return value;
  return value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, path: string) => {
    const resolved = getPath(triggerData, path.trim());
    return resolved == null ? '' : String(resolved);
  });
}

function renderPayload(payload: Record<string, unknown>, triggerData: TriggerData) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, renderTemplate(value, triggerData)]),
  );
}

function conditionMatches(condition: { field: string; operator: string; value: unknown }, triggerData: TriggerData) {
  const actual = getPath(triggerData, condition.field);
  const expected = renderTemplate(condition.value, triggerData);

  switch (condition.operator) {
    case 'not_equals': return String(actual ?? '') !== String(expected ?? '');
    case 'contains': return String(actual ?? '').toLowerCase().includes(String(expected ?? '').toLowerCase());
    case 'is_empty': return actual == null || actual === '';
    case 'is_not_empty': return actual != null && actual !== '';
    case 'greater_than': return Number(actual) > Number(expected);
    case 'less_than': return Number(actual) < Number(expected);
    case 'equals':
    default:
      return String(actual ?? '') === String(expected ?? '');
  }
}

async function executeAction(action: { type: string; targetEntity?: string; payload?: Record<string, unknown> }, triggerData: TriggerData): Promise<WorkflowActionResult> {
  const payload = renderPayload(action.payload ?? {}, triggerData);

  // Version 1 records action intent in the workflow run. Real CRM persistence can plug in here
  // without changing workflow definitions or run history shape.
  return {
    type: action.type,
    status: 'success',
    output: {
      targetEntity: action.targetEntity || '',
      payload,
      executedAt: new Date().toISOString(),
    },
  };
}

async function executeWorkflow(workflow: any, triggerData: TriggerData) {
  const startedAt = new Date();

  try {
    const conditions = workflow.conditions ?? [];
    const failedCondition = conditions.find((condition: any) => !conditionMatches(condition, triggerData));
    if (failedCondition) {
      const result = {
        skipped: true,
        reason: `Condition failed: ${failedCondition.field} ${failedCondition.operator}`,
        actions: [],
      };
      await WorkflowRun.create({
        workflowId: workflow._id,
        status: 'success',
        triggerData,
        result,
        startedAt,
        completedAt: new Date(),
      });
      return result;
    }

    const actions = [];
    for (const action of workflow.actions ?? []) {
      actions.push(await executeAction(action, triggerData));
    }

    const result = { skipped: false, actions };
    await WorkflowRun.create({
      workflowId: workflow._id,
      status: 'success',
      triggerData,
      result,
      startedAt,
      completedAt: new Date(),
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Workflow execution failed';
    await WorkflowRun.create({
      workflowId: workflow._id,
      status: 'failed',
      triggerData,
      result: {},
      errorMessage: message,
      startedAt,
      completedAt: new Date(),
    });
    throw error;
  }
}

export async function runWorkflowById(workflowId: string, triggerData: TriggerData) {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) throw new Error('Workflow not found');
  return executeWorkflow(workflow, triggerData);
}

export async function runMatchingWorkflows(triggerType: WorkflowTriggerType, triggerData: TriggerData) {
  const workflows = await Workflow.find({ status: 'active', 'trigger.type': triggerType });
  const results = [];

  for (const workflow of workflows) {
    try {
      results.push({ workflowId: workflow._id, result: await executeWorkflow(workflow, triggerData) });
    } catch (error) {
      results.push({
        workflowId: workflow._id,
        error: error instanceof Error ? error.message : 'Workflow failed',
      });
    }
  }

  return results;
}

export async function safelyRunMatchingWorkflows(triggerType: WorkflowTriggerType, triggerData: TriggerData) {
  try {
    return await runMatchingWorkflows(triggerType, triggerData);
  } catch (error) {
    console.warn('[Workflow] execution failed without interrupting CRM action', error);
    return [];
  }
}
