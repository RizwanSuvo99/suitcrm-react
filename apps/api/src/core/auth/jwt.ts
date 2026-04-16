import jwt from 'jsonwebtoken';
import { loadConfig } from '../../config.js';

export interface AccessTokenPayload {
  sub: string; // user id
  tid: string; // tenant id
  roles: string[];
  permissions: string[];
}

export interface RefreshTokenPayload {
  sub: string; // user id
  tid: string; // tenant id
  jti: string; // refresh-token row id
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const cfg = loadConfig();
  return jwt.sign(payload, cfg.JWT_SECRET, {
    expiresIn: cfg.JWT_ACCESS_TTL,
    algorithm: 'HS256',
  });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const cfg = loadConfig();
  return jwt.sign(payload, cfg.JWT_REFRESH_SECRET, {
    expiresIn: cfg.JWT_REFRESH_TTL,
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const cfg = loadConfig();
  return jwt.verify(token, cfg.JWT_SECRET, { algorithms: ['HS256'] }) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const cfg = loadConfig();
  return jwt.verify(token, cfg.JWT_REFRESH_SECRET, {
    algorithms: ['HS256'],
  }) as RefreshTokenPayload;
}
