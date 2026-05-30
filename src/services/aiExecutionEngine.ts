import type { CompanyTableRow } from '../constants/data';

export type ExecuteResult = {
  success: boolean;
  action: string;
  message: string;
  data?: unknown;
  needsConfirmation?: boolean;
};

type CrmState = {
  companies: CompanyTableRow[];
  selectedIds: string[];
};

function findCompany(query: string, companies: CompanyTableRow[]): CompanyTableRow | undefined {
  const q = query.toLowerCase();
  return companies.find(
    (c) => c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q),
  );
}

function generateId(): string {
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function parseAndExecute(input: string, state: CrmState): ExecuteResult {
  const text = input.trim();
  const lower = text.toLowerCase();

  // create company
  const createMatch = lower.match(/^(?:create|add|new)\s+(?:company|co)\s+(.+)$/i);
  if (createMatch) {
    const name = createMatch[1].trim();
    const existing = state.companies.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      return { success: false, action: 'create_company', message: `Company "${name}" already exists.` };
    }
    const newCompany: CompanyTableRow = {
      id: generateId(),
      name,
      domain: `${name.toLowerCase().replace(/\s+/g, '')}.com`,
      createdBy: 'AI Execute',
      owner: 'AI Execute',
      createdAt: 'Just now',
      employees: '',
      linkedin: '',
      color: 'bg-blue-600',
      icon: name.charAt(0).toUpperCase(),
    };
    return {
      success: true,
      action: 'create_company',
      message: `Created company "${name}".`,
      data: newCompany,
    };
  }

  // delete company
  const deleteMatch = lower.match(/^(?:delete|remove)\s+(?:company\s+)?(.+)$/i);
  if (deleteMatch) {
    const target = deleteMatch[1].trim();
    const company = findCompany(target, state.companies);
    if (!company) {
      return { success: false, action: 'delete_company', message: `Company "${target}" not found.` };
    }
    return {
      success: true,
      action: 'delete_company',
      message: `Deleted company "${company.name}".`,
      data: { id: company.id },
      needsConfirmation: true,
    };
  }

  // create task
  const createTaskMatch = lower.match(/^(?:create|add|new)\s+(?:task)\s+(.+)$/i);
  if (createTaskMatch) {
    const task = createTaskMatch[1].trim();
    return {
      success: true,
      action: 'create_task',
      message: `Created task: "${task}".`,
      data: { task, priority: 'medium' },
    };
  }

  // assign owner
  const assignMatch = lower.match(/^assign\s+(.+)\s+to\s+(.+)$/i);
  if (assignMatch) {
    const target = assignMatch[1].trim();
    const owner = assignMatch[2].trim();
    const company = findCompany(target, state.companies);
    if (!company) {
      return { success: false, action: 'assign_owner', message: `Company "${target}" not found.` };
    }
    return {
      success: true,
      action: 'assign_owner',
      message: `Assigned "${company.name}" to ${owner}.`,
      data: { companyId: company.id, owner },
    };
  }

  // filter
  if (lower.includes('filter') && lower.includes('employee')) {
    const numMatch = lower.match(/(\d+)/);
    const threshold = numMatch ? parseInt(numMatch[1]) : 1000;
    return {
      success: true,
      action: 'filter',
      message: `Filter applied: employees over ${threshold}.`,
      data: { employeeFilter: threshold },
    };
  }

  // count
  if (lower.includes('count') || lower.includes('how many')) {
    const total = state.companies.length;
    const selected = state.selectedIds.length;
    return {
      success: true,
      action: 'count',
      message: `Total: ${total} companies${selected ? `, ${selected} selected.` : '.'}`,
      data: { total, selected },
    };
  }

  // export
  if (lower.includes('export')) {
    return {
      success: true,
      action: 'export',
      message: 'Exporting companies view.',
    };
  }

  // list/show
  if (lower.includes('list') || lower.includes('show')) {
    const names = state.companies.map((c) => c.name).join(', ');
    return {
      success: true,
      action: 'list',
      message: `Companies: ${names || 'none'}.`,
      data: state.companies,
    };
  }

  // unknown command
  return {
    success: false,
    action: 'unknown',
    message: `Unknown command. Try: "create company X", "delete company X", "assign X to Y", "count", "list", "filter".`,
  };
}
