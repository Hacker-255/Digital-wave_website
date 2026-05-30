import { create } from 'zustand';
import {
  initialCompanies, initialPeople, initialTasks, initialNotes,
  initialOpportunities, initialDeals, initialLeads, initialMeetings, initialProjects,
  type CompanyTableRow, type CrmPerson, type CrmTask, type CrmNote,
  type CrmOpportunity, type CrmDeal, type CrmLead, type CrmMeeting, type CrmProject,
} from '../constants/data';

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export type CrmEntity = CrmPerson | CrmTask | CrmNote | CrmOpportunity | CrmDeal | CrmLead | CrmMeeting | CrmProject | CompanyTableRow;

type CrudTarget = {
  type: string;
  item?: CrmEntity;
};

type CrmState = {
  activeModule: string;
  companies: CompanyTableRow[];
  people: CrmPerson[];
  tasks: CrmTask[];
  notes: CrmNote[];
  opportunities: CrmOpportunity[];
  deals: CrmDeal[];
  leads: CrmLead[];
  meetings: CrmMeeting[];
  projects: CrmProject[];
  selectedIds: string[];
  quickAddType: string | null;
  crudModal: CrudTarget | null;
  deleteConfirm: CrudTarget | null;
  crudSaving: boolean;
  crudError: string;
  lastAction: string;

  setActiveModule: (m: string) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelected: (id: string) => void;
  setQuickAddType: (t: string | null) => void;
  setCrudModal: (t: CrudTarget | null) => void;
  setDeleteConfirm: (t: CrudTarget | null) => void;
  setCrudSaving: (s: boolean) => void;
  setCrudError: (e: string) => void;
  setLastAction: (a: string) => void;

  addEntity: (type: string, entity: CrmEntity) => void;
  updateEntity: (type: string, id: string, entity: CrmEntity) => void;
  removeEntity: (type: string, id: string) => void;
  duplicateEntity: (type: string, item: CrmEntity) => void;
  getEntityArray: (type: string) => CrmEntity[];
};

export const useCrmStore = create<CrmState>((set, get) => ({
  activeModule: 'Companies',
  companies: initialCompanies,
  people: initialPeople,
  tasks: initialTasks,
  notes: initialNotes,
  opportunities: initialOpportunities,
  deals: initialDeals,
  leads: initialLeads,
  meetings: initialMeetings,
  projects: initialProjects,
  selectedIds: [],
  quickAddType: null,
  crudModal: null,
  deleteConfirm: null,
  crudSaving: false,
  crudError: '',
  lastAction: 'Ready',

  setActiveModule: (m) => set({ activeModule: m }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelected: (id) => set((s) => ({
    selectedIds: s.selectedIds.includes(id) ? s.selectedIds.filter((i) => i !== id) : [...s.selectedIds, id],
  })),
  setQuickAddType: (t) => set({ quickAddType: t }),
  setCrudModal: (t) => set({ crudModal: t }),
  setDeleteConfirm: (t) => set({ deleteConfirm: t }),
  setCrudSaving: (s) => set({ crudSaving: s }),
  setCrudError: (e) => set({ crudError: e }),
  setLastAction: (a) => set({ lastAction: a }),

  addEntity: (type, entity) => {
    switch (type) {
      case 'People': set((s) => ({ people: [entity as CrmPerson, ...s.people] })); break;
      case 'Tasks': set((s) => ({ tasks: [entity as CrmTask, ...s.tasks] })); break;
      case 'Notes': set((s) => ({ notes: [entity as CrmNote, ...s.notes] })); break;
      case 'Opportunities': set((s) => ({ opportunities: [entity as CrmOpportunity, ...s.opportunities] })); break;
      case 'Deals': set((s) => ({ deals: [entity as CrmDeal, ...s.deals] })); break;
      case 'Leads': set((s) => ({ leads: [entity as CrmLead, ...s.leads] })); break;
      case 'Meetings': set((s) => ({ meetings: [entity as CrmMeeting, ...s.meetings] })); break;
      case 'Projects': set((s) => ({ projects: [entity as CrmProject, ...s.projects] })); break;
      case 'Companies': set((s) => ({ companies: [entity as CompanyTableRow, ...s.companies] })); break;
    }
  },

  updateEntity: (type, id, entity) => {
    const updater = (items: CrmEntity[]) => items.map((i) => ((i as any).id === id ? entity : i));
    switch (type) {
      case 'People': set((s) => ({ people: updater(s.people) as CrmPerson[] })); break;
      case 'Tasks': set((s) => ({ tasks: updater(s.tasks) as CrmTask[] })); break;
      case 'Notes': set((s) => ({ notes: updater(s.notes) as CrmNote[] })); break;
      case 'Opportunities': set((s) => ({ opportunities: updater(s.opportunities) as CrmOpportunity[] })); break;
      case 'Deals': set((s) => ({ deals: updater(s.deals) as CrmDeal[] })); break;
      case 'Leads': set((s) => ({ leads: updater(s.leads) as CrmLead[] })); break;
      case 'Meetings': set((s) => ({ meetings: updater(s.meetings) as CrmMeeting[] })); break;
      case 'Projects': set((s) => ({ projects: updater(s.projects) as CrmProject[] })); break;
      case 'Companies': set((s) => ({ companies: updater(s.companies) as CompanyTableRow[] })); break;
    }
  },

  removeEntity: (type, id) => {
    const filterer = (items: CrmEntity[]) => items.filter((i) => (i as any).id !== id);
    switch (type) {
      case 'People': set((s) => ({ people: filterer(s.people) as CrmPerson[] })); break;
      case 'Tasks': set((s) => ({ tasks: filterer(s.tasks) as CrmTask[] })); break;
      case 'Notes': set((s) => ({ notes: filterer(s.notes) as CrmNote[] })); break;
      case 'Opportunities': set((s) => ({ opportunities: filterer(s.opportunities) as CrmOpportunity[] })); break;
      case 'Deals': set((s) => ({ deals: filterer(s.deals) as CrmDeal[] })); break;
      case 'Leads': set((s) => ({ leads: filterer(s.leads) as CrmLead[] })); break;
      case 'Meetings': set((s) => ({ meetings: filterer(s.meetings) as CrmMeeting[] })); break;
      case 'Projects': set((s) => ({ projects: filterer(s.projects) as CrmProject[] })); break;
      case 'Companies': set((s) => ({ companies: filterer(s.companies) as CompanyTableRow[] })); break;
    }
  },

  duplicateEntity: (type, item) => {
    const copy = { ...item, id: genId() };
    get().addEntity(type, copy);
  },

  getEntityArray: (type) => {
    const state = get();
    switch (type) {
      case 'People': return state.people;
      case 'Tasks': return state.tasks;
      case 'Notes': return state.notes;
      case 'Opportunities': return state.opportunities;
      case 'Deals': return state.deals;
      case 'Leads': return state.leads;
      case 'Meetings': return state.meetings;
      case 'Projects': return state.projects;
      case 'Companies': return state.companies;
      default: return [];
    }
  },
}));
