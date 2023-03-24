const express = require("express");
const common_routes = express.Router();
const authMethods = require("../utils/auth");
// const recruiterControllers = require("../controllers/recruiter");
const adminControllers = require("../controllers/admin");
const ROLES_LIST = require("../constants/roles_list");
////////////////////////////////////////////

// common routes
common_routes.post(
  "/refresh-login",
  authMethods.refreshToken,
);

// jobs
common_routes.get(
  "/get-jobs",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin, ROLES_LIST.user),
  adminControllers.jobController.getJobs
);

common_routes.get(
  "/get-job/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin, ROLES_LIST.user),
  adminControllers.jobController.getJobById
);

common_routes.get(
  "/get-filters",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  adminControllers.jobController.getFilter
);
common_routes.get(
  "/get-details/:recruiter_id/:company_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  adminControllers.jobController.getDetails
);

common_routes.get(
  "/get-job-round-details/:job_id/:view",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin, ROLES_LIST.user),
  adminControllers.jobController.getJobRoundDetails
);

// notice
common_routes.get(
  "/get-notices/:group_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(
    ROLES_LIST.admin,
    ROLES_LIST.user
  ),
  adminControllers.noticeController.viewAllNotices
);
common_routes.get(
  "/get-notice/:notice_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(
    ROLES_LIST.admin,
    ROLES_LIST.user
  ),
  adminControllers.noticeController.viewNotice
);

////////////////////////////////////////////
module.exports = common_routes;
