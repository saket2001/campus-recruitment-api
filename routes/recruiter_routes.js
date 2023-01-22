const express = require("express");
const recruiter_routes = express.Router();
const authMethods = require("../utils/auth");
const recruiterControllers = require("../controllers/recruiter");
const ROLES_LIST = require("../constants/roles_list");
const uploadLimit = 2 * 1024 * 1024; // 2MB
const multer = require("multer");
////////////////////////////////////////////
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
// for recruiter file
const recruiterFileUpload = multer({
  storage: multerConfig,
  limits: { fileSize: uploadLimit },
});

////////////////////////////////////////////
// recruiter auth
recruiter_routes.post(
  "/signin",
  recruiterControllers.authController.recruiterSignIn
);
recruiter_routes.post(
  "/register",
  recruiterControllers.authController.recruiterSignUp
);

// recruiter job specific
recruiter_routes.post(
  "/create-job",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.recruiter, ROLES_LIST.admin),
  recruiterControllers.JobController.createJob
);
recruiter_routes.get(
  "/my-jobs",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.recruiter, ROLES_LIST.admin),
  recruiterControllers.JobController.getJobDataByRecruiterId
);
// for file of recruiter
recruiter_routes.post(
  "/upload-job-file",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.recruiter, ROLES_LIST.admin),
  recruiterFileUpload.single("details_file"),
  recruiterControllers.JobController.uploadJobFile
);
recruiter_routes.delete(
  "/delete-job",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.recruiter, ROLES_LIST.admin),
  recruiterControllers.JobController.deleteJob
);
recruiter_routes.put(
  "/edit-job",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.recruiter, ROLES_LIST.admin),
  recruiterControllers.JobController.editJob
);
recruiter_routes.get(
  "/toggle-job/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.recruiter, ROLES_LIST.admin),
  recruiterControllers.JobController.toggleJob
);
// manage job route
recruiter_routes.get(
  "/get-job-entries/:job_id/:view",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.recruiter, ROLES_LIST.admin),
  recruiterControllers.JobController.getJobEntries
);
recruiter_routes.get(
  "/get-job-stages/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.recruiter, ROLES_LIST.admin),
  recruiterControllers.JobController.getJobStages
);
recruiter_routes.post(
  "/change-candidate-status/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.recruiter, ROLES_LIST.admin),
  recruiterControllers.JobController.changeUserJobStatus
);
recruiter_routes.delete(
  "/remove-candidate/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.recruiter, ROLES_LIST.admin),
  recruiterControllers.JobController.removeCandidate
);


////////////////////////////////////////////
module.exports = recruiter_routes;
