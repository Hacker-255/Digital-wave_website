import mongoose, { Schema } from 'mongoose';

const workflowRunSchema = new Schema(
  {
    workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
    status: { type: String, enum: ['success', 'failed'], required: true },
    triggerData: { type: Schema.Types.Mixed, default: {} },
    result: { type: Schema.Types.Mixed, default: {} },
    errorMessage: { type: String, default: '' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const WorkflowRun = mongoose.models.WorkflowRun || mongoose.model('WorkflowRun', workflowRunSchema);
