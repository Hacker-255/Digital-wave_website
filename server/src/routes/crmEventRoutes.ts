import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { safelyRunMatchingWorkflows } from '../services/workflowEngine';

export const crmEventRoutes = Router();

crmEventRoutes.use(requireAuth);

crmEventRoutes.post('/contacts', async (req, res) => {
  const contact = { id: `contact-${Date.now()}`, ...req.body };
  const workflowResults = await safelyRunMatchingWorkflows('contact.created', { contact });
  res.status(201).json({ contact, workflowResults });
});

crmEventRoutes.post('/companies', async (req, res) => {
  const company = { id: `company-${Date.now()}`, ...req.body };
  const workflowResults = await safelyRunMatchingWorkflows('company.created', { company });
  res.status(201).json({ company, workflowResults });
});

crmEventRoutes.post('/deals', async (req, res) => {
  const deal = { id: `deal-${Date.now()}`, ...req.body };
  const workflowResults = await safelyRunMatchingWorkflows('deal.created', { deal });
  res.status(201).json({ deal, workflowResults });
});

crmEventRoutes.patch('/deals/:id/stage', async (req, res) => {
  const deal = { id: req.params.id, previousStage: req.body.from, stage: req.body.to, ...req.body.deal };
  const workflowResults = await safelyRunMatchingWorkflows('deal.stage_changed', { deal });
  res.json({ deal, workflowResults });
});

crmEventRoutes.patch('/tasks/:id/complete', async (req, res) => {
  const task = { id: req.params.id, status: 'completed', ...req.body };
  const workflowResults = await safelyRunMatchingWorkflows('task.completed', { task });
  res.json({ task, workflowResults });
});
