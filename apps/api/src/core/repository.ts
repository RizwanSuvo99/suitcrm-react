// Generic tenant-scoped repository helpers.
//
// Each helper takes the Prisma model name (string) and uses indexed access
// `prisma[model]` to call findMany/findFirst/etc. We rely on the migration to
// have given every business table a `tenantId` and `deletedAt` column — the
// helpers always inject those filters/values.

import type { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';
import { NotFoundError } from './errors.js';

export type PrismaModelName =
  | 'account'
  | 'contact'
  | 'lead'
  | 'opportunity'
  | 'case'
  | 'call'
  | 'meeting'
  | 'task'
  | 'note';

interface ListOptions {
  page: number;
  pageSize: number;
  sort?: string; // e.g. "name:asc" or "createdAt:desc"
  search?: string;
  searchFields?: string[]; // columns to OR-match against `search`
  extraWhere?: Record<string, unknown>;
  defaultOrderBy?: Record<string, 'asc' | 'desc'>;
}

interface ListResult<T> {
  data: T[];
  pagination: { page: number; pageSize: number; total: number };
}

function delegate(model: PrismaModelName): {
  findMany: (...args: unknown[]) => Promise<unknown[]>;
  findFirst: (...args: unknown[]) => Promise<unknown>;
  count: (...args: unknown[]) => Promise<number>;
  create: (...args: unknown[]) => Promise<unknown>;
  update: (...args: unknown[]) => Promise<unknown>;
} {
  return (prisma as unknown as Record<string, never>)[model] as never;
}

function parseSort(
  sort: string | undefined,
  fallback: Record<string, 'asc' | 'desc'>,
): Record<string, 'asc' | 'desc'> {
  if (!sort) return fallback;
  const [field, dirRaw] = sort.split(':');
  if (!field) return fallback;
  const dir = dirRaw?.toLowerCase() === 'asc' ? 'asc' : 'desc';
  return { [field]: dir };
}

function buildSearchWhere(search: string | undefined, fields: string[] | undefined) {
  if (!search || !fields?.length) return {};
  return {
    OR: fields.map((f) => ({ [f]: { contains: search, mode: 'insensitive' } })),
  };
}

export async function tenantList<T>(
  model: PrismaModelName,
  tenantId: string,
  opts: ListOptions,
): Promise<ListResult<T>> {
  const where = {
    tenantId,
    deletedAt: null,
    ...buildSearchWhere(opts.search, opts.searchFields),
    ...(opts.extraWhere ?? {}),
  };
  const orderBy = parseSort(opts.sort, opts.defaultOrderBy ?? { createdAt: 'desc' });
  const skip = (opts.page - 1) * opts.pageSize;
  const take = opts.pageSize;

  const d = delegate(model);
  const [data, total] = await Promise.all([
    d.findMany({ where, orderBy, skip, take }) as Promise<T[]>,
    d.count({ where }),
  ]);
  return { data, pagination: { page: opts.page, pageSize: opts.pageSize, total } };
}

export async function tenantFindById<T>(
  model: PrismaModelName,
  tenantId: string,
  id: string,
  opts?: { includeDeleted?: boolean },
): Promise<T> {
  const d = delegate(model);
  const where: Record<string, unknown> = { id, tenantId };
  if (!opts?.includeDeleted) where.deletedAt = null;
  const row = (await d.findFirst({ where })) as T | null;
  if (!row) throw new NotFoundError(`${model} ${id} not found`);
  return row;
}

export async function tenantCreate<T>(
  model: PrismaModelName,
  tenantId: string,
  userId: string,
  data: Record<string, unknown>,
): Promise<T> {
  const d = delegate(model);
  const row = (await d.create({
    data: { ...data, tenantId, createdBy: userId, updatedBy: userId },
  })) as T;
  return row;
}

export async function tenantUpdate<T>(
  model: PrismaModelName,
  tenantId: string,
  userId: string,
  id: string,
  data: Record<string, unknown>,
): Promise<T> {
  // Confirm row belongs to tenant (and isn't soft-deleted) before updating.
  await tenantFindById(model, tenantId, id);
  const d = delegate(model);
  const row = (await d.update({
    where: { id },
    data: { ...data, updatedBy: userId },
  })) as T;
  return row;
}

export async function tenantSoftDelete(
  model: PrismaModelName,
  tenantId: string,
  userId: string,
  id: string,
): Promise<void> {
  await tenantFindById(model, tenantId, id);
  const d = delegate(model);
  await d.update({
    where: { id },
    data: { deletedAt: new Date(), updatedBy: userId } as Prisma.InputJsonValue,
  });
}

export async function tenantRestore<T>(
  model: PrismaModelName,
  tenantId: string,
  userId: string,
  id: string,
): Promise<T> {
  // Find including soft-deleted rows.
  await tenantFindById(model, tenantId, id, { includeDeleted: true });
  const d = delegate(model);
  return (await d.update({
    where: { id },
    data: { deletedAt: null, updatedBy: userId },
  })) as T;
}
