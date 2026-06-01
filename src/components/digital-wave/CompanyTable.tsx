import { Building2, BriefcaseBusiness, Copy, Eye, FileEdit, GitBranch, Linkedin, Trash2, Users } from 'lucide-react';
import type { CompanyTableRow } from '../../constants/data';
import { TableActions } from './TableActions';
import type { TableAction } from './TableActions';

interface CompanyTableProps {
  companies: CompanyTableRow[];
  selectedIds: string[];
  allSelected: boolean;
  compactRows: boolean;
  hiddenLinkedin: boolean;
  toggleSelected: (id: string) => void;
  toggleAll: () => void;
  onEdit?: (company: CompanyTableRow) => void;
  onView?: (company: CompanyTableRow) => void;
  onDelete?: (company: CompanyTableRow) => void;
  onDuplicate?: (company: CompanyTableRow) => void;
}

export function CompanyTable({
  companies, selectedIds, allSelected, compactRows, hiddenLinkedin,
  toggleSelected, toggleAll, onEdit, onView, onDelete, onDuplicate,
}: CompanyTableProps) {
  const rowActions: TableAction[] = [
    ...(onView ? [{ key: 'view', label: 'View', icon: Eye }] : []),
    ...(onEdit ? [{ key: 'edit', label: 'Edit', icon: FileEdit }] : []),
    ...(onDuplicate ? [{ key: 'duplicate', label: 'Duplicate', icon: Copy }] : []),
    ...(onDelete ? [{ key: 'delete', label: 'Delete', icon: Trash2, danger: true }] : []),
  ];

  return (
    <div className={compactRows ? 'digital-wave-table compact' : 'digital-wave-table'}>
      <div className="digital-wave-row header">
        <button className={allSelected ? 'digital-wave-check checked' : 'digital-wave-check'} onClick={toggleAll} aria-label="Select all" />
        <span><Building2 size={13} /> Name</span>
        <span><GitBranch size={12} /> Domain</span>
        <span><BriefcaseBusiness size={12} /> Created by</span>
        <span><Users size={12} /> Owner</span>
        <span><span className="text-[10px]">▣</span> Created</span>
        <span><Users size={12} /> Employees</span>
        {!hiddenLinkedin && <span><Linkedin size={12} /> LinkedIn</span>}
        <span></span>
      </div>
      {companies.map((company) => (
        <div className="digital-wave-row" key={company.id}>
          <button
            className={selectedIds.includes(company.id) ? 'digital-wave-check checked' : 'digital-wave-check'}
            onClick={() => toggleSelected(company.id)}
            aria-label={`Select ${company.name}`}
          />
          <button className="company-name flex h-full items-center gap-1.5 border-l px-2 text-left" style={{ borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} onClick={() => onView?.(company)} type="button">
            <i className={company.color}>{company.icon}</i>
            {company.name}
          </button>
          <span><em>{company.domain}</em></span>
          <span>{company.createdBy === 'System' ? '🛡️ System' : '📚 ' + company.createdBy}</span>
          <span>{company.owner}</span>
          <span>{company.createdAt}</span>
          <span>{typeof company.employees === 'number' ? company.employees.toLocaleString() : ''}</span>
          {!hiddenLinkedin && <span style={{ color: 'var(--crm-text-muted)' }}>{company.linkedin}</span>}
          <span className="flex justify-end gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(company)}
                className="table-action-btn company-edit-btn"
                type="button"
                title={`Edit ${company.name}`}
                aria-label={`Edit ${company.name}`}
              >
                <FileEdit size={13} />
                <span>Edit</span>
              </button>
            )}
            {rowActions.length > 0 && (
              <TableActions actions={rowActions} onAction={(action) => {
                switch (action) {
                  case 'edit': onEdit?.(company); break;
                  case 'delete': onDelete?.(company); break;
                  case 'duplicate': onDuplicate?.(company); break;
                  case 'view': onView?.(company); break;
                }
              }} />
            )}
          </span>
        </div>
      ))}
      {companies.length === 0 && (
        <div className="flex items-center justify-center py-8 text-xs" style={{ color: 'var(--crm-text-muted)' }}>No companies found</div>
      )}
    </div>
  );
}
