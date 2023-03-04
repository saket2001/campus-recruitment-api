const authController = require("./authController");
const groupController = require("./groupController");
const noticeController = require("./noticeController");
const manageController = require("./manageController");
///////////////////////////////////

const adminControllers = {
  authController,
  groupController,
  noticeController,
  manageController
};

module.exports = adminControllers;
