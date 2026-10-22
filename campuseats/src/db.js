import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.ts';

if (!process.env.DATABASE_URL) {
	throw new Error('Falta DATABASE_URL: copia .env.example a .env y revisa el puerto');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter, log: ['query'] });
