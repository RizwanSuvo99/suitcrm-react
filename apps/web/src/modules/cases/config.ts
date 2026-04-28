import {
  CaseCreateSchema,
  CaseUpdateSchema,
  CaseStatusValues,
  CasePriorityValues,
} from '@suitecrm/shared';
import type { ResourceConfig } from '@/components/resource';

export const casesConfig: ResourceConfig = {
  entityName: 'Case',
  module: 'cases',
  rowTitle: (r) => `#${String(r.caseNumber ?? '?')} ${String(r.subject ?? '')}`,
  createSchema: CaseCreateSchema,
  updateSchema: CaseUpdateSchema,
  searchPlaceholder: 'Search by subject, description…',
  defaults: { subject: '', status: 'New', priority: 'Medium' },
  fields: [
    { name: 'subject', label: 'Subject', type: 'text', required: true, span: 1 },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: CaseStatusValues,
      required: true,
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: CasePriorityValues,
      required: true,
    },
    {
      name: 'accountId',
      label: 'Account',
      type: 'relation',
      relationModule: 'accounts',
      relationLabel: (r) => String(r.name ?? r.id),
    },
    {
      name: 'contactId',
      label: 'Contact',
      type: 'relation',
      relationModule: 'contacts',
      relationLabel: (r) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim(),
    },
    { name: 'type', label: 'Type', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea', span: 1 },
    { name: 'resolution', label: 'Resolution', type: 'textarea', span: 1 },
  ],
  columns: [
    { name: 'caseNumber', label: '#' },
    { name: 'subject', label: 'Subject' },
    { name: 'status', label: 'Status' },
    { name: 'priority', label: 'Priority' },
    { name: 'createdAt', label: 'Created' },
  ],
};
