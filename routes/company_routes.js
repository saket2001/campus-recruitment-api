const express = require("express");
const company_routes = express.Router();
const companyController = require("../controllers/company/index");

///////////////////////////////////////
company_routes.post(
  "/register",
  companyController.authController.companyRegistration
);

module.exports = company_routes;
