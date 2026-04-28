import {
  MeetingCreateSchema,
  MeetingUpdateSchema,
  MeetingStatusValues,
  ActivityParentTypeValues,
} from '@suitecrm/shared';
import type { ResourceConfig } from '@/components/resource';

export const meetingsConfig: ResourceConfig = {
  entityName: 'Meeting',
  module: 'meetings',
  rowTitle: (r) => String(r.subject ?? '(no subject)'),
  createSchema: MeetingCreateSchema,
  updateSchema: MeetingUpdateSchema,
  searchPlaceholder: 'Search by subject, location…',
  defaults: { subject: '', status: 'Planned' },
  fields: [
    { name: 'subject', label: 'Subject', type: 'text', required: true, span: 1 },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: MeetingStatusValues,
      required: true,
    },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'startsAt', label: 'Starts at', type: 'datetime' },
    { name: 'endsAt', label: 'Ends at', type: 'datetime' },
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
    { name: 'status', label: 'Status' },
    { name: 'location', label: 'Location' },
    { name: 'startsAt', label: 'Starts at' },
    { name: 'endsAt', label: 'Ends at' },
  ],
};
