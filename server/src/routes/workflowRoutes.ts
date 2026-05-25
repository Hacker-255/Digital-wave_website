import { Router } from 'express';
import {
  createWorkflow,
  deleteWorkflow,
  getWorkflow,
  listRuns,
  listVersions,
  listWorkflows,
  restoreVersion,
  runWorkflowById,
  updateWorkflow,
} from '../controllers/workflowController';

export const workflowRoutes = Router();

workflowRoutes.post('/', createWorkflow);
workflowRoutes.get('/', listWorkflows);
workflowRoutes.get('/:id', getWorkflow);
workflowRoutes.patch('/:id', updateWorkflow);
workflowRoutes.delete('/:id', deleteWorkflow);
workflowRoutes.post('/:id/run', runWorkflowById);
workflowRoutes.get('/:id/runs', listRuns);
workflowRoutes.get('/:id/versions', listVersions);
workflowRoutes.post('/:id/restore/:versionId', restoreVersion);
