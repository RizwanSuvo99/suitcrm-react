import { CallCreateSchema, CallUpdateSchema, type CallCreate, type CallUpdate } from '@suitecrm/shared';
import { buildCrudRoutes } from '../../core/crud-factory.js';
import { activityBeforeCreate, activityBeforeUpdate } from '../activities-shared.js';

const toIso = <T extends { startsAt?: string | null }>(d: T): Record<string, unknown> => ({
  ...d,
  ...(d.startsAt !== undefined ? { startsAt: d.startsAt ? new Date(d.startsAt) : null } : {}),
});

export const callRoutes = buildCrudRoutes<CallCreate, CallUpdate>({
  entityName: 'Call',
  prismaModel: 'call',
  permissionKey: 'calls',
  createSchema: CallCreateSchema,
  updateSchema: CallUpdateSchema,
  searchFields: ['subject', 'description'],
  filterFields: ['status', 'direction', 'parentType', 'parentId', 'assignedUserId'],
  defaultOrderBy: { startsAt: 'desc' },
  beforeCreate: (req, data) => activityBeforeCreate(req, data, toIso),
  beforeUpdate: (req, data) => activityBeforeUpdate(req, data, toIso),
});
