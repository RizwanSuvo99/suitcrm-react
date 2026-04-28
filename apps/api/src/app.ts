import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { loadConfig } from './config.js';
import errorHandler from './plugins/error-handler.js';
import authPlugin from './plugins/auth.js';
import tenantScope from './plugins/tenant-scope.js';
import { authRoutes } from './modules/auth/routes.js';
import { accountRoutes, accountRelationshipRoutes } from './modules/accounts/routes.js';
import { contactRoutes, contactRelationshipRoutes } from './modules/contacts/routes.js';
import { leadRoutes, leadConversionRoutes } from './modules/leads/routes.js';
import { opportunityRoutes } from './modules/opportunities/routes.js';
import { caseRoutes } from './modules/cases/routes.js';
import { callRoutes } from './modules/calls/routes.js';
import { meetingRoutes } from './modules/meetings/routes.js';
import { taskRoutes } from './modules/tasks/routes.js';
import { noteRoutes } from './modules/notes/routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const config = loadConfig();

  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      ...(config.NODE_ENV === 'development'
        ? {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l' },
            },
          }
        : {}),
    },
    trustProxy: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: config.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  });
  await app.register(sensible);
  await app.register(errorHandler);
  await app.register(authPlugin);
  await app.register(tenantScope);

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  await app.register(
    async (api) => {
      await api.register(authRoutes);

      await api.register(accountRoutes, { prefix: '/accounts' });
      await api.register(accountRelationshipRoutes, { prefix: '/accounts' });

      await api.register(contactRoutes, { prefix: '/contacts' });
      await api.register(contactRelationshipRoutes, { prefix: '/contacts' });

      await api.register(leadRoutes, { prefix: '/leads' });
      await api.register(leadConversionRoutes, { prefix: '/leads' });

      await api.register(opportunityRoutes, { prefix: '/opportunities' });
      await api.register(caseRoutes, { prefix: '/cases' });
      await api.register(callRoutes, { prefix: '/calls' });
      await api.register(meetingRoutes, { prefix: '/meetings' });
      await api.register(taskRoutes, { prefix: '/tasks' });
      await api.register(noteRoutes, { prefix: '/notes' });
    },
    { prefix: '/api/v1' },
  );

  return app;
}
