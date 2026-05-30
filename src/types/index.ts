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

export type CrmRecord = {
  title: string;
  detail: string;
  status: string;
  module: string;
};

export type CrmAction =
  | 'import'
  | 'export'
  | 'deleted'
  | 'create-view'
  | 'search'
  | 'ask-ai'
  | 'ai-history'
  | 'compose-email'
  | 'settings'
  | 'experience-settings'
  | 'accounts-settings'
  | 'emails-settings';

export type CompanyTableRow = {
  id: string;
  name: string;
  domain: string;
  createdBy: string;
  owner: string;
  createdAt: string;
  employees: number | '';
  linkedin: string;
  color: string;
  icon: string;
};
