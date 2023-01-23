const authController= require('./authController')
const profileController = require("./profileController")
const jobController = require("./jobController");
const groupController = require("./groupController");

///////////////////////////////////

const userControllers = {
    authController,
    profileController,
    jobController,
    groupController
}

module.exports = userControllers;