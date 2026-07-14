const prisma = require('../../config/database');
const { AppError, parsePagination, paginatedResponse } = require('../../utils/helpers');

const getAllRooms = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const { status, type, floorId } = query;

  const where = {
    ...(status && { status }),
    ...(type && { type }),
    ...(floorId && { floorId }),
  };

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: limit,
      include: {
        floor: {
          include: {
            block: {
              include: { hostel: true }
            }
          }
        },
        allocations: {
          where: { status: 'ACTIVE' },
          include: { student: true }
        }
      },
      orderBy: { roomNumber: 'asc' },
    }),
    prisma.room.count({ where }),
  ]);

  return paginatedResponse(rooms, total, page, limit);
};

const getAvailableRooms = async () => {
  return prisma.room.findMany({
    where: {
      status: 'AVAILABLE',
      currentOccupancy: {
        lt: prisma.room.fields.capacity
      }
    },
    include: {
      floor: {
        include: { block: true }
      }
    }
  });
};

const getRoomById = async (id) => {
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      floor: { include: { block: true } },
      allocations: {
        where: { status: 'ACTIVE' },
        include: { student: true }
      }
    }
  });

  if (!room) throw new AppError('Room not found', 404);
  return room;
};

const createRoom = async (data) => {
  return prisma.room.create({ data });
};

const updateRoom = async (id, data) => {
  return prisma.room.update({
    where: { id },
    data
  });
};

const deleteRoom = async (id) => {
  await prisma.room.delete({ where: { id } });
  return true;
};

module.exports = {
  getAllRooms,
  getAvailableRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
