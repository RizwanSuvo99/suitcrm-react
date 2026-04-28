import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { AccountCreateSchema, AccountUpdateSchema, PaginationQuerySchema } from '@suitecrm/shared';
import { buildCrudRoutes } from '../../core/crud-factory.js';
import { tenantList, tenantFindById } from '../../core/repository.js';

const ParamsSchema = z.object({ id: z.string().uuid() });

export const accountRoutes = buildCrudRoutes({
  entityName: 'Account',
  prismaModel: 'account',
  permissionKey: 'accounts',
  createSchema: AccountCreateSchema,
  updateSchema: AccountUpdateSchema,
  searchFields: ['name', 'email', 'industry', 'phone'],
  filterFields: ['industry', 'parentAccountId', 'assignedUserId'],
  defaultOrderBy: { name: 'asc' },
});

export async function accountRelationshipRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/:id/contacts',
    {
      preHandler: [app.authenticate, app.requirePermission('accounts:read')],
      schema: {
        params: ParamsSchema,
        querystring: PaginationQuerySchema,
      },
    },
    async (req) => {
      const { id } = req.params as { id: string };
      const q = req.query as z.infer<typeof PaginationQuerySchema>;
      await tenantFindById('account', req.tenantId!, id);
      return tenantList('contact', req.tenantId!, {
        page: q.page,
        pageSize: q.pageSize,
        sort: q.sort,
        search: q.search,
        searchFields: ['firstName', 'lastName', 'email'],
        extraWhere: { accountId: id },
        defaultOrderBy: { lastName: 'asc' },
      });
    },
  );

  r.get(
    '/:id/opportunities',
    {
      preHandler: [app.authenticate, app.requirePermission('accounts:read')],
      schema: { params: ParamsSchema, querystring: PaginationQuerySchema },
    },
    async (req) => {
      const { id } = req.params as { id: string };
      const q = req.query as z.infer<typeof PaginationQuerySchema>;
      await tenantFindById('account', req.tenantId!, id);
      return tenantList('opportunity', req.tenantId!, {
        page: q.page,
        pageSize: q.pageSize,
        sort: q.sort,
        search: q.search,
        searchFields: ['name'],
        extraWhere: { accountId: id },
        defaultOrderBy: { closeDate: 'desc' },
      });
    },
  );

  r.get(
    '/:id/cases',
    {
      preHandler: [app.authenticate, app.requirePermission('accounts:read')],
      schema: { params: ParamsSchema, querystring: PaginationQuerySchema },
    },
    async (req) => {
      const { id } = req.params as { id: string };
      const q = req.query as z.infer<typeof PaginationQuerySchema>;
      await tenantFindById('account', req.tenantId!, id);
      return tenantList('case', req.tenantId!, {
        page: q.page,
        pageSize: q.pageSize,
        sort: q.sort,
        search: q.search,
        searchFields: ['subject'],
        extraWhere: { accountId: id },
        defaultOrderBy: { createdAt: 'desc' },
      });
    },
  );
}
