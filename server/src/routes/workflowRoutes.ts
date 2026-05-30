import { Router } from 'express';
import {
  activateWorkflow,
  createWorkflow,
  deactivateWorkflow,
  deleteWorkflow,
  getWorkflow,
  listWorkflowRuns,
  listWorkflows,
  manualRun,
  testWorkflow,
  updateWorkflow,
} from '../controllers/workflowController';
import { requireAuth, requireRole } from '../middleware/auth';

export const workflowRoutes = Router();

workflowRoutes.use(requireAuth);

workflowRoutes.get('/', listWorkflows);
workflowRoutes.post('/', requireRole('Owner', 'Admin'), createWorkflow);
workflowRoutes.get('/:id', getWorkflow);
workflowRoutes.patch('/:id', requireRole('Owner', 'Admin'), updateWorkflow);
workflowRoutes.delete('/:id', requireRole('Owner', 'Admin'), deleteWorkflow);
workflowRoutes.patch('/:id/activate', requireRole('Owner', 'Admin'), activateWorkflow);
workflowRoutes.patch('/:id/deactivate', requireRole('Owner', 'Admin'), deactivateWorkflow);
workflowRoutes.post('/:id/test', requireRole('Owner', 'Admin'), testWorkflow);
workflowRoutes.post('/manual-run', requireRole('Owner', 'Admin'), manualRun);

export const workflowRunRoutes = Router();
workflowRunRoutes.use(requireAuth);
workflowRunRoutes.get('/', listWorkflowRuns);
