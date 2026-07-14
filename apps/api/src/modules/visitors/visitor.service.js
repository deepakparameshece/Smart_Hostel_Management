const prisma = require('../../config/database');
const { AppError, parsePagination, paginatedResponse } = require('../../utils/helpers');
const QRCode = require('qrcode');

const getAllVisitors = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const { status, studentId } = query;

  const where = {
    ...(status && { status }),
    ...(studentId && { studentId }),
  };

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where,
      skip,
      take: limit,
      include: { student: true },
      orderBy: { checkIn: 'desc' },
    }),
    prisma.visitor.count({ where }),
  ]);

  return paginatedResponse(visitors, total, page, limit);
};

const getVisitorsByStudentId = async (studentId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const where = { studentId };

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { checkIn: 'desc' },
    }),
    prisma.visitor.count({ where }),
  ]);

  return paginatedResponse(visitors, total, page, limit);
};

const getVisitorById = async (id) => {
  const visitor = await prisma.visitor.findUnique({
    where: { id },
    include: { student: true }
  });
  if (!visitor) throw new AppError('Visitor record not found', 404);
  return visitor;
};

const createVisitor = async (data) => {
  // Generate QR Code data
  const qrData = JSON.stringify({
    visitorName: data.visitorName,
    studentId: data.studentId,
    timestamp: Date.now()
  });

  const qrCodeBase64 = await QRCode.toDataURL(qrData);

  return prisma.visitor.create({
    data: {
      ...data,
      qrCode: qrCodeBase64,
      status: 'CHECKED_IN'
    }
  });
};

const checkOutVisitor = async (id) => {
  return prisma.visitor.update({
    where: { id },
    data: {
      status: 'CHECKED_OUT',
      checkOut: new Date()
    }
  });
};

module.exports = {
  getAllVisitors,
  getVisitorsByStudentId,
  getVisitorById,
  createVisitor,
  checkOutVisitor,
};
