import {
  CallCreateSchema,
  CallUpdateSchema,
  CallStatusValues,
  CallDirectionValues,
  ActivityParentTypeValues,
} from '@suitecrm/shared';
import type { ResourceConfig } from '@/components/resource';

export const callsConfig: ResourceConfig = {
  entityName: 'Call',
  module: 'calls',
  rowTitle: (r) => String(r.subject ?? '(no subject)'),
  createSchema: CallCreateSchema,
  updateSchema: CallUpdateSchema,
  searchPlaceholder: 'Search by subject…',
  defaults: { subject: '', status: 'Planned', direction: 'Outbound' },
  fields: [
    { name: 'subject', label: 'Subject', type: 'text', required: true, span: 1 },
    { name: 'status', label: 'Status', type: 'select', options: CallStatusValues, required: true },
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: CallDirectionValues,
      required: true,
    },
    { name: 'startsAt', label: 'Starts at', type: 'datetime' },
    { name: 'durationMinutes', label: 'Duration (min)', type: 'number' },
    {
      name: 'parentType',
      label: 'Related to type',
      type: 'select',
      options: ActivityParentTypeValues,
    },
    { name: 'parentId', label: 'Related to id', type: 'text', placeholder: 'uuid' },
    { name: 'description', label: 'Description', type: 'textarea', span: 1 },
  ],
  columns: [
    { name: 'subject', label: 'Subject' },
    { name: 'direction', label: 'Direction' },
    { name: 'status', label: 'Status' },
    { name: 'startsAt', label: 'Starts at' },
    { name: 'durationMinutes', label: 'Duration' },
  ],
};
