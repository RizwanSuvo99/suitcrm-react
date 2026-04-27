import { z } from 'zod';
import {
  CallStatusValues,
  CallDirectionValues,
  ActivityParentTypeValues,
} from '../enums';

export const CallCreateSchema = z.object({
  subject: z.string().min(1).max(255),
  status: z.enum(CallStatusValues).optional().default('Planned'),
  direction: z.enum(CallDirectionValues).optional().default('Outbound'),
  startsAt: z.string().nullable().optional(),
  durationMinutes: z.coerce.number().int().nonnegative().nullable().optional(),
  parentType: z.enum(ActivityParentTypeValues).nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
});
export type CallCreate = z.infer<typeof CallCreateSchema>;

export const CallUpdateSchema = CallCreateSchema.partial();
export type CallUpdate = z.infer<typeof CallUpdateSchema>;

export const CallSchema = CallCreateSchema.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Call = z.infer<typeof CallSchema>;
