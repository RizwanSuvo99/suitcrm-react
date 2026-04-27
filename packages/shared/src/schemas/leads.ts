import { z } from 'zod';
import { LeadStatusValues } from '../enums';

export const LeadCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  title: z.string().max(100).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  company: z.string().max(255).nullable().optional(),
  status: z.enum(LeadStatusValues).optional().default('New'),
  leadSource: z.string().max(100).nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
});
export type LeadCreate = z.infer<typeof LeadCreateSchema>;

export const LeadUpdateSchema = LeadCreateSchema.partial();
export type LeadUpdate = z.infer<typeof LeadUpdateSchema>;

export const LeadSchema = LeadCreateSchema.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  convertedAt: z.string().nullable().optional(),
  convertedContactId: z.string().uuid().nullable().optional(),
  convertedAccountId: z.string().uuid().nullable().optional(),
  convertedOpportunityId: z.string().uuid().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const LeadConvertSchema = z.object({
  createAccount: z.boolean().optional().default(true),
  createContact: z.boolean().optional().default(true),
  createOpportunity: z.boolean().optional().default(false),
  opportunityName: z.string().min(1).max(255).optional(),
  opportunityAmount: z.coerce.number().nonnegative().optional(),
  opportunityCloseDate: z.string().optional(),
});
export type LeadConvert = z.infer<typeof LeadConvertSchema>;

export const LeadConvertResultSchema = z.object({
  leadId: z.string().uuid(),
  accountId: z.string().uuid().nullable(),
  contactId: z.string().uuid().nullable(),
  opportunityId: z.string().uuid().nullable(),
});
export type LeadConvertResult = z.infer<typeof LeadConvertResultSchema>;
