const prisma = require('../../config/database');
const { AppError } = require('../../utils/helpers');

const getOptions = async () => {
  return prisma.foodOption.findMany();
};

const getTomorrowPoll = async (studentId) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const options = await prisma.foodOption.findMany();
  const myVotes = await prisma.foodVote.findMany({
    where: {
      studentId,
      date: tomorrow
    }
  });

  const allVotes = await prisma.foodVote.groupBy({
    by: ['optionId'],
    _count: { _all: true },
    where: { date: tomorrow }
  });

  return {
    date: tomorrow,
    options,
    myVotes,
    results: allVotes
  };
};

const VOTING_CUTOFF_HOUR = 22; // 10:00 PM

const castVote = async (studentId, optionId, mealType) => {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // If now is after 10PM, voting is closed for tomorrow
  if (now.getHours() >= VOTING_CUTOFF_HOUR) {
    throw new AppError('Voting for tomorrow is closed. Deadline was 10:00 PM.', 400);
  }

  // Check if option exists and matches mealType
  const option = await prisma.foodOption.findUnique({ where: { id: optionId } });
  if (!option || option.mealType !== mealType) {
    throw new AppError('Invalid food option for this meal', 400);
  }

  // Upsert vote
  return prisma.foodVote.upsert({
    where: {
      studentId_date_mealType: {
        studentId,
        date: tomorrow,
        mealType
      }
    },
    update: { optionId },
    create: {
      studentId,
      optionId,
      mealType,
      date: tomorrow
    }
  });
};

/**
 * Finalizes the menu for a given date (usually tomorrow) based on current votes
 */
const finalizeDailyMenu = async (date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const totalStudents = await prisma.student.count({ where: { status: 'ACTIVE' } });
  const meals = ['BREAKFAST', 'LUNCH', 'DINNER'];
  const menuData = { 
    date: targetDate,
    breakfast: null,
    lunch: null,
    dinner: null,
    totalCost: 0
  };

  for (const meal of meals) {
    const counts = await prisma.foodVote.groupBy({
      by: ['optionId'],
      _count: { optionId: true },
      where: { date: targetDate, mealType: meal },
      orderBy: { _count: { optionId: 'desc' } }
    });

    if (counts.length > 0) {
      const maxVotes = counts[0]._count.optionId;
      const topOptionIds = counts
        .filter(c => c._count.optionId === maxVotes)
        .map(c => c.optionId);

      // Fetch full details for these options to compare prices
      const candidates = await prisma.foodOption.findMany({
        where: { id: { in: topOptionIds } },
        orderBy: { pricePerPlate: 'asc' } // Lowest price first
      });

      const winner = candidates[0]; // Tie-breaker: Lowest price winner
      const mealKey = meal.toLowerCase();
      menuData[mealKey] = winner.name;
      menuData.totalCost += winner.pricePerPlate * totalStudents;
    }
  }

  return prisma.foodMenu.upsert({
    where: { date: targetDate },
    update: menuData,
    create: menuData
  });
};

const getDailyWinner = async (date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const totalStudents = await prisma.student.count({ where: { status: 'ACTIVE' } });

  // First check if there is a finalized menu for this date
  const finalized = await prisma.foodMenu.findUnique({
    where: { date: targetDate }
  });

  if (finalized) {
    const breakfastOpt = finalized.breakfast ? await prisma.foodOption.findFirst({ where: { name: finalized.breakfast } }) : null;
    const lunchOpt = finalized.lunch ? await prisma.foodOption.findFirst({ where: { name: finalized.lunch } }) : null;
    const dinnerOpt = finalized.dinner ? await prisma.foodOption.findFirst({ where: { name: finalized.dinner } }) : null;

    return {
      totalStudents,
      meals: {
        breakfast: finalized.breakfast ? {
          name: finalized.breakfast,
          pricePerPlate: breakfastOpt?.pricePerPlate || 0,
          totalVotes: 'Finalized',
          totalCost: (breakfastOpt?.pricePerPlate || 0) * totalStudents
        } : null,
        lunch: finalized.lunch ? {
          name: finalized.lunch,
          pricePerPlate: lunchOpt?.pricePerPlate || 0,
          totalVotes: 'Finalized',
          totalCost: (lunchOpt?.pricePerPlate || 0) * totalStudents
        } : null,
        dinner: finalized.dinner ? {
          name: finalized.dinner,
          pricePerPlate: dinnerOpt?.pricePerPlate || 0,
          totalVotes: 'Finalized',
          totalCost: (dinnerOpt?.pricePerPlate || 0) * totalStudents
        } : null
      }
    };
  }

  const meals = ['BREAKFAST', 'LUNCH', 'DINNER'];
  const results = { totalStudents, meals: {} };

  for (const meal of meals) {
    const counts = await prisma.foodVote.groupBy({
      by: ['optionId'],
      _count: { optionId: true },
      where: { date: targetDate, mealType: meal },
      orderBy: { _count: { optionId: 'desc' } }
    });

    if (counts.length > 0) {
      const maxVotes = counts[0]._count.optionId;
      const topOptionIds = counts
        .filter(c => c._count.optionId === maxVotes)
        .map(c => c.optionId);

      const candidates = await prisma.foodOption.findMany({
        where: { id: { in: topOptionIds } },
        orderBy: { pricePerPlate: 'asc' } // Lowest price first
      });

      const opt = candidates[0];
      results.meals[meal.toLowerCase()] = {
        name: opt.name,
        pricePerPlate: opt.pricePerPlate,
        totalVotes: maxVotes,
        totalCost: opt.pricePerPlate * totalStudents
      };
    }
  }

  return results;
};

const createOption = async (data) => {
  return prisma.foodOption.create({
    data
  });
};

const deleteOption = async (id) => {
  return prisma.foodOption.delete({
    where: { id }
  });
};

const getFoodStats = async () => {
  const totalStudents = await prisma.student.count({ where: { status: 'ACTIVE' } });
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const totalVotesTomorrow = await prisma.foodVote.count({
    where: { date: tomorrow }
  });

  const voteBreakdown = await prisma.foodVote.groupBy({
    by: ['mealType'],
    _count: { _all: true },
    where: { date: tomorrow }
  });

  const optionWise = await prisma.foodVote.groupBy({
    by: ['optionId', 'mealType'],
    _count: { _all: true },
    where: { date: tomorrow }
  });

  // Attach option names for convenience
  const options = await prisma.foodOption.findMany({
    where: { id: { in: optionWise.map(o => o.optionId) } }
  });

  const detailedBreakdown = optionWise.map(ov => ({
    ...ov,
    name: options.find(o => o.id === ov.optionId)?.name || 'Unknown'
  }));

  return {
    totalStudents,
    totalVotesTomorrow,
    voteBreakdown,
    optionWiseBreakdown: detailedBreakdown,
    date: tomorrow
  };
};

module.exports = {
  getOptions,
  getTomorrowPoll,
  castVote,
  getDailyWinner,
  createOption,
  deleteOption,
  getFoodStats,
  finalizeDailyMenu
};
