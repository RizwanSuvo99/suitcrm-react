import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof RefreshSchema>;

export const LogoutSchema = z.object({
  refreshToken: z.string().min(1),
});
export type LogoutInput = z.infer<typeof LogoutSchema>;

export const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive(),
});
export type TokenPair = z.infer<typeof TokenPairSchema>;

export const MeResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  tenantId: z.string().uuid(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

export const LoginResponseSchema = z.object({
  user: MeResponseSchema,
  tokens: TokenPairSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
