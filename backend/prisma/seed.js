import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load env before constructing PrismaClient
config({ path: new URL('../.env', import.meta.url).pathname });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskflow.com' },
    update: {},
    create: {
      email: 'admin@taskflow.com',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // Regular user
  const userPassword = await bcrypt.hash('User@1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'john@taskflow.com' },
    update: {},
    create: {
      email: 'john@taskflow.com',
      username: 'johndoe',
      passwordHash: userPassword,
    },
  });

  // Sample tasks
  const tasks = [
    { title: 'Set up CI/CD pipeline', status: 'IN_PROGRESS', priority: 'HIGH', tags: ['devops', 'infrastructure'] },
    { title: 'Write API documentation', status: 'TODO', priority: 'MEDIUM', tags: ['docs'] },
    { title: 'Implement authentication', status: 'DONE', priority: 'URGENT', tags: ['security', 'auth'] },
    { title: 'Design database schema', status: 'DONE', priority: 'HIGH', tags: ['database'] },
    { title: 'Add unit tests', status: 'TODO', priority: 'MEDIUM', tags: ['testing'] },
    { title: 'Deploy to staging', status: 'TODO', priority: 'HIGH', tags: ['devops'] },
    { title: 'Code review session', status: 'IN_PROGRESS', priority: 'LOW', tags: ['team'] },
  ];

  for (const task of tasks) {
    // Gunakan upsert atau pastikan database bersih sebelum push agar tidak duplikat saat dijalankan berulang kali
    await prisma.task.create({
      data: { ...task, userId: user.id },
    });
  }

  console.log('✅ Seeding complete');
  console.log('   Admin: admin@taskflow.com / Admin@123');
  console.log('   User:  john@taskflow.com  / User@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
