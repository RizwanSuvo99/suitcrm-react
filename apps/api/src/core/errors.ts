// RFC 7807 problem+json oriented error hierarchy.
export class AppError extends Error {
  readonly status: number;
  readonly type: string;
  readonly title: string;
  readonly detail?: string;
  readonly errors?: unknown[];

  constructor(opts: {
    status: number;
    type: string;
    title: string;
    detail?: string;
    errors?: unknown[];
  }) {
    super(opts.detail ?? opts.title);
    this.status = opts.status;
    this.type = opts.type;
    this.title = opts.title;
    this.detail = opts.detail;
    this.errors = opts.errors;
  }
}

export class BadRequestError extends AppError {
  constructor(detail?: string, errors?: unknown[]) {
    super({
      status: 400,
      type: 'about:blank',
      title: 'Bad Request',
      detail,
      errors,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(detail = 'Authentication is required') {
    super({
      status: 401,
      type: 'about:blank',
      title: 'Unauthorized',
      detail,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(detail = 'You do not have permission to perform this action') {
    super({
      status: 403,
      type: 'about:blank',
      title: 'Forbidden',
      detail,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(detail = 'The requested resource was not found') {
    super({
      status: 404,
      type: 'about:blank',
      title: 'Not Found',
      detail,
    });
  }
}

export class ConflictError extends AppError {
  constructor(detail?: string) {
    super({
      status: 409,
      type: 'about:blank',
      title: 'Conflict',
      detail,
    });
  }
}
