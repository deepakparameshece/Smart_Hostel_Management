const cron = require('node-cron');
const prisma = require('./database');
const feeService = require('../modules/fees/fee.service');
const foodService = require('../modules/food/food.service');
const billService = require('../modules/bills/bill.service');

const startScheduler = () => {
  console.log('⏰ Background task scheduler initialized');

  // 1. Automated Monthly Rent & Fee Invoicing
  // Runs at 00:00 on the 1st of every month: '0 0 1 * *'
  cron.schedule('0 0 1 * *', async () => {
    console.log('⚡ Running Automated Monthly Rent Invoicing Job...');
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const createdInvoices = await feeService.generateMonthlyInvoices(month, year);
      console.log(`✅ Monthly invoicing completed. Generated ${createdInvoices.length} invoices.`);
    } catch (error) {
      console.error('❌ Error running Monthly Rent Invoicing Job:', error);
    }
  });

  // 2. Daily Winner Mess Menu Finalization
  // Runs daily at 9:00 PM: '0 21 * * *'
  cron.schedule('0 21 * * *', async () => {
    console.log('⚡ Running Daily Mess Menu Finalization Job...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const menu = await foodService.finalizeDailyMenu(tomorrow);
      console.log(`✅ Daily menu finalized for ${tomorrow.toDateString()}. Breakfast: ${menu.breakfast}, Lunch: ${menu.lunch}, Dinner: ${menu.dinner}`);
    } catch (error) {
      console.error('❌ Error running Daily Mess Menu Finalization Job:', error);
    }
  });

  // 3. IoT-Enabled Electricity Bill Generation & Splitting
  // Runs monthly on the 28th at 00:00: '0 0 28 * *'
  cron.schedule('0 0 28 * *', async () => {
    console.log('⚡ Running IoT-Enabled Electricity Bill Generation & Splitting Job...');
    try {
      const activeRooms = await prisma.room.findMany({
        where: { currentOccupancy: { gt: 0 } }
      });

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      let generatedCount = 0;

      for (const room of activeRooms) {
        // Simulate meter reading: random units between 50 and 200
        const unitsConsumed = Math.floor(Math.random() * 150) + 50;
        const ratePerUnit = 10; // ₹10 per unit default
        
        await billService.generateBillAndSplit({
          roomId: room.id,
          month,
          year,
          unitsConsumed,
          ratePerUnit
        });
        generatedCount++;
      }

      console.log(`✅ IoT billing completed. Generated and split bills for ${generatedCount} occupied rooms.`);
    } catch (error) {
      console.error('❌ Error running IoT billing Job:', error);
    }
  });

  // 4. Daily Fee Payment Reminders (1 Day Before Due Date)
  // Runs daily at 9:00 AM: '0 9 * * *'
  cron.schedule('0 9 * * *', async () => {
    console.log('⚡ Running Daily Fee Payment Reminders Job...');
    try {
      const startOfTomorrow = new Date();
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      startOfTomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(startOfTomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const pendingPayments = await prisma.payment.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            gte: startOfTomorrow,
            lte: endOfTomorrow
          }
        },
        include: {
          student: { select: { userId: true } }
        }
      });

      console.log(`🔍 Found ${pendingPayments.length} pending payments due tomorrow.`);

      const { emitNotification } = require('../websocket/socket');
      for (const p of pendingPayments) {
        if (p.student?.userId) {
          await prisma.notification.create({
            data: {
              userId: p.student.userId,
              title: 'Fee Payment Reminder',
              message: `Reminder: Your payment of ₹${p.amount} for "${p.description}" is due tomorrow. Please pay to avoid late fees.`,
              type: 'WARNING'
            }
          });
          emitNotification(p.student.userId, {
            title: 'Fee Payment Reminder',
            message: `Your payment of ₹${p.amount} is due tomorrow.`
          });
        }
      }
      console.log('✅ Fee payment reminders sent.');
    } catch (error) {
      console.error('❌ Error running Fee Payment Reminders Job:', error);
    }
  });

  // Helper trigger to verify jobs easily in development (runs 5 seconds after startup)
  setTimeout(async () => {
    console.log('🧪 Run quick dry-run of daily menu finalization on startup for verification...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const menu = await foodService.finalizeDailyMenu(tomorrow);
      console.log(`🧪 Startup Dry-Run Menu: Breakfast=${menu.breakfast}, Lunch=${menu.lunch}, Dinner=${menu.dinner}`);
    } catch(err) {
      console.log('🧪 Startup Dry-Run Menu skip/fail (no active food options seeded or already exists)');
    }
  }, 5000);
};

module.exports = {
  startScheduler
};
