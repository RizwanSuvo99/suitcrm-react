import { z } from 'zod';

const AddressSchema = z
  .object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  })
  .partial()
  .nullable()
  .optional();

export const AccountCreateSchema = z.object({
  name: z.string().min(1).max(255),
  website: z.string().url().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  annualRevenue: z.coerce.number().nonnegative().nullable().optional(),
  employees: z.coerce.number().int().nonnegative().nullable().optional(),
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  parentAccountId: z.string().uuid().nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
});
export type AccountCreate = z.infer<typeof AccountCreateSchema>;

export const AccountUpdateSchema = AccountCreateSchema.partial();
export type AccountUpdate = z.infer<typeof AccountUpdateSchema>;

export const AccountSchema = AccountCreateSchema.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Account = z.infer<typeof AccountSchema>;
