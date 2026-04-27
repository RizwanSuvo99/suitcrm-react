import { z } from 'zod';
import { SalesStageValues } from '../enums';

export const OpportunityCreateSchema = z.object({
  name: z.string().min(1).max(255),
  accountId: z.string().uuid().nullable().optional(),
  amount: z.coerce.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).optional().default('USD'),
  salesStage: z.enum(SalesStageValues).optional().default('Prospecting'),
  probability: z.coerce.number().int().min(0).max(100).nullable().optional(),
  closeDate: z.string().nullable().optional(),
  leadSource: z.string().max(100).nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
});
export type OpportunityCreate = z.infer<typeof OpportunityCreateSchema>;

export const OpportunityUpdateSchema = OpportunityCreateSchema.partial();
export type OpportunityUpdate = z.infer<typeof OpportunityUpdateSchema>;

export const OpportunitySchema = OpportunityCreateSchema.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;
