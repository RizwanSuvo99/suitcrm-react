import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  LoginSchema,
  RefreshSchema,
  LogoutSchema,
  LoginResponseSchema,
  MeResponseSchema,
} from '@suitecrm/shared';
import * as service from './service.js';

function toMeResponse(u: Awaited<ReturnType<typeof service.getMe>>) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    tenantId: u.tenantId,
    roles: u.roles,
    permissions: u.permissions,
  };
}

export async function authRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.post(
    '/auth/login',
    {
      schema: {
        tags: ['auth'],
        body: LoginSchema,
        response: { 200: z.object({ data: LoginResponseSchema }) },
      },
    },
    async (req, reply) => {
      const result = await service.login(req.body.email, req.body.password, {
        userAgent: req.headers['user-agent'] ?? null,
        ipAddress: req.ip,
      });
      reply.code(200);
      return {
        data: {
          user: toMeResponse(result.user),
          tokens: result.tokens,
        },
      };
    },
  );

  r.post(
    '/auth/refresh',
    {
      schema: {
        tags: ['auth'],
        body: RefreshSchema,
        response: { 200: z.object({ data: LoginResponseSchema }) },
      },
    },
    async (req) => {
      const result = await service.refresh(req.body.refreshToken, {
        userAgent: req.headers['user-agent'] ?? null,
        ipAddress: req.ip,
      });
      return {
        data: {
          user: toMeResponse(result.user),
          tokens: result.tokens,
        },
      };
    },
  );

  r.post(
    '/auth/logout',
    {
      schema: {
        tags: ['auth'],
        body: LogoutSchema,
        response: { 204: z.null() },
      },
    },
    async (req, reply) => {
      await service.logout(req.body.refreshToken);
      reply.code(204).send();
    },
  );

  r.get(
    '/auth/me',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['auth'],
        response: { 200: z.object({ data: MeResponseSchema }) },
      },
    },
    async (req) => {
      const me = await service.getMe(req.user!.sub);
      return { data: toMeResponse(me) };
    },
  );
}
