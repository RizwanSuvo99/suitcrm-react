import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { prisma } from '../prisma.js';
import { loadConfig } from '../../config.js';
import { signAccessToken, signRefreshToken } from './jwt.js';

export interface IssueTokensInput {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function issueTokens(input: IssueTokensInput): Promise<IssuedTokens> {
  const cfg = loadConfig();
  const jti = randomUUID();

  const accessToken = signAccessToken({
    sub: input.userId,
    tid: input.tenantId,
    roles: input.roles,
    permissions: input.permissions,
  });
  const refreshToken = signRefreshToken({
    sub: input.userId,
    tid: input.tenantId,
    jti,
  });

  const tokenHash = await argon2.hash(refreshToken, { type: argon2.argon2id });
  const expiresAt = new Date(Date.now() + cfg.JWT_REFRESH_TTL * 1000);

  await prisma.refreshToken.create({
    data: {
      id: jti,
      tenantId: input.tenantId,
      userId: input.userId,
      tokenHash,
      expiresAt,
      userAgent: input.userAgent ?? null,
      ipAddress: input.ipAddress ?? null,
    },
  });

  return { accessToken, refreshToken, expiresIn: cfg.JWT_ACCESS_TTL };
}

export async function verifyRefreshTokenInDb(
  jti: string,
  rawToken: string,
): Promise<{ userId: string; tenantId: string } | null> {
  const row = await prisma.refreshToken.findUnique({ where: { id: jti } });
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  const ok = await argon2.verify(row.tokenHash, rawToken);
  if (!ok) return null;
  return { userId: row.userId, tenantId: row.tenantId };
}

export async function revokeRefreshToken(jti: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { id: jti, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllRefreshTokensForUser(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
