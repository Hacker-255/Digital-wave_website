import { Building2, BriefcaseBusiness, GitBranch, Linkedin, Users } from 'lucide-react';
import type { CompanyTableRow } from '../../constants/data';
import { TableActions } from './TableActions';

interface CompanyTableProps {
  companies: CompanyTableRow[];
  selectedIds: string[];
  allSelected: boolean;
  compactRows: boolean;
  hiddenLinkedin: boolean;
  toggleSelected: (id: string) => void;
  toggleAll: () => void;
  onEdit?: (company: CompanyTableRow) => void;
  onDelete?: (company: CompanyTableRow) => void;
  onDuplicate?: (company: CompanyTableRow) => void;
}

export function CompanyTable({
  companies, selectedIds, allSelected, compactRows, hiddenLinkedin,
  toggleSelected, toggleAll, onEdit, onDelete, onDuplicate,
}: CompanyTableProps) {
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
          <span className="company-name">
            <i className={company.color}>{company.icon}</i>
            {company.name}
          </span>
          <span><em>{company.domain}</em></span>
          <span>{company.createdBy === 'System' ? '🛡️ System' : '📚 ' + company.createdBy}</span>
          <span>{company.owner}</span>
          <span>{company.createdAt}</span>
          <span>{typeof company.employees === 'number' ? company.employees.toLocaleString() : ''}</span>
          {!hiddenLinkedin && <span style={{ color: 'var(--crm-text-muted)' }}>{company.linkedin}</span>}
          <span className="flex justify-end">
            {(onEdit || onDelete || onDuplicate) && (
              <TableActions onAction={(action) => {
                switch (action) {
                  case 'edit': onEdit?.(company); break;
                  case 'delete': onDelete?.(company); break;
                  case 'duplicate': onDuplicate?.(company); break;
                  case 'view': break;
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
