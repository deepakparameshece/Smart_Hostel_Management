const dashboardService = require('./dashboard.service');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats(req.user);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const getRecentActivities = async (req, res, next) => {
  try {
    const activities = await dashboardService.getRecentActivities(req.user);
    res.json(activities);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getRecentActivities,
};
