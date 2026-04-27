import { z } from 'zod';
import { MeetingStatusValues, ActivityParentTypeValues } from '../enums';

export const MeetingCreateSchema = z.object({
  subject: z.string().min(1).max(255),
  status: z.enum(MeetingStatusValues).optional().default('Planned'),
  location: z.string().max(255).nullable().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  parentType: z.enum(ActivityParentTypeValues).nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
});
export type MeetingCreate = z.infer<typeof MeetingCreateSchema>;

export const MeetingUpdateSchema = MeetingCreateSchema.partial();
export type MeetingUpdate = z.infer<typeof MeetingUpdateSchema>;

export const MeetingSchema = MeetingCreateSchema.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Meeting = z.infer<typeof MeetingSchema>;
