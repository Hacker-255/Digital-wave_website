import type { Edge, Node } from 'reactflow';

export type WorkflowStatus = 'active' | 'draft' | 'archived';

export type Workflow = {
  _id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  nodes: Node[];
  edges: Edge[];
  version: number;
  createdBy: string;
  runs: number;
  updatedAt: string;
};

export type WorkflowRun = {
  _id: string;
  workflowId: string;
  status: 'success' | 'failed' | 'running';
  logs: string[];
  inputData: Record<string, unknown>;
  errorMessages: string[];
  startedAt: string;
  finishedAt?: string;
};

export type WorkflowVersion = {
  _id: string;
  workflowId: string;
  versionNumber: number;
  snapshot: Workflow;
  createdAt: string;
};
