const prisma = require('../../config/database');

const getStats = async (user) => {
  const { role, id } = user;

  if (role === 'ADMIN' || role === 'WARDEN') {
    const [
      totalStudents,
      occupiedRooms,
      totalRooms,
      pendingComplaints,
      revenueThisMonth,
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.room.count({ where: { status: 'OCCUPIED' } }),
      prisma.room.count(),
      prisma.complaint.count({ where: { status: 'OPEN' } }),
      prisma.payment.aggregate({
        where: {
          status: 'PAID',
          paidDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      })
    ]);

    return {
      totalStudents,
      occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
      pendingComplaints,
      monthlyRevenue: revenueThisMonth._sum.amount || 0,
    };
  }

  if (role === 'STUDENT') {
    const student = await prisma.student.findUnique({ where: { userId: id } });
    if (!student) return {};

    const [
      myComplaints,
      pendingPayments,
      attendancePercentage,
    ] = await Promise.all([
      prisma.complaint.count({ where: { studentId: student.id } }),
      prisma.payment.count({ where: { studentId: student.id, status: 'PENDING' } }),
      calculateAttendancePercentage(student.id)
    ]);

    return {
      myComplaints,
      pendingPayments,
      attendancePercentage,
    };
  }

  return {};
};

const getRecentActivities = async (user) => {
  const { role, id } = user;

  const where = role === 'STUDENT' 
    ? { student: { userId: id } }
    : {};

  return prisma.auditLog.findMany({
    where: role === 'STUDENT' ? { userId: id } : {},
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } }
  });
};

const calculateAttendancePercentage = async (studentId) => {
  const [presentCount, totalDays] = await Promise.all([
    prisma.attendance.count({ where: { studentId, status: 'PRESENT' } }),
    prisma.attendance.count({ where: { studentId } })
  ]);
  return totalDays > 0 ? (presentCount / totalDays) * 100 : 0;
};

module.exports = {
  getStats,
  getRecentActivities,
};
