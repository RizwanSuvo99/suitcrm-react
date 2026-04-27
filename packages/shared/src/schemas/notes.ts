import { z } from 'zod';
import { ActivityParentTypeValues } from '../enums';

export const NoteCreateSchema = z.object({
  subject: z.string().min(1).max(255),
  body: z.string().nullable().optional(),
  parentType: z.enum(ActivityParentTypeValues).nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
});
export type NoteCreate = z.infer<typeof NoteCreateSchema>;

export const NoteUpdateSchema = NoteCreateSchema.partial();
export type NoteUpdate = z.infer<typeof NoteUpdateSchema>;

export const NoteSchema = NoteCreateSchema.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Note = z.infer<typeof NoteSchema>;
