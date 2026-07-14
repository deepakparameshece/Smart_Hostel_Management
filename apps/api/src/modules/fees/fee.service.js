const prisma = require('../../config/database');
const { AppError, parsePagination, paginatedResponse } = require('../../utils/helpers');
const { v4: uuidv4 } = require('uuid');

const getAllPayments = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const { status, studentId } = query;

  const where = {
    ...(status && { status }),
    ...(studentId && { studentId }),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      include: {
        student: { include: { user: { select: { email: true } } } }
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.payment.count({ where }),
  ]);

  return paginatedResponse(payments, total, page, limit);
};

const getPaymentsByUserId = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new AppError('Student profile not found', 404);

  const where = { studentId: student.id };
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dueDate: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);

  return paginatedResponse(payments, total, page, limit);
};

const getOverduePayments = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const where = {
    status: 'PENDING',
    dueDate: { lt: new Date() }
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      include: { student: true },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.payment.count({ where }),
  ]);

  return paginatedResponse(payments, total, page, limit);
};

const getPaymentById = async (id) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { student: true }
  });
  if (!payment) throw new AppError('Payment record not found', 404);
  return payment;
};

const createPayment = async (data) => {
  const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return prisma.payment.create({
    data: {
      ...data,
      dueDate: new Date(data.dueDate),
      invoiceNumber
    }
  });
};

const updatePayment = async (id, data) => {
  return prisma.payment.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
    }
  });
};

const processPayment = async (id, data) => {
  const { transactionId, paymentMethod } = data;
  
  // Real implementation would verify with payment gateway
  return prisma.payment.update({
    where: { id },
    data: {
      status: 'PAID',
      paidDate: new Date(),
      transactionId,
      paymentMethod,
    }
  });
};

const generateMonthlyInvoices = async (month, year) => {
  const allocations = await prisma.allocation.findMany({
    where: { status: 'ACTIVE' },
    include: { student: true, room: true }
  });

  const createdInvoices = [];
  const dueDate = new Date(year, month - 1, 5); // 5th of the month

  for (const alloc of allocations) {
    const existing = await prisma.payment.findFirst({
      where: {
        studentId: alloc.studentId,
        description: { contains: `Rent - ${month}/${year}` }
      }
    });

    if (!existing) {
      const invoice = await createPayment({
        studentId: alloc.studentId,
        amount: alloc.room.monthlyRent,
        dueDate,
        description: `Hostel Rent - ${month}/${year}`,
        status: 'PENDING'
      });
      createdInvoices.push(invoice);
    }
  }

  return createdInvoices;
};

module.exports = {
  getAllPayments,
  getPaymentsByUserId,
  getOverduePayments,
  getPaymentById,
  createPayment,
  updatePayment,
  processPayment,
  generateMonthlyInvoices,
};
