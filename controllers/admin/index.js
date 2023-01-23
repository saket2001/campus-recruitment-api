const authController = require("./authController");
const groupController = require("./groupController");

///////////////////////////////////

const adminControllers = {
  authController,
  groupController,
};

module.exports = adminControllers;
