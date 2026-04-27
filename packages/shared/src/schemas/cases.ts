import { z } from 'zod';
import { CaseStatusValues, CasePriorityValues } from '../enums';

export const CaseCreateSchema = z.object({
  subject: z.string().min(1).max(255),
  accountId: z.string().uuid().nullable().optional(),
  contactId: z.string().uuid().nullable().optional(),
  status: z.enum(CaseStatusValues).optional().default('New'),
  priority: z.enum(CasePriorityValues).optional().default('Medium'),
  type: z.string().max(100).nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  resolution: z.string().nullable().optional(),
});
export type CaseCreate = z.infer<typeof CaseCreateSchema>;

export const CaseUpdateSchema = CaseCreateSchema.partial();
export type CaseUpdate = z.infer<typeof CaseUpdateSchema>;

export const CaseSchema = CaseCreateSchema.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  caseNumber: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Case = z.infer<typeof CaseSchema>;
