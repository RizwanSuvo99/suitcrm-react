import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const MODULES = [
  'accounts',
  'contacts',
  'leads',
  'opportunities',
  'cases',
  'calls',
  'meetings',
  'tasks',
  'notes',
] as const;
const ACTIONS = ['read', 'write', 'delete'] as const;

async function upsertPermissions() {
  for (const module of MODULES) {
    for (const action of ACTIONS) {
      await prisma.permission.upsert({
        where: { module_action: { module, action } },
        create: { module, action },
        update: {},
      });
    }
  }
  return prisma.permission.findMany();
}

async function main() {
  console.log('→ seeding permissions');
  const allPermissions = await upsertPermissions();

  console.log('→ seeding tenant');
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    create: { name: 'Default Tenant', slug: 'default' },
    update: {},
  });

  console.log('→ seeding roles');
  const adminRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Admin' } },
    create: {
      tenantId: tenant.id,
      name: 'Admin',
      description: 'Full access to all modules',
      isSystem: true,
    },
    update: {},
  });

  const salesManager = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Sales Manager' } },
    create: {
      tenantId: tenant.id,
      name: 'Sales Manager',
      description: 'Manages sales team and pipeline',
      isSystem: true,
    },
    update: {},
  });

  const salesRep = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Sales Rep' } },
    create: {
      tenantId: tenant.id,
      name: 'Sales Rep',
      description: 'Day-to-day sales work',
      isSystem: true,
    },
    update: {},
  });

  const readOnly = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Read-Only' } },
    create: {
      tenantId: tenant.id,
      name: 'Read-Only',
      description: 'Can view but not modify data',
      isSystem: true,
    },
    update: {},
  });

  console.log('→ wiring role↔permission');
  // Admin gets every permission.
  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      create: { roleId: adminRole.id, permissionId: p.id },
      update: {},
    });
  }
  // Sales Manager: read+write+delete across sales modules and activities.
  const salesScope = [
    'accounts',
    'contacts',
    'leads',
    'opportunities',
    'calls',
    'meetings',
    'tasks',
    'notes',
  ];
  for (const p of allPermissions.filter((p) => salesScope.includes(p.module))) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: salesManager.id, permissionId: p.id } },
      create: { roleId: salesManager.id, permissionId: p.id },
      update: {},
    });
  }
  // Sales Rep: read+write on sales scope (no delete).
  for (const p of allPermissions.filter(
    (p) => salesScope.includes(p.module) && p.action !== 'delete',
  )) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: salesRep.id, permissionId: p.id } },
      create: { roleId: salesRep.id, permissionId: p.id },
      update: {},
    });
  }
  // Read-only gets read across the board.
  for (const p of allPermissions.filter((p) => p.action === 'read')) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: readOnly.id, permissionId: p.id } },
      create: { roleId: readOnly.id, permissionId: p.id },
      update: {},
    });
  }

  console.log('→ seeding admin user (admin@example.com / admin123)');
  const passwordHash = await argon2.hash('admin123', { type: argon2.argon2id });
  const adminUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@example.com' } },
    create: {
      tenantId: tenant.id,
      email: 'admin@example.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
    },
    update: { passwordHash },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    create: { userId: adminUser.id, roleId: adminRole.id },
    update: {},
  });

  console.log('✓ seed complete');
  console.log(`  tenant : ${tenant.slug} (${tenant.id})`);
  console.log(`  admin  : admin@example.com / admin123`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
