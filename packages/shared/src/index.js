const authValidators = require('./validators/auth.validator');
const userValidators = require('./validators/user.validator');
const studentValidators = require('./validators/student.validator');
const roomValidators = require('./validators/room.validator');
const feeValidators = require('./validators/fee.validator');
const miscValidators = require('./validators/misc.validator');

module.exports = {
  ...authValidators,
  ...userValidators,
  ...studentValidators,
  ...roomValidators,
  ...feeValidators,
  ...miscValidators,
};
