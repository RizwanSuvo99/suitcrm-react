import { TaskCreateSchema, TaskUpdateSchema, type TaskCreate, type TaskUpdate } from '@suitecrm/shared';
import { buildCrudRoutes } from '../../core/crud-factory.js';
import { activityBeforeCreate, activityBeforeUpdate } from '../activities-shared.js';

const toIso = <T extends { dueDate?: string | null }>(d: T): Record<string, unknown> => ({
  ...d,
  ...(d.dueDate !== undefined ? { dueDate: d.dueDate ? new Date(d.dueDate) : null } : {}),
});

export const taskRoutes = buildCrudRoutes<TaskCreate, TaskUpdate>({
  entityName: 'Task',
  prismaModel: 'task',
  permissionKey: 'tasks',
  createSchema: TaskCreateSchema,
  updateSchema: TaskUpdateSchema,
  searchFields: ['subject', 'description'],
  filterFields: ['status', 'priority', 'parentType', 'parentId', 'assignedUserId'],
  defaultOrderBy: { dueDate: 'asc' },
  beforeCreate: (req, data) => activityBeforeCreate(req, data, toIso),
  beforeUpdate: (req, data) => activityBeforeUpdate(req, data, toIso),
});
