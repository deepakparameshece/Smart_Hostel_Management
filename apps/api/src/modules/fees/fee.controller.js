const feeService = require('./fee.service');

const getAllPayments = async (req, res, next) => {
  try {
    const result = await feeService.getAllPayments(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getMyPayments = async (req, res, next) => {
  try {
    const result = await feeService.getPaymentsByUserId(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getOverduePayments = async (req, res, next) => {
  try {
    const result = await feeService.getOverduePayments(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await feeService.getPaymentById(req.params.id);
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const payment = await feeService.createPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const payment = await feeService.updatePayment(req.params.id, req.body);
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

const processPayment = async (req, res, next) => {
  try {
    // This would ideally integrate with Stripe/Razorpay
    const payment = await feeService.processPayment(req.params.id, req.body);
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

const generateMonthlyInvoices = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const result = await feeService.generateMonthlyInvoices(month, year);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPayments,
  getMyPayments,
  getOverduePayments,
  getPaymentById,
  createPayment,
  updatePayment,
  processPayment,
  generateMonthlyInvoices,
};
