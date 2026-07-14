const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting full system seeding...');

  // 1. CLEANUP (Ensures fresh seeding)
  await prisma.allocation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.room.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.block.deleteMany();
  await prisma.hostel.deleteMany();

  // 2. AUTH / USERS
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: { role: 'ADMIN', passwordHash: hashedPassword },
    create: { email: 'admin@gmail.com', passwordHash: hashedPassword, role: 'ADMIN' }
  });



  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
