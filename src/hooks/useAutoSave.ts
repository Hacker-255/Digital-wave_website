import { useEffect, useRef, useState } from 'react';
import type { Edge, Node } from 'reactflow';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const clerk = (window as any).Clerk;
  if (clerk?.session) {
    const token = await clerk.session.getToken();
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  }
  return { 'Content-Type': 'application/json' };
}

export function useAutoSave(
  workflowId: string | undefined,
  nodes: Node[],
  edges: Edge[],
  name: string,
  delay = 1200,
) {
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!workflowId) return;
    if (!nodes.length && !edges.length) return;

    setSaving(true);
    timerRef.current = setTimeout(async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/workflows/${workflowId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ nodes, edges, name }),
        });
        if (!res.ok) {
          await res.json().catch(() => {});
        }
      } catch {
        // silently handle network errors
      } finally {
        setSaving(false);
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [workflowId, nodes, edges, name, delay]);

  return saving;
}