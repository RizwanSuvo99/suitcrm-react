import { MeetingCreateSchema, MeetingUpdateSchema, type MeetingCreate, type MeetingUpdate } from '@suitecrm/shared';
import { buildCrudRoutes } from '../../core/crud-factory.js';
import { activityBeforeCreate, activityBeforeUpdate } from '../activities-shared.js';

const toIso = <T extends { startsAt?: string | null; endsAt?: string | null }>(
  d: T,
): Record<string, unknown> => ({
  ...d,
  ...(d.startsAt !== undefined ? { startsAt: d.startsAt ? new Date(d.startsAt) : null } : {}),
  ...(d.endsAt !== undefined ? { endsAt: d.endsAt ? new Date(d.endsAt) : null } : {}),
});

export const meetingRoutes = buildCrudRoutes<MeetingCreate, MeetingUpdate>({
  entityName: 'Meeting',
  prismaModel: 'meeting',
  permissionKey: 'meetings',
  createSchema: MeetingCreateSchema,
  updateSchema: MeetingUpdateSchema,
  searchFields: ['subject', 'location', 'description'],
  filterFields: ['status', 'parentType', 'parentId', 'assignedUserId'],
  defaultOrderBy: { startsAt: 'desc' },
  beforeCreate: (req, data) => activityBeforeCreate(req, data, toIso),
  beforeUpdate: (req, data) => activityBeforeUpdate(req, data, toIso),
});
