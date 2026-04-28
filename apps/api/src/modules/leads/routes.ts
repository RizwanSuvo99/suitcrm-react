import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  LeadCreateSchema,
  LeadUpdateSchema,
  LeadConvertSchema,
  LeadConvertResultSchema,
} from '@suitecrm/shared';
import { buildCrudRoutes } from '../../core/crud-factory.js';
import { convertLead } from './conversion.js';

const ParamsSchema = z.object({ id: z.string().uuid() });

export const leadRoutes = buildCrudRoutes({
  entityName: 'Lead',
  prismaModel: 'lead',
  permissionKey: 'leads',
  createSchema: LeadCreateSchema,
  updateSchema: LeadUpdateSchema,
  searchFields: ['firstName', 'lastName', 'email', 'company', 'phone'],
  filterFields: ['status', 'leadSource', 'assignedUserId'],
  defaultOrderBy: { createdAt: 'desc' },
});

export async function leadConversionRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.post(
    '/:id/convert',
    {
      preHandler: [app.authenticate, app.requirePermission('leads:write')],
      schema: {
        params: ParamsSchema,
        body: LeadConvertSchema,
        response: { 200: z.object({ data: LeadConvertResultSchema }) },
      },
    },
    async (req) => {
      const { id } = req.params as { id: string };
      const result = await convertLead({
        leadId: id,
        tenantId: req.tenantId!,
        userId: req.user!.sub,
        opts: req.body as z.infer<typeof LeadConvertSchema>,
      });
      return { data: result };
    },
  );
}
