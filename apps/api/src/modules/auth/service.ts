import { UnauthorizedError } from '../../core/errors.js';
import { verifyPassword } from '../../core/auth/password.js';
import {
  issueTokens,
  revokeRefreshToken,
  verifyRefreshTokenInDb,
  type IssuedTokens,
} from '../../core/auth/tokens.js';
import { verifyRefreshToken } from '../../core/auth/jwt.js';
import { writeAuditLog } from '../../core/audit.js';
import {
  findUserByEmail,
  findUserById,
  touchLastLogin,
  type UserWithRolesAndPerms,
} from './repository.js';

export interface SessionMetadata {
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface LoginResult {
  user: UserWithRolesAndPerms;
  tokens: IssuedTokens;
}

export async function login(
  email: string,
  password: string,
  meta: SessionMetadata,
): Promise<LoginResult> {
  const user = await findUserByEmail(email);
  if (!user || !user.isActive) {
    // Same response for missing-user and bad-password to avoid enumeration.
    throw new UnauthorizedError('Invalid credentials');
  }
  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) throw new UnauthorizedError('Invalid credentials');

  const tokens = await issueTokens({
    userId: user.id,
    tenantId: user.tenantId,
    roles: user.roles,
    permissions: user.permissions,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });

  await touchLastLogin(user.id);
  await writeAuditLog({
    tenantId: user.tenantId,
    userId: user.id,
    entityType: 'User',
    entityId: user.id,
    action: 'login',
  });

  return { user, tokens };
}

export async function refresh(
  rawToken: string,
  meta: SessionMetadata,
): Promise<LoginResult> {
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const dbCheck = await verifyRefreshTokenInDb(payload.jti, rawToken);
  if (!dbCheck) throw new UnauthorizedError('Refresh token revoked or expired');

  const user = await findUserById(payload.sub);
  if (!user || !user.isActive) throw new UnauthorizedError('User no longer active');

  // Rotate: revoke the used token, issue a fresh pair.
  await revokeRefreshToken(payload.jti);
  const tokens = await issueTokens({
    userId: user.id,
    tenantId: user.tenantId,
    roles: user.roles,
    permissions: user.permissions,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });

  return { user, tokens };
}

export async function logout(rawToken: string): Promise<void> {
  try {
    const payload = verifyRefreshToken(rawToken);
    await revokeRefreshToken(payload.jti);
  } catch {
    // Logout is idempotent — invalid tokens silently succeed.
  }
}

export async function getMe(userId: string): Promise<UserWithRolesAndPerms> {
  const user = await findUserById(userId);
  if (!user) throw new UnauthorizedError();
  return user;
}
