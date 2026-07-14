const prisma = require('../../config/database');
const { AppError, parsePagination, paginatedResponse } = require('../../utils/helpers');

const getAllUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const { role, isActive, search } = query;

  const where = {
    ...(role && { role }),
    ...(isActive !== undefined && { isActive: isActive === 'true' }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { student: { firstName: { contains: search, mode: 'insensitive' } } },
        { student: { lastName: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return paginatedResponse(users, total, page, limit);
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { student: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Sanitize
  delete user.passwordHash;
  return user;
};

const updateUser = async (id, data) => {
  const updateData = { ...data };
  if (data.password) {
    const bcrypt = require('bcryptjs');
    updateData.passwordHash = await bcrypt.hash(data.password, 12);
    delete updateData.password;
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    include: { student: true },
  });

  delete user.passwordHash;
  return user;
};

const deleteUser = async (id) => {
  await prisma.user.delete({ where: { id } });
  return true;
};

const getMyNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
};

const markNotificationsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMyNotifications,
  markNotificationsRead,
};
