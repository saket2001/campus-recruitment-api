const authController = require("./authController");
const groupController = require("./groupController");
const noticeController = require("./noticeController");
///////////////////////////////////

const adminControllers = {
  authController,
  groupController,
  noticeController,
};

module.exports = adminControllers;
