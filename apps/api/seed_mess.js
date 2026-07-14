const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMessManager() {
  const email = 'mess@hostel.com';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Mess Manager already exists');
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'MESS_MANAGER',
    }
  });

  console.log('Mess Manager created: mess@hostel.com / password123');
}

createMessManager()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
