const express = require("express");
const common_routes = express.Router();
const authMethods = require("../utils/auth");
const recruiterControllers = require("../controllers/recruiter");
const adminControllers = require("../controllers/admin");
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

// notice
common_routes.get(
  "/get-notices/:group_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(
    ROLES_LIST.admin,
    ROLES_LIST.recruiter,
    ROLES_LIST.user
  ),
  adminControllers.noticeController.viewAllNotices
);
common_routes.get(
  "/get-notice/:notice_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(
    ROLES_LIST.admin,
    ROLES_LIST.recruiter,
    ROLES_LIST.user
  ),
  adminControllers.noticeController.viewNotice
);

////////////////////////////////////////////
module.exports = common_routes;
