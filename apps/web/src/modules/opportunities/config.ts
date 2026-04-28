import {
  OpportunityCreateSchema,
  OpportunityUpdateSchema,
  SalesStageValues,
  LeadSourceValues,
} from '@suitecrm/shared';
import type { ResourceConfig } from '@/components/resource';

export const opportunitiesConfig: ResourceConfig = {
  entityName: 'Opportunity',
  module: 'opportunities',
  rowTitle: (r) => String(r.name ?? '(unnamed)'),
  createSchema: OpportunityCreateSchema,
  updateSchema: OpportunityUpdateSchema,
  searchPlaceholder: 'Search by name…',
  defaults: { name: '', currency: 'USD', salesStage: 'Prospecting' },
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true, span: 1 },
    {
      name: 'accountId',
      label: 'Account',
      type: 'relation',
      relationModule: 'accounts',
      relationLabel: (r) => String(r.name ?? r.id),
    },
    {
      name: 'salesStage',
      label: 'Sales stage',
      type: 'select',
      options: SalesStageValues,
      required: true,
    },
    { name: 'amount', label: 'Amount', type: 'currency' },
    { name: 'currency', label: 'Currency', type: 'text', placeholder: 'USD' },
    { name: 'probability', label: 'Probability (%)', type: 'number' },
    { name: 'closeDate', label: 'Close date', type: 'date' },
    { name: 'leadSource', label: 'Lead source', type: 'select', options: LeadSourceValues },
    { name: 'description', label: 'Description', type: 'textarea', span: 1 },
  ],
  columns: [
    { name: 'name', label: 'Name' },
    { name: 'salesStage', label: 'Stage' },
    { name: 'amount', label: 'Amount' },
    { name: 'currency', label: 'Curr', sort: false },
    { name: 'probability', label: '%' },
    { name: 'closeDate', label: 'Close date' },
  ],
};
