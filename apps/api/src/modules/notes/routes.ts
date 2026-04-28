import { NoteCreateSchema, NoteUpdateSchema, type NoteCreate, type NoteUpdate } from '@suitecrm/shared';
import { buildCrudRoutes } from '../../core/crud-factory.js';
import { activityBeforeCreate, activityBeforeUpdate } from '../activities-shared.js';

export const noteRoutes = buildCrudRoutes<NoteCreate, NoteUpdate>({
  entityName: 'Note',
  prismaModel: 'note',
  permissionKey: 'notes',
  createSchema: NoteCreateSchema,
  updateSchema: NoteUpdateSchema,
  searchFields: ['subject', 'body'],
  filterFields: ['parentType', 'parentId', 'assignedUserId'],
  defaultOrderBy: { createdAt: 'desc' },
  beforeCreate: (req, data) => activityBeforeCreate(req, data),
  beforeUpdate: (req, data) => activityBeforeUpdate(req, data),
});
