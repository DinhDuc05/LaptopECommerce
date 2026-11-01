import { PrismaClient } from '@prisma/client';

// Cấu hình PrismaClient với log tối thiểu để tiết kiệm CPU và bộ nhớ
let prisma: PrismaClient | null = null;
let isDbConnected = false;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    // Chạy truy vấn ping nhẹ nhất
    await client.$queryRaw`SELECT 1 as Ping`;
    isDbConnected = true;
    console.log('[DATABASE] Successfully connected to SQL Server (Max Pool Size: 5)');
    return true;
  } catch (error: any) {
    isDbConnected = false;
    console.warn('[DATABASE] SQL Server connection unavailable:', error.message);
    console.warn('[DATABASE] Falling back to high-performance in-memory dataset mode.');
    return false;
  }
}

export function isDatabaseActive(): boolean {
  return isDbConnected;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    console.log('[DATABASE] Prisma disconnected cleanly.');
  }
}
