import mongoose, { Schema } from 'mongoose';

const triggerSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['contact.created', 'company.created', 'deal.created', 'deal.stage_changed', 'task.completed', 'manual'],
    },
    entity: { type: String, default: '' },
    field: { type: String, default: '' },
    from: { type: Schema.Types.Mixed, default: '' },
    to: { type: Schema.Types.Mixed, default: '' },
  },
  { _id: false },
);

const conditionSchema = new Schema(
  {
    field: { type: String, required: true },
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty', 'greater_than', 'less_than'],
      default: 'equals',
    },
    value: { type: Schema.Types.Mixed, default: '' },
  },
  { _id: false },
);

const actionSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['create_task', 'create_note', 'update_deal_stage', 'assign_record', 'create_activity'],
    },
    targetEntity: { type: String, default: '' },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const workflowSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    trigger: { type: triggerSchema, required: true },
    conditions: { type: [conditionSchema], default: [] },
    actions: { type: [actionSchema], default: [] },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const Workflow = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);
