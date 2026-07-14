const attendanceService = require('./attendance.service');

const getAllAttendance = async (req, res, next) => {
  try {
    const result = await attendanceService.getAllAttendance(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const student = await require('../students/student.service').getStudentByUserId(req.user.id);
    const result = await attendanceService.getAttendanceByStudentId(student.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const attendance = await attendanceService.markAttendance({ ...req.body, markedBy: req.user.id });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

const bulkMarkAttendance = async (req, res, next) => {
  try {
    const result = await attendanceService.bulkMarkAttendance(req.body.records, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAttendance,
  getMyAttendance,
  markAttendance,
  bulkMarkAttendance,
};
