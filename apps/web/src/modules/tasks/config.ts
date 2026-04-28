import {
  TaskCreateSchema,
  TaskUpdateSchema,
  TaskStatusValues,
  TaskPriorityValues,
  ActivityParentTypeValues,
} from '@suitecrm/shared';
import type { ResourceConfig } from '@/components/resource';

export const tasksConfig: ResourceConfig = {
  entityName: 'Task',
  module: 'tasks',
  rowTitle: (r) => String(r.subject ?? '(no subject)'),
  createSchema: TaskCreateSchema,
  updateSchema: TaskUpdateSchema,
  searchPlaceholder: 'Search by subject…',
  defaults: { subject: '', status: 'Not Started', priority: 'Medium' },
  fields: [
    { name: 'subject', label: 'Subject', type: 'text', required: true, span: 1 },
    { name: 'status', label: 'Status', type: 'select', options: TaskStatusValues, required: true },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: TaskPriorityValues,
      required: true,
    },
    { name: 'dueDate', label: 'Due date', type: 'date' },
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
    { name: 'priority', label: 'Priority' },
    { name: 'dueDate', label: 'Due' },
  ],
};
