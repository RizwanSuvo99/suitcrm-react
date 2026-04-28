import { AccountCreateSchema, AccountUpdateSchema } from '@suitecrm/shared';
import type { ResourceConfig } from '@/components/resource';

export const accountsConfig: ResourceConfig = {
  entityName: 'Account',
  module: 'accounts',
  rowTitle: (r) => String(r.name ?? '(unnamed)'),
  createSchema: AccountCreateSchema,
  updateSchema: AccountUpdateSchema,
  searchPlaceholder: 'Search by name, email, industry…',
  defaults: { name: '' },
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true, span: 1 },
    { name: 'website', label: 'Website', type: 'url', placeholder: 'https://example.com' },
    { name: 'industry', label: 'Industry', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'phone' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'annualRevenue', label: 'Annual Revenue', type: 'currency' },
    { name: 'employees', label: 'Employees', type: 'number' },
    {
      name: 'parentAccountId',
      label: 'Parent Account',
      type: 'relation',
      relationModule: 'accounts',
      relationLabel: (r) => String(r.name ?? r.id),
    },
    { name: 'description', label: 'Description', type: 'textarea', span: 1 },
  ],
  columns: [
    { name: 'name', label: 'Name' },
    { name: 'industry', label: 'Industry' },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email' },
    { name: 'employees', label: 'Employees' },
  ],
  relationships: [
    {
      label: 'Contacts',
      endpoint: 'contacts',
      targetModule: 'contacts',
      columns: [
        { name: 'lastName', label: 'Last Name' },
        { name: 'firstName', label: 'First Name' },
        { name: 'title', label: 'Title' },
        { name: 'email', label: 'Email' },
      ],
    },
    {
      label: 'Opportunities',
      endpoint: 'opportunities',
      targetModule: 'opportunities',
      columns: [
        { name: 'name', label: 'Name' },
        { name: 'salesStage', label: 'Stage' },
        { name: 'amount', label: 'Amount' },
        { name: 'closeDate', label: 'Close date' },
      ],
    },
    {
      label: 'Cases',
      endpoint: 'cases',
      targetModule: 'cases',
      columns: [
        { name: 'caseNumber', label: '#' },
        { name: 'subject', label: 'Subject' },
        { name: 'status', label: 'Status' },
        { name: 'priority', label: 'Priority' },
      ],
    },
  ],
};
