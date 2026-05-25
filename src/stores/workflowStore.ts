import { create } from 'zustand';
import type { Workflow, WorkflowStatus } from '../lib/types';
import { api } from '../lib/api';

type WorkflowState = {
  workflows: Workflow[];
  selectedWorkflow?: Workflow;
  filter: WorkflowStatus | 'all';
  loading: boolean;
  load: () => Promise<void>;
  select: (workflow: Workflow) => void;
  setFilter: (filter: WorkflowStatus | 'all') => void;
  upsertWorkflow: (workflow: Workflow) => void;
  removeWorkflow: (id: string) => void;
};

export const useWorkflowStore = create<WorkflowState>((set) => ({
  workflows: [],
  filter: 'all',
  loading: false,
  async load() {
    set({ loading: true });
    const workflows = await api.listWorkflows();
    set({ workflows, selectedWorkflow: workflows[0], loading: false });
  },
  select(workflow) {
    set({ selectedWorkflow: workflow });
  },
  setFilter(filter) {
    set({ filter });
  },
  upsertWorkflow(workflow) {
    set((state) => ({
      workflows: state.workflows.some((item) => item._id === workflow._id)
        ? state.workflows.map((item) => (item._id === workflow._id ? workflow : item))
        : [workflow, ...state.workflows],
      selectedWorkflow: workflow,
    }));
  },
  removeWorkflow(id) {
    set((state) => ({
      workflows: state.workflows.filter((item) => item._id !== id),
      selectedWorkflow: state.selectedWorkflow?._id === id ? state.workflows[0] : state.selectedWorkflow,
    }));
  },
}));
