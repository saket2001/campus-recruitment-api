const authController= require('./authController')
const profileController = require("./profileController")
const jobController = require("./jobController");

///////////////////////////////////

const userControllers = {
    authController,
    profileController,
    jobController,
}

module.exports = userControllers;