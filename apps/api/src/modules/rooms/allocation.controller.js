const allocationService = require('./allocation.service');

const getAllAllocations = async (req, res, next) => {
  try {
    const result = await allocationService.getAllAllocations(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getMyAllocation = async (req, res, next) => {
  try {
    const allocation = await allocationService.getAllocationByStudentId(req.user.id);
    res.json(allocation);
  } catch (error) {
    next(error);
  }
};

const getAllocationById = async (req, res, next) => {
  try {
    const allocation = await allocationService.getAllocationById(req.params.id);
    res.json(allocation);
  } catch (error) {
    next(error);
  }
};

const allocateRoom = async (req, res, next) => {
  try {
    const allocation = await allocationService.allocateRoom(req.body);
    res.status(201).json(allocation);
  } catch (error) {
    next(error);
  }
};

const vacateRoom = async (req, res, next) => {
  try {
    const allocation = await allocationService.vacateRoom(req.params.id);
    res.json(allocation);
  } catch (error) {
    next(error);
  }
};

const smartAllocate = async (req, res, next) => {
  try {
    const result = await allocationService.smartAllocate(req.body.studentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAllocations,
  getMyAllocation,
  getAllocationById,
  allocateRoom,
  vacateRoom,
  smartAllocate,
};
