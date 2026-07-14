const prisma = require('../../config/database');
const { AppError, parsePagination, paginatedResponse } = require('../../utils/helpers');

const getAllStudents = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const { status, search, course } = query;

  const where = {
    ...(status && { status }),
    ...(course && { course }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      include: { 
        user: { 
          select: { email: true, avatar: true, isActive: true } 
        },
        allocations: {
          where: { status: 'ACTIVE' },
          include: { room: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.count({ where }),
  ]);

  return paginatedResponse(students, total, page, limit);
};

const getStudentById = async (id) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { 
      user: { select: { email: true, avatar: true, role: true } },
      allocations: { include: { room: true } },
      complaints: true,
      payments: true
    },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  return student;
};

const getStudentByUserId = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { 
      user: { select: { email: true, avatar: true } },
      allocations: { 
        where: { status: 'ACTIVE' },
        include: { room: true } 
      }
    },
  });

  if (!student) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && ['ADMIN', 'WARDEN'].includes(user.role)) {
      return {
        id: 'staff-placeholder',
        userId,
        firstName: user.role === 'ADMIN' ? 'System' : 'Warden',
        lastName: user.role === 'ADMIN' ? 'Admin' : 'Officer',
        phone: '',
        address: '',
        city: '',
        allocations: [],
        user: { email: user.email, avatar: user.avatar }
      };
    }
    throw new AppError('Student profile not found', 404);
  }

  return student;
};

const updateStudent = async (id, data) => {
  return prisma.student.update({
    where: { id },
    data,
    include: { user: { select: { email: true } } },
  });
};

const updateStudentByUserId = async (userId, data) => {
  return prisma.student.update({
    where: { userId },
    data,
  });
};

const deleteStudent = async (id) => {
  // This usually involves deleting the user as well
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new AppError('Student not found', 404);
  
  await prisma.user.delete({ where: { id: student.userId } });
  return true;
};

const updateUserAvatar = async (userId, avatarPath) => {
  return prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarPath },
    select: { id: true, email: true, avatar: true, role: true }
  });
};

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentByUserId,
  updateStudent,
  updateStudentByUserId,
  deleteStudent,
  updateUserAvatar,
};
