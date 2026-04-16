import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { verifyAccessToken, type AccessTokenPayload } from '../core/auth/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../core/errors.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AccessTokenPayload;
    tenantId?: string;
  }
  interface FastifyInstance {
    authenticate: (req: FastifyRequest) => Promise<void>;
    requirePermission: (permission: string) => (req: FastifyRequest) => Promise<void>;
  }
}

function extractBearer(req: FastifyRequest): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export default fp(async function authPlugin(app: FastifyInstance) {
  app.decorate('authenticate', async (req: FastifyRequest) => {
    const token = extractBearer(req);
    if (!token) throw new UnauthorizedError('Missing bearer token');
    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      req.tenantId = payload.tid;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  });

  app.decorate(
    'requirePermission',
    (permission: string) => async (req: FastifyRequest) => {
      if (!req.user) throw new UnauthorizedError();
      if (!req.user.permissions.includes(permission)) {
        throw new ForbiddenError(`Missing required permission: ${permission}`);
      }
    },
  );
});
