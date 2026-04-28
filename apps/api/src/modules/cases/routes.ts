// Cases need per-tenant auto-incrementing case numbers, so we don't use the
// CRUD factory for create. Update/list/delete/restore still go through the
// factory's helpers via direct calls.

import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CaseCreateSchema, CaseUpdateSchema, PaginationQuerySchema } from '@suitecrm/shared';
import { prisma } from '../../core/prisma.js';
import { writeAuditLog } from '../../core/audit.js';
import {
  tenantList,
  tenantFindById,
  tenantUpdate,
  tenantSoftDelete,
  tenantRestore,
} from '../../core/repository.js';
import { nextCaseNumber } from './numbering.js';

const ParamsSchema = z.object({ id: z.string().uuid() });
const ListQuerySchema = PaginationQuerySchema.extend({
  filter: z.record(z.string(), z.string()).optional(),
});
const ItemResponse = z.object({ data: z.record(z.string(), z.unknown()) });

const SEARCH_FIELDS = ['subject', 'description', 'resolution'];
const FILTER_FIELDS = ['status', 'priority', 'accountId', 'contactId', 'assignedUserId'];

export async function caseRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/',
    {
      preHandler: [app.authenticate, app.requirePermission('cases:read')],
      schema: { querystring: ListQuerySchema },
    },
    async (req) => {
      const q = req.query as z.infer<typeof ListQuerySchema>;
      const extra: Record<string, unknown> = {};
      if (q.filter) for (const f of FILTER_FIELDS) if (q.filter[f]) extra[f] = q.filter[f];
      return tenantList('case', req.tenantId!, {
        page: q.page,
        pageSize: q.pageSize,
        sort: q.sort,
        search: q.search,
        searchFields: SEARCH_FIELDS,
        extraWhere: extra,
        defaultOrderBy: { createdAt: 'desc' },
      });
    },
  );

  r.get(
    '/:id',
    {
      preHandler: [app.authenticate, app.requirePermission('cases:read')],
      schema: { params: ParamsSchema, response: { 200: ItemResponse } },
    },
    async (req) => {
      const { id } = req.params as { id: string };
      const row = await tenantFindById<Record<string, unknown>>('case', req.tenantId!, id);
      return { data: row };
    },
  );

  r.post(
    '/',
    {
      preHandler: [app.authenticate, app.requirePermission('cases:write')],
      schema: { body: CaseCreateSchema, response: { 201: ItemResponse } },
    },
    async (req, reply) => {
      const userId = req.user!.sub;
      const tenantId = req.tenantId!;
      const body = req.body as z.infer<typeof CaseCreateSchema>;

      const row = await prisma.$transaction(async (tx) => {
        const caseNumber = await nextCaseNumber(tx, tenantId);
        const data: Prisma.CaseUncheckedCreateInput = {
          ...body,
          caseNumber,
          tenantId,
          createdBy: userId,
          updatedBy: userId,
        };
        return tx.case.create({ data });
      });

      await writeAuditLog({
        tenantId,
        userId,
        entityType: 'Case',
        entityId: row.id,
        action: 'create',
        changes: { ...body, caseNumber: row.caseNumber },
      });
      reply.code(201);
      return { data: row };
    },
  );

  r.patch(
    '/:id',
    {
      preHandler: [app.authenticate, app.requirePermission('cases:write')],
      schema: {
        params: ParamsSchema,
        body: CaseUpdateSchema,
        response: { 200: ItemResponse },
      },
    },
    async (req) => {
      const { id } = req.params as { id: string };
      const userId = req.user!.sub;
      const tenantId = req.tenantId!;
      const body = req.body as z.infer<typeof CaseUpdateSchema>;
      const row = await tenantUpdate<Record<string, unknown>>('case', tenantId, userId, id, body);
      await writeAuditLog({
        tenantId,
        userId,
        entityType: 'Case',
        entityId: id,
        action: 'update',
        changes: body,
      });
      return { data: row };
    },
  );

  r.delete(
    '/:id',
    {
      preHandler: [app.authenticate, app.requirePermission('cases:delete')],
      schema: { params: ParamsSchema, response: { 204: z.null() } },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const userId = req.user!.sub;
      const tenantId = req.tenantId!;
      await tenantSoftDelete('case', tenantId, userId, id);
      await writeAuditLog({
        tenantId,
        userId,
        entityType: 'Case',
        entityId: id,
        action: 'delete',
      });
      reply.code(204).send();
    },
  );

  r.post(
    '/:id/restore',
    {
      preHandler: [app.authenticate, app.requirePermission('cases:write')],
      schema: { params: ParamsSchema, response: { 200: ItemResponse } },
    },
    async (req) => {
      const { id } = req.params as { id: string };
      const userId = req.user!.sub;
      const tenantId = req.tenantId!;
      const row = await tenantRestore<Record<string, unknown>>('case', tenantId, userId, id);
      await writeAuditLog({
        tenantId,
        userId,
        entityType: 'Case',
        entityId: id,
        action: 'restore',
      });
      return { data: row };
    },
  );
}
