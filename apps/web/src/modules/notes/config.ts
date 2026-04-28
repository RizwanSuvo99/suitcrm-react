import { NoteCreateSchema, NoteUpdateSchema, ActivityParentTypeValues } from '@suitecrm/shared';
import type { ResourceConfig } from '@/components/resource';

export const notesConfig: ResourceConfig = {
  entityName: 'Note',
  module: 'notes',
  rowTitle: (r) => String(r.subject ?? '(untitled)'),
  createSchema: NoteCreateSchema,
  updateSchema: NoteUpdateSchema,
  searchPlaceholder: 'Search by subject, body…',
  defaults: { subject: '' },
  fields: [
    { name: 'subject', label: 'Subject', type: 'text', required: true, span: 1 },
    {
      name: 'parentType',
      label: 'Related to type',
      type: 'select',
      options: ActivityParentTypeValues,
    },
    { name: 'parentId', label: 'Related to id', type: 'text', placeholder: 'uuid' },
    { name: 'body', label: 'Body', type: 'textarea', span: 1 },
  ],
  columns: [
    { name: 'subject', label: 'Subject' },
    { name: 'parentType', label: 'Related to' },
    { name: 'createdAt', label: 'Created' },
  ],
};
