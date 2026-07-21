import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient, UserRole, UserStatus } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@example.com';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists.');
    return;
  }

  const password = await bcrypt.hash('Admin@123', 10);

  await prisma.user.create({
    data: {
      firstName: 'System',
      lastName: 'Admin',
      email,
      password,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Admin user created.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
