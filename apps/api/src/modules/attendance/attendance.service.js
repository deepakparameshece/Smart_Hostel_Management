const prisma = require('../../config/database');
const { AppError, parsePagination, paginatedResponse } = require('../../utils/helpers');

const getAllAttendance = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const { date, studentId, status } = query;

  const where = {
    ...(date && { date: new Date(date) }),
    ...(studentId && { studentId }),
    ...(status && { status }),
  };

  const [attendance, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      skip,
      take: limit,
      include: { student: true },
      orderBy: { date: 'desc' },
    }),
    prisma.attendance.count({ where }),
  ]);

  return paginatedResponse(attendance, total, page, limit);
};

const getAttendanceByStudentId = async (studentId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const where = { studentId };

  const [attendance, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
    }),
    prisma.attendance.count({ where }),
  ]);

  return paginatedResponse(attendance, total, page, limit);
};

const markAttendance = async (data) => {
  const { studentId, date, status, markedBy, notes } = data;
  const attendanceDate = new Date(date);

  return prisma.attendance.upsert({
    where: {
      studentId_date: {
        studentId,
        date: attendanceDate
      }
    },
    update: {
      status,
      markedBy,
      notes
    },
    create: {
      studentId,
      date: attendanceDate,
      status,
      markedBy,
      notes,
      method: 'MANUAL'
    }
  });
};

const bulkMarkAttendance = async (records, markedBy) => {
  const operations = records.map(record => {
    const attendanceDate = new Date(record.date);
    return prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: record.studentId,
          date: attendanceDate
        }
      },
      update: {
        status: record.status,
        markedBy
      },
      create: {
        studentId: record.studentId,
        date: attendanceDate,
        status: record.status,
        markedBy,
        method: 'BULK'
      }
    });
  });

  return prisma.$transaction(operations);
};

module.exports = {
  getAllAttendance,
  getAttendanceByStudentId,
  markAttendance,
  bulkMarkAttendance,
};
