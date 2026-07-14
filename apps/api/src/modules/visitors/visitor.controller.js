const visitorService = require('./visitor.service');

const getAllVisitors = async (req, res, next) => {
  try {
    const result = await visitorService.getAllVisitors(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getMyVisitors = async (req, res, next) => {
  try {
    const student = await require('../students/student.service').getStudentByUserId(req.user.id);
    const result = await visitorService.getVisitorsByStudentId(student.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getVisitorById = async (req, res, next) => {
  try {
    const visitor = await visitorService.getVisitorById(req.params.id);
    res.json(visitor);
  } catch (error) {
    next(error);
  }
};

const createVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.createVisitor(req.body);
    res.status(201).json(visitor);
  } catch (error) {
    next(error);
  }
};

const checkOutVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.checkOutVisitor(req.params.id);
    res.json(visitor);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVisitors,
  getMyVisitors,
  getVisitorById,
  createVisitor,
  checkOutVisitor,
};
