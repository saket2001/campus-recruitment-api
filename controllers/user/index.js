const authController= require('./authController')
const profileController = require("./profileController")
const jobController = require("./jobController");
const groupController = require("./groupController");
const notificationController = require('./notificationController');
///////////////////////////////////

const userControllers = {
  authController,
  profileController,
  jobController,
  groupController,
  notificationController,
};

module.exports = userControllers;