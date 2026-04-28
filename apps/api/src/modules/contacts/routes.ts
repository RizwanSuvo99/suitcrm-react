import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ContactCreateSchema, ContactUpdateSchema, PaginationQuerySchema } from '@suitecrm/shared';
import { buildCrudRoutes } from '../../core/crud-factory.js';
import { tenantList, tenantFindById } from '../../core/repository.js';

const ParamsSchema = z.object({ id: z.string().uuid() });

export const contactRoutes = buildCrudRoutes({
  entityName: 'Contact',
  prismaModel: 'contact',
  permissionKey: 'contacts',
  createSchema: ContactCreateSchema,
  updateSchema: ContactUpdateSchema,
  searchFields: ['firstName', 'lastName', 'email', 'phoneWork', 'phoneMobile'],
  filterFields: ['accountId', 'assignedUserId', 'leadSource'],
  defaultOrderBy: { lastName: 'asc' },
});

export async function contactRelationshipRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/:id/cases',
    {
      preHandler: [app.authenticate, app.requirePermission('contacts:read')],
      schema: { params: ParamsSchema, querystring: PaginationQuerySchema },
    },
    async (req) => {
      const { id } = req.params as { id: string };
      const q = req.query as z.infer<typeof PaginationQuerySchema>;
      await tenantFindById('contact', req.tenantId!, id);
      return tenantList('case', req.tenantId!, {
        page: q.page,
        pageSize: q.pageSize,
        sort: q.sort,
        search: q.search,
        searchFields: ['subject'],
        extraWhere: { contactId: id },
        defaultOrderBy: { createdAt: 'desc' },
      });
    },
  );
}
