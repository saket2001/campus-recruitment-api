const express = require("express");
const common_routes = express.Router();
const authMethods = require("../utils/auth");
const recruiterControllers = require("../controllers/recruiter");
const ROLES_LIST = require("../constants/roles_list");
////////////////////////////////////////////

// common routes
common_routes.get(
  "/get-jobs",
  authMethods.authenticateToken,
  authMethods.verifyUser(
    ROLES_LIST.recruiter,
    ROLES_LIST.admin,
    ROLES_LIST.user
  ),
  recruiterControllers.JobController.getJobs
);

common_routes.get(
  "/get-job/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(
    ROLES_LIST.recruiter,
    ROLES_LIST.admin,
    ROLES_LIST.user
  ),
  recruiterControllers.JobController.getJobById
);

common_routes.get(
  "/get-filters",
  authMethods.authenticateToken,
  authMethods.verifyUser(
    ROLES_LIST.user,
    ROLES_LIST.recruiter,
    ROLES_LIST.admin
  ),
  recruiterControllers.JobController.getFilter
);
common_routes.get(
  "/get-details/:recruiter_id/:company_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(
    ROLES_LIST.user,
    ROLES_LIST.recruiter,
    ROLES_LIST.admin
  ),
  recruiterControllers.JobController.getDetails
);
// common_routes.post(
//   "/get-requested-jobs",
//   authMethods.authenticateToken,
//   authMethods.verifyUser(
//     ROLES_LIST.user,
//     ROLES_LIST.recruiter,
//     ROLES_LIST.admin
//   ),
//   userController.jobController.getRequestedJobs
// );
////////////////////////////////////////////
module.exports = common_routes;
