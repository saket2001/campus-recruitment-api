const authController = require("./authController");
const groupController = require("./groupController");
const noticeController = require("./noticeController");
const manageController = require("./manageController");
const jobController = require("./jobController");
///////////////////////////////////

const adminControllers = {
  authController,
  groupController,
  noticeController,
  manageController,
  jobController,
};

module.exports = adminControllers;
