import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest } from 'fastify';

// Phase 1: tenant scoping is enforced at the repository layer using
// `req.tenantId` set by the auth plugin. This plugin exists as the seam where
// later phases will install a Prisma client extension that auto-injects
// `tenantId` filters into all queries — see core/prisma.ts.
//
// For now, it just guards against any authenticated route running without a
// tenantId. The auth plugin always sets it from the JWT, so this is defensive.
export default fp(async function tenantScope(app: FastifyInstance) {
  app.addHook('preHandler', async (req: FastifyRequest) => {
    if (req.user && !req.tenantId) {
      req.tenantId = req.user.tid;
    }
  });
});
