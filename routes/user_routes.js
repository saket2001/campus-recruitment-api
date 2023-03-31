const express = require("express");
const user_router = express.Router();
const userControllers = require("../controllers/user/index");
const authMethods = require("../utils/auth");
const ROLES_LIST = require("../constants/roles_list");
const uploadLimit = 2 * 1024 * 1024; // 2MB
const multer = require("multer");
const rateLimit = require("express-rate-limit");
////////////////////////////////////////////
const multerConfig1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files/uploads/user/resumes/");
  },
  filename: function (req, file, cb) {
    if (file) {
      if (file.mimetype !== "application/pdf") return;
      const user_id = req.user.id;
      req.files = file;
      req.filePath = `files/uploads/user/resumes/${
        user_id + "-" + file.originalname
      }`;
      //Appending extension
      cb(null, user_id + "-" + file.originalname);
    }
  },
});
const multerConfig2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files/uploads/user/pictures/");
  },
  filename: function (req, file, cb) {
    if (file) {
      const allowedImgTypes = ["image/jpg", "image/png", "image/jpeg"];
      if (!allowedImgTypes.includes(file.mimetype)) return;

      const user_id = req.user.id;
      req.files = file;
      req.filePath = `files/uploads/user/pictures/${
        user_id + "-" + file.originalname
      }`;
      cb(null, user_id + "-" + file.originalname);
    }
  },
});
// for user resumes
const ResumeUpload = multer({
  storage: multerConfig1,
  limits: { fileSize: uploadLimit },
});
// for user profile picture
const profilePictureUpload = multer({
  storage: multerConfig2,
  limits: { fileSize: uploadLimit },
});

// rate limiting 
const userAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
});
const userJobLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
});
////////////////////////////////////////////

// auth routes
user_router.post("/signin",userAuthLimiter, userControllers.authController.userSignIn);
user_router.post(
  "/register",
  userAuthLimiter,
  userControllers.authController.userSignUp
);

// user auth's using google
user_router.post(
  "/sign-in-google",
  userAuthLimiter,
  userControllers.authController.userSignInGoogle
);
user_router.post(
  "/sign-up-google",
  userAuthLimiter,
  userControllers.authController.userSignUpGoogle
);
user_router.get(
  "/account-verification/:user_id/:token",
  userAuthLimiter,
  userControllers.authController.userEmailVerification
);

// user dashboard
user_router.get(
  "/dashboard-analysis",
  authMethods.authenticateToken,
  userJobLimiter,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.jobController.dashboardAnalysis
);

// user profile route
user_router.get(
  "/profile",
  authMethods.authenticateToken,
  userJobLimiter,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  userControllers.profileController.getUserResumeData
);
user_router.get(
  "/profile-status",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  userControllers.profileController.checkProfileStatus
);
user_router.get(
  "/profile-picture",
  authMethods.authenticateToken,
  userJobLimiter,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  userControllers.profileController.getUserProfilePic
);
user_router.post(
  "/profile/upload-profile-picture",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user),
  profilePictureUpload.single("profile_picture"),
  userControllers.profileController.uploadUserPicture
);
user_router.delete(
  "/profile/delete-profile-picture",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.profileController.deleteUserPicture
);
user_router.post(
  "/profile/edit",
  authMethods.authenticateToken,
  userJobLimiter,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  userControllers.profileController.saveUserResumeData
);
user_router.delete(
  "/profile/delete",
  authMethods.authenticateToken,
  userJobLimiter,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  userControllers.profileController.deleteUserAccount
);
user_router.post(
  "/profile/forget-password",
  authMethods.authenticateToken,
  userAuthLimiter,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  userControllers.profileController.forgetUserPassword
);
user_router.post(
  "/profile/upload-resume",
  authMethods.authenticateToken,
  userJobLimiter,
  authMethods.verifyUser(ROLES_LIST.user),
  ResumeUpload.single("resume_file"),
  userControllers.profileController.uploadUserResume
);
user_router.get(
  "/get-resume/:user_id",
  authMethods.authenticateToken,
  userJobLimiter,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.recruiter),
  userControllers.profileController.getUserResume
);
user_router.post(
  "/change-pass",
  authMethods.authenticateToken,
  userAuthLimiter,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.profileController.changeUserPassword
);

// user specific job routes
user_router.put(
  "/apply-job/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.jobController.applyToJob
);
user_router.put(
  "/toggle-save-job/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.jobController.saveJob
);
user_router.get(
  "/saved-jobs",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.jobController.getSavedJobs
);
user_router.get(
  "/applied-jobs",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.jobController.getAppliedJobs
);
user_router.get(
  "/get-application-status/:job_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.jobController.getApplicationStatus
);
user_router.get(
  "/get-job-recommendations/",
  authMethods.authenticateToken,
  userAuthLimiter,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.jobController.getJobRecommendations
);

// group routes
user_router.get(
  "/get-my-group",
  authMethods.authenticateToken,
  userJobLimiter,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.groupController.getMyGroup
);
user_router.post(
  "/apply-group",
  authMethods.authenticateToken,
  userJobLimiter,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.groupController.applyToGroup
);
user_router.delete(
  "/leave-group",
  authMethods.authenticateToken,
  userJobLimiter,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.groupController.leaveGroup
);

// notifications
user_router.get(
  "/get-notifications",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.notificationController.getNotifications
);
user_router.post(
  "/change-notification-status",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.notificationController.changeStatusOfNotification
);
user_router.delete(
  "/delete-notification/:notification_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user),
  userControllers.notificationController.deleteNotification
);
////////////////////////////////////////////
module.exports = user_router;
