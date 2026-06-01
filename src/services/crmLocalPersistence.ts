import type {
  CompanyTableRow,
  CrmDeal,
  CrmLead,
  CrmMeeting,
  CrmNote,
  CrmOpportunity,
  CrmPerson,
  CrmProject,
  CrmTask,
  CrmFile,
} from '../constants/data';

const STORAGE_KEY = 'digital-wave-crm-records';

export interface LocalCrmSnapshot {
  companies?: CompanyTableRow[];
  People?: CrmPerson[];
  Tasks?: CrmTask[];
  Notes?: CrmNote[];
  Opportunities?: CrmOpportunity[];
  Deals?: CrmDeal[];
  Leads?: CrmLead[];
  Meetings?: CrmMeeting[];
  Projects?: CrmProject[];
  Files?: CrmFile[];
  savedAt?: string;
}

export function loadLocalCrmSnapshot(): LocalCrmSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as LocalCrmSnapshot : {};
  } catch {
    return {};
  }
}

export function saveLocalCrmSnapshot(snapshot: LocalCrmSnapshot) {
  const previous = loadLocalCrmSnapshot();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...previous,
    ...snapshot,
    savedAt: new Date().toISOString(),
  }));
}

export function mergeById<T extends { id: string }>(primary: T[], fallback: T[]) {
  const seen = new Set<string>();
  const merged: T[] = [];
  for (const item of [...primary, ...fallback]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return merged;
}
