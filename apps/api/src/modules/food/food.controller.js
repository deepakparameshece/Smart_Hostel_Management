const foodService = require('./food.service');
const studentService = require('../students/student.service');

const getOptions = async (req, res, next) => {
  try {
    const options = await foodService.getOptions();
    res.json(options);
  } catch (error) {
    next(error);
  }
};

const getPoll = async (req, res, next) => {
  try {
    const student = await studentService.getStudentByUserId(req.user.id);
    const poll = await foodService.getTomorrowPoll(student.id);
    res.json(poll);
  } catch (error) {
    next(error);
  }
};

const vote = async (req, res, next) => {
  try {
    const { optionId, mealType } = req.body;
    const student = await studentService.getStudentByUserId(req.user.id);
    const result = await foodService.castVote(student.id, optionId, mealType);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getWinners = async (req, res, next) => {
  try {
    const { date } = req.query;
    let targetDate = date ? new Date(date) : null;
    if (!targetDate) {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 1); // Tomorrow!
    }
    const winners = await foodService.getDailyWinner(targetDate);
    res.json(winners);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await foodService.getFoodStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const createOption = async (req, res, next) => {
  try {
    const option = await foodService.createOption(req.body);
    res.status(201).json(option);
  } catch (error) {
    next(error);
  }
};

const deleteOption = async (req, res, next) => {
  try {
    await foodService.deleteOption(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const finalizeMenu = async (req, res, next) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = await foodService.finalizeDailyMenu(tomorrow);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOptions,
  getPoll,
  vote,
  getWinners,
  getStats,
  createOption,
  deleteOption,
  finalizeMenu
};
