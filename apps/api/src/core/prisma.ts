import { PrismaClient } from '@prisma/client';
import { loadConfig } from '../config.js';

const config = loadConfig();

export const prisma = new PrismaClient({
  log: config.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// Graceful shutdown helper — wired up by the server entrypoint.
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
