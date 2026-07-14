const prisma = require('../../config/database');

const generateBillAndSplit = async ({ roomId, month, year, unitsConsumed, ratePerUnit }) => {
  const rate = ratePerUnit !== undefined ? Number(ratePerUnit) : 10;
  const totalAmount = unitsConsumed * rate;

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error('Room not found');

  const bill = await prisma.electricityBill.upsert({
    where: {
      roomId_month_year: { roomId, month, year }
    },
    update: { unitsConsumed, totalAmount, ratePerUnit: rate },
    create: {
      roomId,
      month,
      year,
      unitsConsumed,
      ratePerUnit: rate,
      totalAmount
    }
  });

  // Automatically add the electricity bill with the room rent to users allocated in this room
  const activeAllocations = await prisma.allocation.findMany({
    where: { roomId, status: 'ACTIVE' }
  });

  if (activeAllocations.length > 0) {
    // Split the amount among the room occupants
    const shareAmount = totalAmount / activeAllocations.length;
    const paymentDescription = `Electricity Bill (Room ${room.roomNumber}) - ${month}/${year}`;
    const dueDate = new Date(year, month - 1, 15); // Due on 15th of the month

    for (const alloc of activeAllocations) {
      const existingPayment = await prisma.payment.findFirst({
        where: {
          studentId: alloc.studentId,
          description: paymentDescription
        }
      });

      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: { amount: shareAmount }
        });
      } else {
        await prisma.payment.create({
          data: {
            studentId: alloc.studentId,
            amount: shareAmount,
            dueDate,
            description: paymentDescription,
            status: 'PENDING',
            invoiceNumber: 'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase()
          }
        });
      }
    }
  }

  return bill;
};

module.exports = {
  generateBillAndSplit
};
