// CRUD route factory.
//
// Registers the six standard endpoints for a tenant-scoped business entity:
//
//   GET    /              list (page/pageSize/sort/search/filter)
//   GET    /:id           single
//   POST   /              create
//   PATCH  /:id           partial update
//   DELETE /:id           soft delete (204)
//   POST   /:id/restore   undelete
//
// Each module instantiates this from its own routes.ts. Modules with extra
// behavior (lead conversion, polymorphic activity validation, case auto-
// numbering) layer additional routes alongside the factory output and/or
// override the create/update hooks.

import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z, type ZodTypeAny } from 'zod';
import { PaginationQuerySchema } from '@suitecrm/shared';
import {
  tenantList,
  tenantFindById,
  tenantCreate,
  tenantUpdate,
  tenantSoftDelete,
  tenantRestore,
  type PrismaModelName,
} from './repository.js';
import { writeAuditLog } from './audit.js';

export interface CrudConfig<TCreate = unknown, TUpdate = unknown> {
  /** entity name in singular form, used in audit logs (e.g. "Account") */
  entityName: string;
  /** prisma delegate name; matches the lower-cased model on PrismaClient */
  prismaModel: PrismaModelName;
  /** module name used for permission keys (e.g. "accounts") */
  permissionKey: string;
  // Schemas are intentionally typed as ZodTypeAny — Zod's `.default(...)`
  // creates an Output/Input mismatch that fights with `z.ZodType<T>`.
  createSchema: ZodTypeAny;
  updateSchema: ZodTypeAny;
  /** columns the list endpoint OR-searches against `?search=` */
  searchFields?: string[];
  /** default ordering when no `?sort=` is given */
  defaultOrderBy?: Record<string, 'asc' | 'desc'>;
  /** filter columns that are exposed via `?filter[col]=val` */
  filterFields?: string[];
  /** invoked before create; can mutate the data and return additional data */
  beforeCreate?: (
    req: { tenantId: string; userId: string },
    data: TCreate,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;
  /** invoked before update */
  beforeUpdate?: (
    req: { tenantId: string; userId: string; id: string },
    data: TUpdate,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;
}

const ParamsSchema = z.object({ id: z.string().uuid() });

const ListQuerySchema = PaginationQuerySchema.extend({
  filter: z.record(z.string(), z.string()).optional(),
});

export function buildCrudRoutes<TCreate, TUpdate>(
  cfg: CrudConfig<TCreate, TUpdate>,
) {
  return async function (app: FastifyInstance) {
    const r = app.withTypeProvider<ZodTypeProvider>();
    const permRead = `${cfg.permissionKey}:read`;
    const permWrite = `${cfg.permissionKey}:write`;
    const permDelete = `${cfg.permissionKey}:delete`;

    // Response schemas are intentionally permissive — each module would have
    // a dedicated full-row schema in @suitecrm/shared but plumbing all 9 of
    // those through here adds a lot of generics for marginal client benefit.
    const ListResponse = z.object({
      data: z.array(z.unknown()),
      pagination: z.object({
        page: z.number(),
        pageSize: z.number(),
        total: z.number(),
      }),
    });
    const ItemResponse = z.object({ data: z.unknown() });

    r.get(
      '/',
      {
        preHandler: [app.authenticate, app.requirePermission(permRead)],
        schema: { querystring: ListQuerySchema as unknown as ZodTypeAny, response: { 200: ListResponse } },
      },
      async (req) => {
        const q = req.query as z.infer<typeof ListQuerySchema>;
        const extraWhere: Record<string, unknown> = {};
        if (q.filter && cfg.filterFields) {
          for (const f of cfg.filterFields) {
            if (q.filter[f] !== undefined) extraWhere[f] = q.filter[f];
          }
        }
        const result = await tenantList(cfg.prismaModel, req.tenantId!, {
          page: q.page,
          pageSize: q.pageSize,
          sort: q.sort,
          search: q.search,
          searchFields: cfg.searchFields,
          extraWhere,
          defaultOrderBy: cfg.defaultOrderBy,
        });
        return result;
      },
    );

    r.get(
      '/:id',
      {
        preHandler: [app.authenticate, app.requirePermission(permRead)],
        schema: { params: ParamsSchema, response: { 200: ItemResponse } },
      },
      async (req) => {
        const { id } = req.params as { id: string };
        const row = await tenantFindById(cfg.prismaModel, req.tenantId!, id);
        return { data: row };
      },
    );

    r.post(
      '/',
      {
        preHandler: [app.authenticate, app.requirePermission(permWrite)],
        schema: { body: cfg.createSchema as unknown as ZodTypeAny, response: { 201: ItemResponse } },
      },
      async (req, reply) => {
        const userId = req.user!.sub;
        const tenantId = req.tenantId!;
        let data: Record<string, unknown> = req.body as Record<string, unknown>;
        if (cfg.beforeCreate) {
          data = (await cfg.beforeCreate({ tenantId, userId }, req.body as TCreate)) as Record<
            string,
            unknown
          >;
        }
        const row = await tenantCreate<{ id: string }>(cfg.prismaModel, tenantId, userId, data);
        await writeAuditLog({
          tenantId,
          userId,
          entityType: cfg.entityName,
          entityId: row.id,
          action: 'create',
          changes: data,
        });
        reply.code(201);
        return { data: row };
      },
    );

    r.patch(
      '/:id',
      {
        preHandler: [app.authenticate, app.requirePermission(permWrite)],
        schema: {
          params: ParamsSchema,
          body: cfg.updateSchema as unknown as ZodTypeAny,
          response: { 200: ItemResponse },
        },
      },
      async (req) => {
        const { id } = req.params as { id: string };
        const userId = req.user!.sub;
        const tenantId = req.tenantId!;
        let data: Record<string, unknown> = req.body as Record<string, unknown>;
        if (cfg.beforeUpdate) {
          data = (await cfg.beforeUpdate({ tenantId, userId, id }, req.body as TUpdate)) as Record<
            string,
            unknown
          >;
        }
        const row = await tenantUpdate(cfg.prismaModel, tenantId, userId, id, data);
        await writeAuditLog({
          tenantId,
          userId,
          entityType: cfg.entityName,
          entityId: id,
          action: 'update',
          changes: data,
        });
        return { data: row };
      },
    );

    r.delete(
      '/:id',
      {
        preHandler: [app.authenticate, app.requirePermission(permDelete)],
        schema: { params: ParamsSchema, response: { 204: z.null() } },
      },
      async (req, reply) => {
        const { id } = req.params as { id: string };
        const userId = req.user!.sub;
        const tenantId = req.tenantId!;
        await tenantSoftDelete(cfg.prismaModel, tenantId, userId, id);
        await writeAuditLog({
          tenantId,
          userId,
          entityType: cfg.entityName,
          entityId: id,
          action: 'delete',
        });
        reply.code(204).send();
      },
    );

    r.post(
      '/:id/restore',
      {
        preHandler: [app.authenticate, app.requirePermission(permWrite)],
        schema: { params: ParamsSchema, response: { 200: ItemResponse } },
      },
      async (req) => {
        const { id } = req.params as { id: string };
        const userId = req.user!.sub;
        const tenantId = req.tenantId!;
        const row = await tenantRestore(cfg.prismaModel, tenantId, userId, id);
        await writeAuditLog({
          tenantId,
          userId,
          entityType: cfg.entityName,
          entityId: id,
          action: 'restore',
        });
        return { data: row };
      },
    );
  };
}
