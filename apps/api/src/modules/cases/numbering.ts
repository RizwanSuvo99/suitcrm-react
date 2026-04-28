import type { Prisma } from '@prisma/client';

// Allocates the next case number for a tenant. Caller must run this inside a
// transaction so the SELECT ... FOR UPDATE actually locks the row. Postgres
// upserts the counter row on first use.
export async function nextCaseNumber(
  tx: Prisma.TransactionClient,
  tenantId: string,
): Promise<number> {
  // Initialize counter row if missing (no-op on conflict).
  await tx.caseCounter.upsert({
    where: { tenantId },
    create: { tenantId, lastValue: 0 },
    update: {},
  });
  // Lock & increment.
  const rows = await tx.$queryRaw<{ last_value: number }[]>`
    UPDATE case_counters
       SET last_value = last_value + 1
     WHERE tenant_id = ${tenantId}::uuid
     RETURNING last_value
  `;
  const next = rows[0]?.last_value;
  if (!next) throw new Error('failed to allocate case number');
  return next;
}
