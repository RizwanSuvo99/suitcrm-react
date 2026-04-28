import { ContactCreateSchema, ContactUpdateSchema, LeadSourceValues } from '@suitecrm/shared';
import type { ResourceConfig } from '@/components/resource';

export const contactsConfig: ResourceConfig = {
  entityName: 'Contact',
  module: 'contacts',
  rowTitle: (r) => `${String(r.firstName ?? '')} ${String(r.lastName ?? '')}`.trim() || '(unnamed)',
  createSchema: ContactCreateSchema,
  updateSchema: ContactUpdateSchema,
  searchPlaceholder: 'Search by name, email, phone…',
  defaults: { firstName: '', lastName: '' },
  fields: [
    { name: 'firstName', label: 'First name', type: 'text', required: true },
    { name: 'lastName', label: 'Last name', type: 'text', required: true },
    { name: 'title', label: 'Title', type: 'text' },
    {
      name: 'accountId',
      label: 'Account',
      type: 'relation',
      relationModule: 'accounts',
      relationLabel: (r) => String(r.name ?? r.id),
    },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phoneWork', label: 'Phone (work)', type: 'phone' },
    { name: 'phoneMobile', label: 'Phone (mobile)', type: 'phone' },
    {
      name: 'leadSource',
      label: 'Lead source',
      type: 'select',
      options: LeadSourceValues,
    },
    { name: 'doNotCall', label: 'Do not call', type: 'checkbox' },
    { name: 'description', label: 'Description', type: 'textarea', span: 1 },
  ],
  columns: [
    { name: 'lastName', label: 'Last name' },
    { name: 'firstName', label: 'First name' },
    { name: 'title', label: 'Title' },
    { name: 'email', label: 'Email' },
    { name: 'phoneWork', label: 'Phone' },
  ],
  relationships: [
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
