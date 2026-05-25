import mongoose, { Schema } from 'mongoose';

const workflowVersionSchema = new Schema(
  {
    workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
    versionNumber: { type: Number, required: true },
    snapshot: { type: Object, required: true },
  },
  { timestamps: true },
);

export const WorkflowVersion = mongoose.models.WorkflowVersion || mongoose.model('WorkflowVersion', workflowVersionSchema);
