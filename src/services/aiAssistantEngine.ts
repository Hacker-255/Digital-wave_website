import type { CompanyTableRow } from '../constants/data';

export type AssistantResult = {
  answer: string;
  sources?: string[];
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

function totalEmployees(companies: CompanyTableRow[]): number {
  return companies.reduce((sum, c) => sum + (typeof c.employees === 'number' ? c.employees : 0), 0);
}

function avgEmployees(companies: CompanyTableRow[]): number {
  const withEmpl = companies.filter((c) => typeof c.employees === 'number');
  if (withEmpl.length === 0) return 0;
  return Math.round(withEmpl.reduce((s, c) => s + (c.employees as number), 0) / withEmpl.length);
}

export function askAssistant(input: string, state: CrmState): AssistantResult {
  const text = input.trim();
  const lower = text.toLowerCase();

  // Summarize a specific company
  const summarizeMatch = lower.match(/(?:summarize|summarise|about|explain|tell me about)\s+(.+)/i);
  if (summarizeMatch) {
    const q = summarizeMatch[1].trim();
    const company = findCompany(q, state.companies);
    if (!company) {
      return {
        answer: `I couldn't find a company matching "${q}" in your CRM. Current companies are: ${state.companies.map((c) => c.name).join(', ')}.`,
      };
    }
    const empl = typeof company.employees === 'number' ? company.employees.toLocaleString() : 'N/A';
    return {
      answer: `**${company.name}** — ${company.domain}\n• Created by: ${company.createdBy}\n• Owner: ${company.owner || 'Unassigned'}\n• Employees: ${empl}\n• Added: ${company.createdAt}`,
      sources: [company.name],
    };
  }

  // Compare companies
  const compareMatch = lower.match(/compare\s+(.+?)\s+(?:and|vs|with)\s+(.+)/i);
  if (compareMatch) {
    const a = findCompany(compareMatch[1].trim(), state.companies);
    const b = findCompany(compareMatch[2].trim(), state.companies);
    if (!a || !b) {
      return { answer: `Could not find both companies to compare. Available: ${state.companies.map((c) => c.name).join(', ')}.` };
    }
    const emplA = typeof a.employees === 'number' ? a.employees.toLocaleString() : 'N/A';
    const emplB = typeof b.employees === 'number' ? b.employees.toLocaleString() : 'N/A';
    return {
      answer: `**${a.name}** vs **${b.name}**\n• ${a.name}: ${emplA} employees, added ${a.createdAt}\n• ${b.name}: ${emplB} employees, added ${b.createdAt}\n• Both are in your CRM with ${a.createdBy === b.createdBy ? 'the same creator: ' + a.createdBy : 'different creators'}.`,
      sources: [a.name, b.name],
    };
  }

  // How to improve / recommend
  if (lower.includes('improve') || lower.includes('recommend') || lower.includes('suggestion')) {
    const withEmpl = state.companies.filter((c) => typeof c.employees === 'number');
    const withoutEmpl = state.companies.filter((c) => typeof c.employees !== 'number');
    const suggestions: string[] = [];
    if (withoutEmpl.length > 0) {
      suggestions.push(`Add employee counts for ${withoutEmpl.length} company(-ies) missing this data.`);
    }
    if (state.companies.some((c) => !c.owner)) {
      suggestions.push('Assign owners to unassigned companies for better accountability.');
    }
    if (state.companies.length < 5) {
      suggestions.push('Add more companies to build a richer CRM dataset.');
    }
    if (suggestions.length === 0) {
      suggestions.push('Your CRM data looks complete. Consider setting up workflow automations for lead tracking.');
    }
    return {
      answer: `Here are my recommendations:\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    };
  }

  // Why is lead cold / analysis
  if (lower.includes('why') || lower.includes('analysis') || lower.includes('insight')) {
    const total = state.companies.length;
    const avgEmpl = avgEmployees(state.companies);
    const totalEmpl = totalEmployees(state.companies);
    return {
      answer: `**CRM Analytics**\n• Total companies: ${total}\n• Total employees (known): ${totalEmpl.toLocaleString()}\n• Average employees: ${avgEmpl.toLocaleString()}\n• Companies with owners: ${state.companies.filter((c) => c.owner).length}\n• Recently added: ${state.companies.filter((c) => c.createdAt.includes('day') || c.createdAt.includes('Just')).length}\n\nTip: Track engagement metrics per company to identify cold leads.`,
    };
  }

  // General data summary
  if (lower.includes('summary') || lower.includes('overview') || lower.includes('dashboard')) {
    const total = state.companies.length;
    const withEmpl = state.companies.filter((c) => typeof c.employees === 'number');
    const avgEmpl = avgEmployees(state.companies);
    const names = state.companies.map((c) => c.name).join(', ');
    return {
      answer: `**CRM Overview**\nYou have **${total}** companies in your workspace.\n${names ? `\nCompanies: ${names}` : ''}\n\n• ${withEmpl.length} companies have employee data (avg ${avgEmpl.toLocaleString()} employees)\n• ${state.companies.filter((c) => c.createdBy === 'System').length} added by system, ${state.companies.filter((c) => c.createdBy !== 'System').length} added manually`,
      sources: ['CRM Database'],
    };
  }

  // Default: answer based on what's available
  const total = state.companies.length;
  if (total === 0) {
    return {
      answer: 'Your CRM is empty. Start by adding companies using the "New Company" button or ask the AI Execute assistant to create them for you.',
    };
  }

  return {
    answer: `I see **${total}** companies in your CRM. You can ask me:\n• "Summarize [company name]" — get company details\n• "Compare [A] and [B]" — side-by-side comparison\n• "Overview / Summary" — CRM analytics\n• "Recommendations / Improve" — suggestions to optimize\n• "Why is [company] cold" — lead analysis`,
    sources: state.companies.map((c) => c.name),
  };
}
