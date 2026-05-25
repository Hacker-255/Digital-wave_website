import mongoose, { Schema } from 'mongoose';

const workflowSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'draft' },
    nodes: { type: Array, default: [] },
    edges: { type: Array, default: [] },
    version: { type: Number, default: 1 },
    createdBy: { type: String, default: 'Digital Wave user' },
    runs: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Workflow = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);
