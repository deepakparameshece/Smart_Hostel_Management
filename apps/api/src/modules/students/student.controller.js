const studentService = require('./student.service');
const { AppError } = require('../../utils/helpers');

const getMyProfile = async (req, res, next) => {
  try {
    const student = await studentService.getStudentByUserId(req.user.id);
    res.json(student);
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const student = await studentService.updateStudentByUserId(req.user.id, req.body);
    res.json(student);
  } catch (error) {
    next(error);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const result = await studentService.getAllStudents(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.json(student);
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.json(student);
  } catch (error) {
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    await studentService.deleteStudent(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const uploadIdProof = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const student = await studentService.updateStudent(req.params.id, { idProofUrl: req.file.path });
    res.json(student);
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const normalizedPath = req.file.path.replace(/\\/g, '/');
    const user = await studentService.updateUserAvatar(req.user.id, normalizedPath);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadIdProof,
  uploadAvatar,
};
