import { prisma } from './prisma.js';

export interface AuditWriteInput {
  tenantId: string;
  userId?: string | null;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'login' | 'logout';
  changes?: Record<string, unknown> | null;
}

export async function writeAuditLog(input: AuditWriteInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      changes: (input.changes ?? null) as never,
    },
  });
}
