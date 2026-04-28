import {
  OpportunityCreateSchema,
  OpportunityUpdateSchema,
  type OpportunityCreate,
  type OpportunityUpdate,
} from '@suitecrm/shared';
import { buildCrudRoutes } from '../../core/crud-factory.js';

export const opportunityRoutes = buildCrudRoutes<OpportunityCreate, OpportunityUpdate>({
  entityName: 'Opportunity',
  prismaModel: 'opportunity',
  permissionKey: 'opportunities',
  createSchema: OpportunityCreateSchema,
  updateSchema: OpportunityUpdateSchema,
  searchFields: ['name'],
  filterFields: ['salesStage', 'accountId', 'leadSource', 'assignedUserId'],
  defaultOrderBy: { closeDate: 'desc' },
  beforeCreate: (_req, data) => ({
    ...data,
    closeDate: data.closeDate ? new Date(data.closeDate) : null,
  }),
  beforeUpdate: (_req, data) => ({
    ...data,
    ...(data.closeDate !== undefined
      ? { closeDate: data.closeDate ? new Date(data.closeDate) : null }
      : {}),
  }),
});
