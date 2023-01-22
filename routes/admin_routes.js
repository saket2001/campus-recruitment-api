const express = require("express");
const admin_routes = express.Router();
const adminController = require("../controllers/admin/authController");
///////////////////////////////////////
admin_routes.post("/signin", adminController.adminSignIn);


module.exports = admin_routes;