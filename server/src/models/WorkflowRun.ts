import mongoose, { Schema } from 'mongoose';

const workflowRunSchema = new Schema(
  {
    workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
    status: { type: String, enum: ['running', 'success', 'failed'], default: 'running' },
    logs: { type: [String], default: [] },
    inputData: { type: Object, default: {} },
    errorMessages: { type: [String], default: [] },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
  },
  { timestamps: true },
);

export const WorkflowRun = mongoose.models.WorkflowRun || mongoose.model('WorkflowRun', workflowRunSchema);
