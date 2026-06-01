import { isSupabaseConfigured, requireSupabase } from '../lib/supabase';

export type WorkflowStatus = 'active' | 'inactive';
export type TriggerType = 'contact.created' | 'company.created' | 'deal.created' | 'deal.stage_changed' | 'task.completed' | 'manual';
export type ActionType = 'create_task' | 'create_note' | 'update_deal_stage' | 'assign_record' | 'create_activity';

export type WorkflowCondition = { field: string; operator: string; value: string };
export type WorkflowAction = { type: ActionType; targetEntity: string; payload: Record<string, string> };
type TriggerConfig = Record<string, unknown> & { conditions?: WorkflowCondition[] };

export type Workflow = {
  _id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: { type: TriggerType; entity?: string; field?: string; from?: string; to?: string };
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type WorkflowRow = {
  id: string;
  name: string;
  description: string | null;
  trigger_type: TriggerType | null;
  trigger_config: TriggerConfig | null;
  actions: WorkflowAction[] | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

function fromWorkflowRow(row: WorkflowRow): Workflow {
  return {
    _id: row.id,
    name: row.name || 'Untitled workflow',
    description: row.description || '',
    status: row.enabled ? 'active' : 'inactive',
    trigger: { type: row.trigger_type || 'manual', ...(row.trigger_config || {}) },
    conditions: Array.isArray(row.trigger_config?.conditions) ? row.trigger_config.conditions : [],
    actions: Array.isArray(row.actions) ? row.actions : [],
    createdBy: 'Current user',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toWorkflowPayload(workflow: Partial<Workflow>) {
  const trigger = workflow.trigger || { type: 'manual' as TriggerType };
  return {
    name: workflow.name || 'Untitled workflow',
    description: workflow.description || '',
    trigger_type: trigger.type || 'manual',
    trigger_config: Object.fromEntries(Object.entries({ ...trigger, conditions: workflow.conditions || [] }).filter(([key]) => key !== 'type')),
    actions: workflow.actions || [],
    enabled: workflow.status === 'active',
    updated_at: new Date().toISOString(),
  };
}

export async function getWorkflows() {
  if (!isSupabaseConfigured) return [];
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as WorkflowRow[]).map(fromWorkflowRow);
}

export async function createWorkflow(workflow: Partial<Workflow>) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('workflows')
    .insert(toWorkflowPayload(workflow))
    .select('*')
    .single();

  if (error) throw error;
  return fromWorkflowRow(data as WorkflowRow);
}

export async function updateWorkflow(id: string, workflow: Partial<Workflow>) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('workflows')
    .update(toWorkflowPayload(workflow))
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return fromWorkflowRow(data as WorkflowRow);
}

export async function deleteWorkflow(id: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('workflows').delete().eq('id', id);
  if (error) throw error;
}

export async function setWorkflowEnabled(id: string, enabled: boolean) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('workflows')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return fromWorkflowRow(data as WorkflowRow);
}
