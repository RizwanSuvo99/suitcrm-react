import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../core/errors.js';

function send(reply: FastifyReply, payload: Record<string, unknown>) {
  return reply
    .header('content-type', 'application/problem+json; charset=utf-8')
    .status(payload.status as number)
    .send(payload);
}

export default fp(async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((err: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
    if (err instanceof ZodError) {
      req.log.warn({ err: err.flatten() }, 'validation error');
      return send(reply, {
        type: 'about:blank',
        title: 'Validation Failed',
        status: 400,
        detail: 'One or more fields are invalid',
        errors: err.errors,
      });
    }

    // fastify-type-provider-zod surfaces validation as fastify-style validation errors
    if (err.validation) {
      return send(reply, {
        type: 'about:blank',
        title: 'Validation Failed',
        status: 400,
        detail: err.message,
        errors: err.validation,
      });
    }

    if (err instanceof AppError) {
      const level = err.status >= 500 ? 'error' : 'warn';
      req.log[level]({ err }, 'app error');
      return send(reply, {
        type: err.type,
        title: err.title,
        status: err.status,
        detail: err.detail,
        ...(err.errors ? { errors: err.errors } : {}),
      });
    }

    if (err.statusCode && err.statusCode < 500) {
      req.log.warn({ err }, 'http error');
      return send(reply, {
        type: 'about:blank',
        title: err.name || 'Error',
        status: err.statusCode,
        detail: err.message,
      });
    }

    req.log.error({ err }, 'unhandled error');
    return send(reply, {
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
    });
  });

  app.setNotFoundHandler((req, reply) => {
    return send(reply, {
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: `Route ${req.method} ${req.url} not found`,
    });
  });
});
