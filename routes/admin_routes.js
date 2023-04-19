const express = require("express");
const adminController = require("../controllers/admin/index");
const authMethods = require("../utils/auth");
const ROLES_LIST = require("../constants/roles_list");
const uploadLimit = 2 * 1024 * 1024; // 2MB
const multer = require("multer");
const admin_routes = express.Router();
///////////////////////////////////////
const multerConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files/uploads/recruiter/files/");
  },
  filename: function (req, file, cb) {
    if (file) {
      const allowedImgTypes = ["application/pdf"];
      if (!allowedImgTypes.includes(file.mimetype)) return;
      console.log(file);

      const user_id = req.user.id;
      req.files = file;
      req.filePath = `files/uploads/recruiter/files/${
        user_id + "-" + file.originalname
      }`;
      cb(null, user_id + "-" + file.originalname);
    }
  },
});
// for job detail file
const recruiterFileUpload = multer({
  storage: multerConfig,
  limits: { fileSize: uploadLimit },
});

///////////////////////////////////////

// auth
admin_routes.post("/signin", adminController.authController.adminSignIn);

// group
admin_routes.post(
  "/create-group",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.groupController.createGroup
);
admin_routes.get(
  "/my-groups",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.groupController.getMyGroups
);
admin_routes.get(
  "/get-group-members/:group_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  adminController.groupController.getMembersDetails
);
admin_routes.delete(
  "/delete-group",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.groupController.deleteGroup
);
admin_routes.delete(
  "/delete-group-member",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.groupController.deleteGroupMember
);

// notice routes
admin_routes.post(
  "/create-notice",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.noticeController.createNotice
);
admin_routes.delete(
  "/delete-notice/:notice_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.noticeController.deleteNotice
);
admin_routes.put(
  "/edit-notice/:notice_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.noticeController.editNotice
);

// manage users
admin_routes.get(
  "/get-candidates/:year",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.manageController.getAllUsers
);
admin_routes.delete(
  "/remove-candidate/:user_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.manageController.deleteUser
);
admin_routes.get(
  "/verify-user/:user_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.manageController.toggleUserVerification
);

// dashboard
admin_routes.get(
  "/admin-dashboard",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.manageController.dashboardAnalysis
);

// job routes 
// recruiter job specific
admin_routes.post(
  "/create-job",
  authMethods.authenticateToken,
  authMethods.verifyUser( ROLES_LIST.admin),
  adminController.jobController.createJob
);
admin_routes.get(
  "/my-jobs",
  authMethods.authenticateToken,
  authMethods.verifyUser( ROLES_LIST.admin),
  adminController.jobController.getJobDataByRecruiterId
);
// for file of recruiter
admin_routes.post(
  "/upload-job-file",
  authMethods.authenticateToken,
  authMethods.verifyUser( ROLES_LIST.admin),
  recruiterFileUpload.single("details_file"),
  adminController.jobController.uploadJobFile
);
admin_routes.delete(
  "/delete-job",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.jobController.deleteJob
);
admin_routes.put(
  "/edit-job",
  authMethods.authenticateToken,
  authMethods.verifyUser( ROLES_LIST.admin),
  adminController.jobController.editJob
);
admin_routes.get(
  "/toggle-job/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.jobController.toggleJob
);
// manage job route
admin_routes.get(
  "/get-job-entries/:job_id/:view",
  authMethods.authenticateToken,
  authMethods.verifyUser( ROLES_LIST.admin),
  adminController.jobController.getJobEntries
);
admin_routes.get(
  "/get-job-stages/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser( ROLES_LIST.admin),
  adminController.jobController.getJobStages
);
admin_routes.post(
  "/change-candidate-status/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.jobController.changeUserJobStatus
);
admin_routes.delete(
  "/remove-job-candidate/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.jobController.removeCandidate
);

admin_routes.post(
  "/change-job-round-status",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.jobController.updateCurrentStage
);
admin_routes.get(
  "/get-job-round-details/:job_id/:view",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.jobController.getJobRoundDetails
);
admin_routes.post(
  "/add-job-round-details",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.jobController.addJobRoundDetails
);
admin_routes.post(
  "/save-job-round-details",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.jobController.saveJobRoundDetails
);
admin_routes.delete(
  "/delete-job-round-details/:job_id/:view",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.admin),
  adminController.jobController.deleteJobRoundDetails
);



module.exports = admin_routes;