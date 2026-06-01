import type { CompanyTableRow } from '../constants/data';
import type { Role } from './permissions';
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase';

export type ProfileRecord = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  role: Role;
  created_at?: string;
  updated_at?: string;
};

type CompanyRecord = {
  id: string;
  name: string;
  domain: string;
  created_by: string;
  owner: string;
  created_at_label: string;
  employees: number | null;
  linkedin: string;
  color: string;
  icon: string;
};

function fromCompanyRecord(record: CompanyRecord): CompanyTableRow {
  return {
    id: record.id,
    name: record.name,
    domain: record.domain,
    createdBy: record.created_by,
    owner: record.owner,
    createdAt: record.created_at_label,
    employees: record.employees ?? '',
    linkedin: record.linkedin,
    color: record.color,
    icon: record.icon,
  };
}

function toCompanyRecord(company: CompanyTableRow): CompanyRecord {
  return {
    id: company.id,
    name: company.name,
    domain: company.domain,
    created_by: company.createdBy,
    owner: company.owner,
    created_at_label: company.createdAt,
    employees: typeof company.employees === 'number' ? company.employees : null,
    linkedin: company.linkedin,
    color: company.color,
    icon: company.icon,
  };
}

export async function upsertProfile(profile: ProfileRecord) {
  if (!isSupabaseConfigured) return null;
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      avatar_url: profile.avatar_url ?? null,
      role: profile.role,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data as ProfileRecord;
}

export async function listProfiles() {
  if (!isSupabaseConfigured) return [];
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ProfileRecord[];
}

export async function listCompanies() {
  if (!isSupabaseConfigured) return null;
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('inserted_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as CompanyRecord[]).map(fromCompanyRecord);
}

export async function saveCompanies(companies: CompanyTableRow[]) {
  if (!isSupabaseConfigured) return;
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('companies')
    .upsert(companies.map(toCompanyRecord), { onConflict: 'id' });

  if (error) throw error;
}

export async function deleteCompanies(ids: string[]) {
  if (!isSupabaseConfigured || ids.length === 0) return;
  const supabase = requireSupabase();
  const { error } = await supabase.from('companies').delete().in('id', ids);
  if (error) throw error;
}

export async function listModuleRecords<T extends { id: string }>(module: string) {
  if (!isSupabaseConfigured) return null;
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('crm_records')
    .select('record_id,data')
    .eq('module', module)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((record) => ({
    id: record.record_id,
    ...(record.data as Omit<T, 'id'>),
  })) as T[];
}

export async function saveModuleRecords<T extends { id: string }>(module: string, records: T[]) {
  if (!isSupabaseConfigured) return;
  const supabase = requireSupabase();
  const rows = records.map(({ id, ...data }) => ({
    module,
    record_id: id,
    data,
    updated_at: new Date().toISOString(),
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from('crm_records')
      .upsert(rows, { onConflict: 'module,record_id' });
    if (error) throw error;
  }

  const ids = records.map((record) => record.id);
  let deleteQuery = supabase.from('crm_records').delete().eq('module', module);
  if (ids.length > 0) deleteQuery = deleteQuery.not('record_id', 'in', `(${ids.map((id) => `"${id}"`).join(',')})`);
  const { error: deleteError } = await deleteQuery;
  if (deleteError) throw deleteError;
}

export async function listAllModuleRecords<T extends { id: string }>(modules: string[]) {
  const entries = await Promise.all(modules.map(async (module) => [module, await listModuleRecords<T>(module)] as const));
  return Object.fromEntries(entries) as Record<string, T[] | null>;
}

export async function saveAllModuleRecords(recordsByModule: Record<string, Array<{ id: string }>>) {
  await Promise.all(Object.entries(recordsByModule).map(([module, records]) => saveModuleRecords(module, records)));
}
