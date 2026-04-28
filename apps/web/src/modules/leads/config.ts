import { LeadCreateSchema, LeadUpdateSchema, LeadSourceValues, LeadStatusValues } from '@suitecrm/shared';
import type { ResourceConfig } from '@/components/resource';

export const leadsConfig: ResourceConfig = {
  entityName: 'Lead',
  module: 'leads',
  rowTitle: (r) => `${String(r.firstName ?? '')} ${String(r.lastName ?? '')}`.trim() || '(unnamed)',
  createSchema: LeadCreateSchema,
  updateSchema: LeadUpdateSchema,
  searchPlaceholder: 'Search by name, company, email…',
  defaults: { firstName: '', lastName: '', status: 'New' },
  fields: [
    { name: 'firstName', label: 'First name', type: 'text', required: true },
    { name: 'lastName', label: 'Last name', type: 'text', required: true },
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'company', label: 'Company', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'phone' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: LeadStatusValues,
      required: true,
    },
    { name: 'leadSource', label: 'Lead source', type: 'select', options: LeadSourceValues },
    { name: 'description', label: 'Description', type: 'textarea', span: 1 },
  ],
  columns: [
    { name: 'lastName', label: 'Last name' },
    { name: 'firstName', label: 'First name' },
    { name: 'company', label: 'Company' },
    { name: 'status', label: 'Status' },
    { name: 'email', label: 'Email' },
    { name: 'leadSource', label: 'Source' },
  ],
};
