import { z } from 'zod';
import type { CrudField } from '../components/digital-wave/CrudModal';

export const personSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  title: z.string().max(200).optional().or(z.literal('')),
  company: z.string().max(200).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
  priority: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  assignee: z.string().max(200).optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
});

export const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  content: z.string().min(1, 'Content is required'),
  category: z.string().optional().or(z.literal('')),
});

export const opportunitySchema = z.object({
  name: z.string().min(1, 'Opportunity name is required').max(300),
  company: z.string().optional().or(z.literal('')),
  value: z.string().optional().or(z.literal('')),
  stage: z.string().optional().or(z.literal('')),
  probability: z.string().optional().or(z.literal('')),
  closeDate: z.string().optional().or(z.literal('')),
  owner: z.string().optional().or(z.literal('')),
});

export const dealSchema = z.object({
  name: z.string().min(1, 'Deal name is required').max(300),
  company: z.string().optional().or(z.literal('')),
  value: z.string().optional().or(z.literal('')),
  stage: z.string().optional().or(z.literal('')),
  closeDate: z.string().optional().or(z.literal('')),
  owner: z.string().optional().or(z.literal('')),
});

export const leadSchema = z.object({
  name: z.string().min(1, 'Lead name is required').max(200),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  source: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
  score: z.string().optional().or(z.literal('')),
  owner: z.string().optional().or(z.literal('')),
});

export const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  date: z.string().optional().or(z.literal('')),
  duration: z.string().optional().or(z.literal('')),
  attendees: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(300),
  description: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  priority: z.string().optional().or(z.literal('')),
  budget: z.string().optional().or(z.literal('')),
});

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(300),
  domain: z.string().optional().or(z.literal('')),
  employees: z.string().optional().or(z.literal('')),
  owner: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
});

const SCHEMA_MAP: Record<string, z.ZodObject<any>> = {
  People: personSchema,
  Tasks: taskSchema,
  Notes: noteSchema,
  Opportunities: opportunitySchema,
  Deals: dealSchema,
  Leads: leadSchema,
  Meetings: meetingSchema,
  Projects: projectSchema,
  Companies: companySchema,
};

export function validateForm(
  entityType: string,
  data: Record<string, string>,
  fields: CrudField[],
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const requiredFields = fields.filter((f) => f.required);
  for (const f of requiredFields) {
    if (!data[f.key]?.trim()) {
      errors[f.key] = `${f.label} is required`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const schema = SCHEMA_MAP[entityType];
  if (schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = issue.message;
        }
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
