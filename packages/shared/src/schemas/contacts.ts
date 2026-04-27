import { z } from 'zod';

export const ContactCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  title: z.string().max(100).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  phoneWork: z.string().max(50).nullable().optional(),
  phoneMobile: z.string().max(50).nullable().optional(),
  accountId: z.string().uuid().nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  doNotCall: z.boolean().optional().default(false),
  leadSource: z.string().max(100).nullable().optional(),
  description: z.string().nullable().optional(),
});
export type ContactCreate = z.infer<typeof ContactCreateSchema>;

export const ContactUpdateSchema = ContactCreateSchema.partial();
export type ContactUpdate = z.infer<typeof ContactUpdateSchema>;

export const ContactSchema = ContactCreateSchema.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Contact = z.infer<typeof ContactSchema>;
