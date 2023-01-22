const authController = require("./authController");
const JobController = require("./JobController");
///////////////////////////////////

const recruiterControllers = {
  authController,
  JobController,
};

module.exports = recruiterControllers;
