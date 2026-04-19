// Re-export shared Zod schemas so route handlers can register them via
// fastify-type-provider-zod without reaching across packages directly.
export {
  LoginSchema,
  RefreshSchema,
  LogoutSchema,
  TokenPairSchema,
  MeResponseSchema,
  LoginResponseSchema,
} from '@suitecrm/shared';
