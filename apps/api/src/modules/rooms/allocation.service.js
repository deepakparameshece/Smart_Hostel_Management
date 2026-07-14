const prisma = require('../../config/database');
const { AppError, parsePagination, paginatedResponse } = require('../../utils/helpers');

const getAllAllocations = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const { status, studentId, roomId } = query;

  const where = {
    ...(status && { status }),
    ...(studentId && { studentId }),
    ...(roomId && { roomId }),
  };

  const [allocations, total] = await Promise.all([
    prisma.allocation.findMany({
      where,
      skip,
      take: limit,
      include: {
        student: { include: { user: { select: { email: true } } } },
        room: { include: { floor: { include: { block: true } } } }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.allocation.count({ where }),
  ]);

  return paginatedResponse(allocations, total, page, limit);
};

const getAllocationByStudentId = async (userId) => {
  // Find student first
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new AppError('Student profile not found', 404);

  const allocation = await prisma.allocation.findFirst({
    where: { studentId: student.id, status: 'ACTIVE' },
    include: {
      room: { include: { floor: { include: { block: true } } } }
    }
  });

  return allocation;
};

const getAllocationById = async (id) => {
  const allocation = await prisma.allocation.findUnique({
    where: { id },
    include: {
      student: true,
      room: true
    }
  });

  if (!allocation) throw new AppError('Allocation not found', 404);
  return allocation;
};

const allocateRoom = async (data) => {
  const { studentId, roomId, startDate, endDate, notes } = data;

  // Check if student already has active allocation
  const activeAlloc = await prisma.allocation.findFirst({
    where: { studentId, status: 'ACTIVE' }
  });

  if (activeAlloc) {
    throw new AppError('Student already has an active room allocation', 400);
  }

  // Check room capacity
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new AppError('Room not found', 404);
  if (room.status !== 'AVAILABLE' && room.status !== 'OCCUPIED') {
    throw new AppError('Room is not available for allocation', 400);
  }
  if (room.currentOccupancy >= room.capacity) {
    throw new AppError('Room is already at full capacity', 400);
  }

  return prisma.$transaction(async (tx) => {
    // Create allocation
    const allocation = await tx.allocation.create({
      data: {
        studentId,
        roomId,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: 'ACTIVE',
        notes
      }
    });

    // Update room occupancy
    await tx.room.update({
      where: { id: roomId },
      data: {
        currentOccupancy: { increment: 1 },
        status: (room.currentOccupancy + 1 >= room.capacity) ? 'OCCUPIED' : 'AVAILABLE'
      }
    });

    // Send Notification
    const { emitNotification } = require('../../websocket/socket');
    const studentUser = await tx.student.findUnique({ where: { id: studentId }, select: { userId: true } });
    if (studentUser) {
      await tx.notification.create({
        data: {
          userId: studentUser.userId,
          title: 'Room Allocated',
          message: `Congratulations! You have been allocated Room ${room.roomNumber}.`,
          type: 'SUCCESS'
        }
      });
      emitNotification(studentUser.userId, { title: 'Room Allocated', message: `Room ${room.roomNumber} assigned.` });
    }

    return allocation;
  });
};

const vacateRoom = async (id) => {
  const allocation = await prisma.allocation.findUnique({
    where: { id },
    include: { room: true }
  });

  if (!allocation || allocation.status !== 'ACTIVE') {
    throw new AppError('Active allocation not found', 404);
  }

  return prisma.$transaction(async (tx) => {
    // Update allocation
    const updatedAlloc = await tx.allocation.update({
      where: { id },
      data: {
        status: 'VACATED',
        endDate: new Date()
      }
    });

    // Update room occupancy
    await tx.room.update({
      where: { id: allocation.roomId },
      data: {
        currentOccupancy: { decrement: 1 },
        status: 'AVAILABLE'
      }
    });

    return updatedAlloc;
  });
};

const smartAllocate = async (studentId) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AppError('Student not found', 404);

  const preferences = typeof student.preferences === 'string' 
    ? JSON.parse(student.preferences) 
    : (student.preferences || {});
  const { preferredFloor, preferredType, needsAmenities } = preferences;

  // 1. Fetch all available rooms
  const rooms = await prisma.room.findMany({
    where: {
      status: 'AVAILABLE',
      currentOccupancy: { lt: prisma.room.fields.capacity }
    },
    include: { floor: true }
  });

  if (rooms.length === 0) {
    throw new AppError('No available rooms found in the system', 404);
  }

  // 2. Scoring algorithm
  const scoredRooms = rooms.map(room => {
    let score = 0;

    // Preference matching: Room Type (Weight: 40)
    if (preferredType && room.type === preferredType) score += 40;

    // Preference matching: Floor Level (Weight: 30)
    if (preferredFloor !== undefined && room.floor.floorNumber === preferredFloor) score += 30;

    // Preference matching: Amenities (Weight: 20)
    if (needsAmenities && Array.isArray(needsAmenities) && room.amenities) {
      const roomAmenities = typeof room.amenities === 'string' ? JSON.parse(room.amenities) : (room.amenities || []);
      const matchCount = needsAmenities.filter(a => roomAmenities.includes(a)).length;
      score += (matchCount / needsAmenities.length) * 20;
    }

    // Optimization: Prefer rooms with existing occupants to maximize space (Weight: 10)
    if (room.currentOccupancy > 0) score += 10;

    return { ...room, score };
  });

  // 3. Sort by score descending and return the top match
  const bestMatch = scoredRooms.sort((a, b) => b.score - a.score)[0];

  return {
    bestMatch,
    score: bestMatch.score,
    allCandidates: scoredRooms.slice(0, 5) // Return top 5 for manual selection if needed
  };
};

module.exports = {
  getAllAllocations,
  getAllocationByStudentId,
  getAllocationById,
  allocateRoom,
  vacateRoom,
  smartAllocate,
};
