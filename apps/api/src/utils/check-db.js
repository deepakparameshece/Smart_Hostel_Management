const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConnection() {
  try {
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully!');
    
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);
    
    const roomCount = await prisma.room.count();
    console.log(`📊 Current room count: ${roomCount}`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
