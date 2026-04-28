// Shared helper: validate that a polymorphic activity's (parentType, parentId)
// pair points at an existing, non-deleted row in the right table.

import { prisma } from '../core/prisma.js';
import { BadRequestError } from '../core/errors.js';
import type { ActivityParentType } from '@suitecrm/shared';
import type { PrismaModelName } from '../core/repository.js';

const PARENT_TYPE_TO_MODEL: Record<ActivityParentType, PrismaModelName> = {
  Account: 'account',
  Contact: 'contact',
  Lead: 'lead',
  Opportunity: 'opportunity',
  Case: 'case',
};

export async function ensureActivityParent(
  tenantId: string,
  parentType: ActivityParentType | null | undefined,
  parentId: string | null | undefined,
): Promise<void> {
  // Both null/missing is fine — activity is "orphaned".
  if (!parentType && !parentId) return;
  if (!parentType || !parentId) {
    throw new BadRequestError('parentType and parentId must be provided together');
  }
  const model = PARENT_TYPE_TO_MODEL[parentType];
  if (!model) throw new BadRequestError(`Unknown parentType: ${parentType}`);
  const delegate = (prisma as unknown as Record<string, { findFirst: (...args: unknown[]) => Promise<unknown> }>)[
    model
  ];
  if (!delegate) throw new BadRequestError(`Unknown parentType: ${parentType}`);
  const exists = await delegate.findFirst({
    where: { id: parentId, tenantId, deletedAt: null },
    select: { id: true },
  });
  if (!exists) {
    throw new BadRequestError(
      `Parent ${parentType} ${parentId} not found in this tenant`,
    );
  }
}

interface ActivityParentFields {
  parentType?: ActivityParentType | null;
  parentId?: string | null;
}

export async function activityBeforeCreate<T extends ActivityParentFields>(
  req: { tenantId: string },
  data: T,
  toIso?: (data: T) => Record<string, unknown>,
): Promise<Record<string, unknown>> {
  await ensureActivityParent(req.tenantId, data.parentType, data.parentId);
  return toIso ? toIso(data) : (data as unknown as Record<string, unknown>);
}

export async function activityBeforeUpdate<T extends ActivityParentFields>(
  req: { tenantId: string },
  data: T,
  toIso?: (data: T) => Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (data.parentType !== undefined || data.parentId !== undefined) {
    await ensureActivityParent(req.tenantId, data.parentType, data.parentId);
  }
  return toIso ? toIso(data) : (data as unknown as Record<string, unknown>);
}
