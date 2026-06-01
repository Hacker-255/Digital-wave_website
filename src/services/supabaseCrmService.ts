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
