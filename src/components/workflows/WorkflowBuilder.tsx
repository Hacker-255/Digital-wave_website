import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from 'react-flow-renderer';
import { Clock, Diamond, FileText, MousePointerClick, Plus, Save, Send, Split, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import type { Workflow } from '../../lib/types';
import 'react-flow-renderer/dist/style.css';

const nodeLibrary = [
  { type: 'Trigger Node', label: 'Manual Trigger', icon: MousePointerClick, color: '#00d9ff' },
  { type: 'Trigger Node', label: 'Lead Created', icon: Zap, color: '#00d9ff' },
  { type: 'Trigger Node', label: 'Company Created', icon: Zap, color: '#00d9ff' },
  { type: 'Trigger Node', label: 'Opportunity Created', icon: Zap, color: '#00d9ff' },
  { type: 'Trigger Node', label: 'Task Completed', icon: Zap, color: '#00d9ff' },
  { type: 'Action Node', label: 'Create Lead', icon: Plus, color: '#0877ff' },
  { type: 'Action Node', label: 'Create Company', icon: Plus, color: '#0877ff' },
  { type: 'Action Node', label: 'Create Task', icon: Plus, color: '#0877ff' },
  { type: 'Action Node', label: 'Assign User', icon: Send, color: '#0877ff' },
  { type: 'Action Node', label: 'Change Status', icon: Send, color: '#0877ff' },
  { type: 'Action Node', label: 'Send Notification', icon: Send, color: '#0877ff' },
  { type: 'Action Node', label: 'Add Tag', icon: Send, color: '#0877ff' },
  { type: 'Action Node', label: 'Update Record', icon: Send, color: '#0877ff' },
  { type: 'Condition Node', label: 'Condition', icon: Diamond, color: '#f7c948' },
  { type: 'Delay Node', label: 'Delay', icon: Clock, color: '#a78bfa' },
  { type: 'Form Node', label: 'Form', icon: FileText, color: '#34d399' },
];

type WorkflowBuilderProps = {
  workflow?: Workflow;
  onSave: (workflow: Workflow) => void;
};

export function WorkflowBuilder({ workflow, onSave }: WorkflowBuilderProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.edges ?? []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [name, setName] = useState(workflow?.name ?? 'Untitled workflow');

  useEffect(() => {
    setNodes(workflow?.nodes ?? []);
    setEdges(workflow?.edges ?? []);
    setName(workflow?.name ?? 'Untitled workflow');
  }, [workflow, setEdges, setNodes]);

  const onConnect = useCallback(
    (connection: Edge | Connection) => setEdges((items) => addEdge({ ...connection, animated: true, style: { stroke: '#00d9ff' } }, items)),
    [setEdges],
  );

  const validation = useMemo(() => {
    const hasTrigger = nodes.some((node) => String(node.data?.kind).includes('Trigger'));
    const orphaned = nodes.filter((node) => !edges.some((edge) => edge.source === node.id || edge.target === node.id));
    return { hasTrigger, orphaned };
  }, [edges, nodes]);

  function buildNode(item: (typeof nodeLibrary)[number], position?: { x: number; y: number }) {
    const node: Node = {
      id: crypto.randomUUID(),
      type: nodes.length === 0 ? 'input' : 'default',
      position: position ?? { x: 140 + nodes.length * 55, y: 120 + (nodes.length % 4) * 70 },
      data: { label: item.label, kind: item.type },
      style: {
        border: `1px solid ${item.color}`,
        background: 'rgba(7, 14, 27, .96)',
        color: '#e5f8ff',
        boxShadow: `0 0 22px ${item.color}33`,
      },
    };
    return node;
  }

  function addNode(item: (typeof nodeLibrary)[number], position?: { x: number; y: number }) {
    setNodes((items) => [...items, buildNode(item, position)]);
  }

  function onDragStart(event: DragEvent<HTMLButtonElement>, item: (typeof nodeLibrary)[number]) {
    event.dataTransfer.setData('application/digital-wave-node', JSON.stringify({ type: item.type, label: item.label }));
    event.dataTransfer.effectAllowed = 'move';
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const payload = event.dataTransfer.getData('application/digital-wave-node');
    if (!payload || !canvasRef.current) return;
    const dropped = JSON.parse(payload) as { type: string; label: string };
    const item = nodeLibrary.find((node) => node.type === dropped.type && node.label === dropped.label);
    if (!item) return;
    const bounds = canvasRef.current.getBoundingClientRect();
    addNode(item, {
      x: event.clientX - bounds.left - 90,
      y: event.clientY - bounds.top - 35,
    });
    toast.success(`${item.label} node added`);
  }

  function deleteSelectedNode() {
    if (!selectedNode) return;
    setNodes((items) => items.filter((node) => node.id !== selectedNode.id));
    setEdges((items) => items.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNode(null);
    toast.success('Node deleted');
  }

  async function saveWorkflow() {
    if (!workflow) return;

    const next: Workflow = {
      ...workflow,
      name,
      nodes,
      edges,
      version: workflow.version + 1,
      updatedAt: new Date().toISOString(),
    };

    onSave(next);
    void api.updateWorkflow(workflow._id, next).catch(() => undefined);
    toast.success('Workflow saved and versioned');
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (workflow && (nodes.length || edges.length)) {
        void api.updateWorkflow(workflow._id, { nodes, edges, name }).catch(() => undefined);
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [edges, name, nodes, workflow]);

  if (!workflow) {
    return <div className="empty-state">Create a workflow to open the automation canvas.</div>;
  }

  return (
    <div className="builder-grid">
      <aside className="node-library">
        <div className="panel-heading">
          <Split size={17} />
          <span>Node library</span>
        </div>
        <div className="space-y-2">
          {nodeLibrary.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.type}-${item.label}`}
                className="node-library-item"
                draggable
                onDragStart={(event) => onDragStart(event, item)}
                onClick={() => addNode(item)}
                type="button"
              >
                <Icon size={16} style={{ color: item.color }} />
                <span>{item.label}</span>
                <small>{item.type.replace(' Node', '')}</small>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="canvas-panel">
        <div className="canvas-toolbar">
          <input value={name} onChange={(event) => setName(event.target.value)} aria-label="Workflow name" />
          <div className="validation">
            <span className={validation.hasTrigger ? 'ok' : 'warn'}>{validation.hasTrigger ? 'Trigger valid' : 'Needs trigger'}</span>
            <span>{validation.orphaned.length} orphan nodes</span>
          </div>
          <button className="btn-primary" onClick={saveWorkflow}><Save size={15} /> Save</button>
        </div>
        <div className="canvas-wrap" ref={canvasRef} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            fitView
          >
            <MiniMap nodeColor={() => '#00d9ff'} />
            <Controls />
            <Background gap={24} color="#18324b" />
          </ReactFlow>
        </div>
      </div>

      <aside className="edit-panel">
        <div className="panel-heading">
          <Zap size={17} />
          <span>Node editor</span>
        </div>
        {selectedNode ? (
          <div className="space-y-4">
            <label>
              Label
              <input
                value={String(selectedNode.data?.label ?? '')}
                onChange={(event) => {
                  const value = event.target.value;
                  setNodes((items) => items.map((node) => node.id === selectedNode.id ? { ...node, data: { ...node.data, label: value } } : node));
                  setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: value } });
                }}
              />
            </label>
            <div className="detail-box">
              <b>{String(selectedNode.data?.kind ?? 'Workflow node')}</b>
              <span>ID: {selectedNode.id.slice(0, 8)}</span>
              <span>Connections: {edges.filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id).length}</span>
            </div>
            <button className="btn-secondary w-full" onClick={deleteSelectedNode} type="button"><Trash2 size={15} /> Delete node</button>
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-400">Select a node to edit its label, validation state, and future execution settings.</p>
        )}
      </aside>
    </div>
  );
}
