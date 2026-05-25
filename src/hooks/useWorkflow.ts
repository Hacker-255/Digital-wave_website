import { useEffect } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';

export function useWorkflow() {
  const store = useWorkflowStore();

  useEffect(() => {
    if (store.workflows.length === 0 && !store.loading) {
      void store.load();
    }
  }, [store]);

  return store;
}
