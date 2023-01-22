const express = require("express");
const user_router = express.Router();
const userControllers = require("../controllers/user/index");
const authMethods = require("../utils/auth");
const ROLES_LIST = require("../constants/roles_list");
const uploadLimit = 2 * 1024 * 1024; // 2MB
const multer = require("multer");
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
////////////////////////////////////////////
// auth routes
user_router.post("/signin", userControllers.authController.userSignIn);
user_router.post("/register", userControllers.authController.userSignUp);


// user auth's using google
user_router.post(
  "/sign-in-google",
  userControllers.authController.userSignInGoogle
);
user_router.post(
  "/sign-up-google",
  userControllers.authController.userSignUpGoogle
);
user_router.get(
  "/account-verification/:user_id/:token",
  userControllers.authController.userEmailVerification
);


// user profile route
user_router.get(
  "/profile",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  userControllers.profileController.getUserResumeData
);
user_router.get(
  "/profile-picture",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  userControllers.profileController.getUserProfilePic
);
user_router.post(
  "/profile/edit",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  profilePictureUpload.single("profile_picture"),
  userControllers.profileController.saveUserResumeData
);
user_router.delete(
  "/profile/delete",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  userControllers.profileController.deleteUserAccount
);
user_router.post(
  "/profile/forget-password",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
  userControllers.profileController.forgetUserPassword
);
user_router.post(
  "/profile/upload-resume",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user),
  ResumeUpload.single("resume_file"),
  userControllers.profileController.uploadUserResume
);
user_router.get(
  "/get-resume/:user_id",
  authMethods.authenticateToken,
  authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.recruiter),
  userControllers.profileController.getUserResume
);
user_router.post(
  "/change-pass",
  authMethods.authenticateToken,
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

////////////////////////////////////////////
module.exports = user_router;
