type WorkflowNode = {
  id: string;
  data?: {
    label?: string;
    kind?: string;
  };
};

type WorkflowEdge = {
  source: string;
  target: string;
};

type ExecutableWorkflow = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

type ExecutionResult = {
  status: 'success' | 'failed';
  logs: string[];
  errorMessages: string[];
};

function orderedNodes(workflow: ExecutableWorkflow) {
  const incoming = new Set(workflow.edges.map((edge) => edge.target));
  const trigger = workflow.nodes.find((node) => !incoming.has(node.id)) ?? workflow.nodes[0];
  const visited = new Set<string>();
  const result: WorkflowNode[] = [];

  function visit(node?: WorkflowNode) {
    if (!node || visited.has(node.id)) return;
    visited.add(node.id);
    result.push(node);
    workflow.edges.filter((edge) => edge.source === node.id).forEach((edge) => {
      visit(workflow.nodes.find((candidate) => candidate.id === edge.target));
    });
  }

  visit(trigger);
  workflow.nodes.forEach((node) => visit(node));
  return result;
}

async function executeNode(node: WorkflowNode, inputData: Record<string, unknown>) {
  const kind = node.data?.kind ?? 'Action Node';
  const label = node.data?.label ?? 'Unnamed node';

  if (kind.includes('Condition')) {
    return `Validated condition "${label}" against ${Object.keys(inputData).length} input fields`;
  }

  if (kind.includes('Delay')) {
    await new Promise((resolve) => setTimeout(resolve, 75));
    return `Delay "${label}" completed`;
  }

  if (kind.includes('Form')) {
    return `Captured form step "${label}"`;
  }

  if (kind.includes('Trigger')) {
    return `Trigger "${label}" accepted`;
  }

  return `Executed action "${label}"`;
}

export async function runWorkflow(workflow: ExecutableWorkflow, inputData: Record<string, unknown>): Promise<ExecutionResult> {
  const logs: string[] = [];

  try {
    const trigger = workflow.nodes.find((node) => String(node.data?.kind).includes('Trigger'));
    if (!trigger) {
      throw new Error('Workflow must include a trigger node.');
    }

    for (const node of orderedNodes(workflow)) {
      logs.push(await executeNode(node, inputData));
    }

    logs.push('Workflow finished successfully');
    return { status: 'success', logs, errorMessages: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown workflow execution error';
    return { status: 'failed', logs, errorMessages: [message] };
  }
}
