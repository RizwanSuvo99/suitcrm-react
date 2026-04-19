import { prisma } from '../../core/prisma.js';

export interface UserWithRolesAndPerms {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export async function findUserByEmail(
  email: string,
): Promise<UserWithRolesAndPerms | null> {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), deletedAt: null },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });
  if (!user) return null;
  return mapUser(user);
}

export async function findUserById(id: string): Promise<UserWithRolesAndPerms | null> {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });
  if (!user) return null;
  return mapUser(user);
}

export async function touchLastLogin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}

type UserShape = NonNullable<Awaited<ReturnType<typeof findUserByEmailRaw>>>;

async function findUserByEmailRaw(email: string) {
  return prisma.user.findFirst({
    where: { email: email.toLowerCase(), deletedAt: null },
    include: {
      userRoles: {
        include: {
          role: {
            include: { rolePermissions: { include: { permission: true } } },
          },
        },
      },
    },
  });
}

function mapUser(user: UserShape): UserWithRolesAndPerms {
  const roles = user.userRoles.map((ur) => ur.role.name);
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => `${rp.permission.module}:${rp.permission.action}`),
      ),
    ),
  );
  return {
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    passwordHash: user.passwordHash,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    roles,
    permissions,
  };
}
