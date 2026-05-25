import type { Request, Response } from 'express';
import { Workflow } from '../models/Workflow';
import { WorkflowRun } from '../models/WorkflowRun';
import { WorkflowVersion } from '../models/WorkflowVersion';
import { runWorkflow } from '../services/workflowEngine';

function canPersist() {
  return Workflow.db.readyState === 1;
}

export async function createWorkflow(request: Request, response: Response) {
  if (!canPersist()) return response.status(503).send('MongoDB is not connected');
  const workflow = await Workflow.create(request.body);
  await WorkflowVersion.create({ workflowId: workflow._id, versionNumber: workflow.version, snapshot: workflow.toObject() });
  response.status(201).json(workflow);
}

export async function listWorkflows(_: Request, response: Response) {
  if (!canPersist()) return response.status(503).send('MongoDB is not connected');
  const workflows = await Workflow.find().sort({ updatedAt: -1 });
  response.json(workflows);
}

export async function getWorkflow(request: Request, response: Response) {
  if (!canPersist()) return response.status(503).send('MongoDB is not connected');
  const workflow = await Workflow.findById(request.params.id);
  if (!workflow) return response.status(404).send('Workflow not found');
  response.json(workflow);
}

export async function updateWorkflow(request: Request, response: Response) {
  if (!canPersist()) return response.status(503).send('MongoDB is not connected');
  const existing = await Workflow.findById(request.params.id);
  if (!existing) return response.status(404).send('Workflow not found');

  const nextVersion = existing.version + 1;
  const workflow = await Workflow.findByIdAndUpdate(
    request.params.id,
    { ...request.body, version: nextVersion },
    { new: true, runValidators: true },
  );

  await WorkflowVersion.create({ workflowId: existing._id, versionNumber: nextVersion, snapshot: workflow?.toObject() });
  response.json(workflow);
}

export async function deleteWorkflow(request: Request, response: Response) {
  if (!canPersist()) return response.status(503).send('MongoDB is not connected');
  await Workflow.findByIdAndUpdate(request.params.id, { status: 'archived' });
  response.json({ ok: true });
}

export async function runWorkflowById(request: Request, response: Response) {
  if (!canPersist()) return response.status(503).send('MongoDB is not connected');
  const workflow = await Workflow.findById(request.params.id);
  if (!workflow) return response.status(404).send('Workflow not found');

  const run = await WorkflowRun.create({
    workflowId: workflow._id,
    status: 'running',
    inputData: request.body.inputData ?? {},
    startedAt: new Date(),
  });

  const result = await runWorkflow({ nodes: workflow.nodes, edges: workflow.edges }, request.body.inputData ?? {});

  run.status = result.status;
  run.logs = result.logs;
  run.errorMessages = result.errorMessages;
  run.finishedAt = new Date();
  await run.save();
  await Workflow.findByIdAndUpdate(workflow._id, { $inc: { runs: 1 } });

  response.json(run);
}

export async function listRuns(request: Request, response: Response) {
  if (!canPersist()) return response.status(503).send('MongoDB is not connected');
  const runs = await WorkflowRun.find({ workflowId: request.params.id }).sort({ createdAt: -1 });
  response.json(runs);
}

export async function listVersions(request: Request, response: Response) {
  if (!canPersist()) return response.status(503).send('MongoDB is not connected');
  const versions = await WorkflowVersion.find({ workflowId: request.params.id }).sort({ versionNumber: -1 });
  response.json(versions);
}

export async function restoreVersion(request: Request, response: Response) {
  if (!canPersist()) return response.status(503).send('MongoDB is not connected');
  const version = await WorkflowVersion.findById(request.params.versionId);
  if (!version) return response.status(404).send('Workflow version not found');

  const snapshot = version.snapshot;
  const workflow = await Workflow.findByIdAndUpdate(
    request.params.id,
    {
      name: snapshot.name,
      description: snapshot.description,
      status: 'draft',
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      version: snapshot.version + 1,
    },
    { new: true },
  );

  response.json(workflow);
}
