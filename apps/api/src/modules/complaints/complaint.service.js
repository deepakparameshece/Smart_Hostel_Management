const prisma = require('../../config/database');
const { AppError, parsePagination, paginatedResponse } = require('../../utils/helpers');
const { classifyComplaintAI } = require('../ai/ai.service');

const getAllComplaints = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const { status, priority, category } = query;

  const where = {
    ...(status && status !== 'ACTIVE' && { status }),
    ...(status === 'ACTIVE' && { status: { in: ['OPEN', 'IN_PROGRESS'] } }),
    ...(priority && { priority }),
    ...(category && { category }),
  };

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip,
      take: limit,
      include: {
        student: { include: { user: { select: { email: true } } } },
        assignedTo: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.complaint.count({ where }),
  ]);

  return paginatedResponse(complaints, total, page, limit);
};

const getComplaintsByUserId = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && ['ADMIN', 'WARDEN'].includes(user.role)) {
      return paginatedResponse([], 0, page, limit);
    }
    throw new AppError('Student profile not found', 404);
  }

  const where = { studentId: student.id };
  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.complaint.count({ where }),
  ]);

  return paginatedResponse(complaints, total, page, limit);
};

const getComplaintById = async (id) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: { student: true, assignedTo: true }
  });
  if (!complaint) throw new AppError('Complaint not found', 404);
  return complaint;
};

const createComplaint = async (data) => {
  // AI Feature: Real Gemini classification
  const aiResult = await classifyComplaintAI(data.description);
  
  const category = data.category || aiResult?.category || classifyComplaint(data.description);
  const priority = aiResult?.priority || data.priority || 'MEDIUM';

  const complaint = await prisma.complaint.create({
    data: {
      ...data,
      category,
      priority,
      aiClassification: aiResult ? `AI Classified: ${category}` : 'Heuristic Classified'
    }
  });

  // Notify all Admins and Wardens of the new complaint
  try {
    const student = await prisma.student.findUnique({
      where: { id: complaint.studentId }
    });
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'A student';

    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'WARDEN'] }
      }
    });

    const { emitNotification } = require('../../websocket/socket');
    for (const staff of staffUsers) {
      await prisma.notification.create({
        data: {
          userId: staff.id,
          title: 'New Complaint Registered',
          message: `${studentName} registered a new complaint: "${complaint.title}"`,
          type: 'INFO'
        }
      });
      emitNotification(staff.id, {
        title: 'New Complaint Registered',
        message: `${studentName} registered: "${complaint.title}"`
      });
    }
  } catch (error) {
    console.error('Error notifying staff users of new complaint:', error);
  }

  // Automated resolution mapping for specific categories
  const autoResolutions = {
    PLUMBING: 'Auto-Resolved: Plumber dispatched and plumbing leak repaired successfully.',
    ELECTRICAL: 'Auto-Resolved: Electrician resolved electrical issue and restored power.',
    WIFI: 'Auto-Resolved: IT technician rebooted the router and restored internet connectivity.',
    HOUSEKEEPING: 'Auto-Resolved: Housekeeping staff cleaned the requested area.',
    FURNITURE: 'Auto-Resolved: Carpentry worker repaired/replaced the damaged furniture item.'
  };

  if (autoResolutions[category]) {
    // Resolve asynchronously after 10 minutes (600,000 ms)
    setTimeout(async () => {
      try {
        // Fetch current status to check if it has already been resolved by Admin/Warden
        const current = await prisma.complaint.findUnique({
          where: { id: complaint.id }
        });
        
        if (current && (current.status === 'RESOLVED' || current.status === 'CLOSED')) {
          console.log(`Complaint #${complaint.id} was already resolved/closed manually by admin.`);
          return;
        }

        const resolution = autoResolutions[category];
        const updated = await prisma.complaint.update({
          where: { id: complaint.id },
          data: {
            status: 'RESOLVED',
            resolution,
            resolvedAt: new Date()
          },
          include: { student: { select: { userId: true } } }
        });

        const { emitNotification } = require('../../websocket/socket');
        await prisma.notification.create({
          data: {
            userId: updated.student.userId,
            title: 'Complaint Auto-Resolved',
            message: `Your complaint "${updated.title}" has been automatically resolved.`,
            type: 'INFO'
          }
        });
        emitNotification(updated.student.userId, { 
          title: 'Complaint Auto-Resolved', 
          message: `Your complaint "${updated.title}" has been resolved automatically.`,
          status: 'RESOLVED'
        });
      } catch (error) {
        console.error('Error in complaint auto-resolution background task:', error);
      }
    }, 600000);
  }

  return complaint;
};

const updateComplaint = async (id, data) => {
  const updated = await prisma.complaint.update({
    where: { id },
    data,
    include: { student: { select: { userId: true } } }
  });

  const { emitNotification } = require('../../websocket/socket');
  await prisma.notification.create({
    data: {
      userId: updated.student.userId,
      title: 'Complaint Update',
      message: `Your complaint "${updated.title}" has been updated to ${updated.status}.`,
      type: 'INFO'
    }
  });
  emitNotification(updated.student.userId, { title: 'Complaint Status', message: `Status: ${updated.status}` });

  return updated;
};

const resolveComplaint = async (id, resolution) => {
  return prisma.complaint.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolution,
      resolvedAt: new Date()
    }
  });
};

// Simple AI logic
const classifyComplaint = (description) => {
  const desc = description.toLowerCase();
  if (desc.includes('tap') || desc.includes('water') || desc.includes('leak') || desc.includes('flush')) return 'PLUMBING';
  if (desc.includes('light') || desc.includes('fan') || desc.includes('electricity') || desc.includes('power') || desc.includes('switch')) return 'ELECTRICAL';
  if (desc.includes('wifi') || desc.includes('internet') || desc.includes('network')) return 'WIFI';
  if (desc.includes('clean') || desc.includes('dust') || desc.includes('trash') || desc.includes('sweep')) return 'HOUSEKEEPING';
  if (desc.includes('lock') || desc.includes('thief') || desc.includes('stolen') || desc.includes('security')) return 'SECURITY';
  if (desc.includes('food') || desc.includes('mess') || desc.includes('canteen')) return 'FOOD';
  if (desc.includes('bed') || desc.includes('chair') || desc.includes('table') || desc.includes('furniture')) return 'FURNITURE';
  return 'OTHER';
};

module.exports = {
  getAllComplaints,
  getComplaintsByUserId,
  getComplaintById,
  createComplaint,
  updateComplaint,
  resolveComplaint,
};
