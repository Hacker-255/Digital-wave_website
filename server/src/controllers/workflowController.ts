import type { Request, Response } from 'express';
import { Workflow } from '../models/Workflow';
import { WorkflowRun } from '../models/WorkflowRun';
import { runMatchingWorkflows, runWorkflowById, type WorkflowTriggerType } from '../services/workflowEngine';

function canPersist() {
  return Workflow.db.readyState === 1;
}

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  };
}

function requireDb(req: Request, res: Response) {
  if (canPersist()) return true;
  res.status(503).json({ error: 'MongoDB is not connected' });
  return false;
}

function validateWorkflow(body: any) {
  if (!body.name?.trim()) return 'Workflow name is required';
  if (!body.trigger?.type) return 'Workflow trigger is required';
  if (!Array.isArray(body.actions) || body.actions.length === 0) return 'At least one workflow action is required';
  return '';
}

export const listWorkflows = asyncHandler(async (request, response) => {
  if (!requireDb(request, response)) return;
  const workflows = await Workflow.find().sort({ updatedAt: -1 });
  response.json(workflows);
});

export const createWorkflow = asyncHandler(async (request, response) => {
  if (!requireDb(request, response)) return;
  const validationError = validateWorkflow(request.body);
  if (validationError) { response.status(400).json({ error: validationError }); return; }

  const workflow = await Workflow.create({
    ...request.body,
    createdBy: request.authUser?.email || request.authUser?.clerkId || 'unknown',
  });
  response.status(201).json(workflow);
});

export const getWorkflow = asyncHandler(async (request, response) => {
  if (!requireDb(request, response)) return;
  const workflow = await Workflow.findById(request.params.id);
  if (!workflow) { response.status(404).json({ error: 'Workflow not found' }); return; }
  response.json(workflow);
});

export const updateWorkflow = asyncHandler(async (request, response) => {
  if (!requireDb(request, response)) return;
  const workflow = await Workflow.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
  if (!workflow) { response.status(404).json({ error: 'Workflow not found' }); return; }
  response.json(workflow);
});

export const deleteWorkflow = asyncHandler(async (request, response) => {
  if (!requireDb(request, response)) return;
  const workflow = await Workflow.findByIdAndDelete(request.params.id);
  if (!workflow) { response.status(404).json({ error: 'Workflow not found' }); return; }
  response.json({ ok: true });
});

export const activateWorkflow = asyncHandler(async (request, response) => {
  if (!requireDb(request, response)) return;
  const workflow = await Workflow.findByIdAndUpdate(request.params.id, { status: 'active' }, { new: true });
  if (!workflow) { response.status(404).json({ error: 'Workflow not found' }); return; }
  response.json(workflow);
});

export const deactivateWorkflow = asyncHandler(async (request, response) => {
  if (!requireDb(request, response)) return;
  const workflow = await Workflow.findByIdAndUpdate(request.params.id, { status: 'inactive' }, { new: true });
  if (!workflow) { response.status(404).json({ error: 'Workflow not found' }); return; }
  response.json(workflow);
});

export const testWorkflow = asyncHandler(async (request, response) => {
  if (!requireDb(request, response)) return;
  const result = await runWorkflowById(String(request.params.id), request.body.triggerData ?? sampleTriggerData());
  response.json({ result });
});

export const manualRun = asyncHandler(async (request, response) => {
  if (!requireDb(request, response)) return;
  const triggerType = String(request.body.triggerType ?? 'manual') as WorkflowTriggerType;
  const results = await runMatchingWorkflows(triggerType, request.body.triggerData ?? sampleTriggerData());
  response.json({ results });
});

export const listWorkflowRuns = asyncHandler(async (request, response) => {
  if (!requireDb(request, response)) return;
  const query = request.query.workflowId ? { workflowId: request.query.workflowId } : {};
  const runs = await WorkflowRun.find(query).sort({ startedAt: -1 }).limit(100);
  response.json(runs);
});

function sampleTriggerData() {
  return {
    contact: { name: 'Maya Stone', ownerId: 'admin-default' },
    company: { name: 'NovaGrid Systems', ownerId: '' },
    deal: { name: 'Website redesign', stage: 'Won', previousStage: 'Proposal' },
    task: { title: 'Send proposal follow-up', status: 'completed' },
  };
}
