// contains all routes for the server
const express = require("express");
const router = express.Router();
const userControllers = require("./controllers/user/index");
const adminControllers = require("./controllers/admin/index");
const authMethods = require("./utils/auth");
const companyControllers = require("./controllers/company");
const recruiterControllers = require("./controllers/recruiter");
const ROLES_LIST = require("./constants/roles_list");

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
////////////////////////////////



////////////////////////////////
/* Util routes */
router.get("/", (req, res) => {
  res.status(200).send("API Active");
});

// TODO Rate limiting of each request

/*
    User
*/
// router.post("/user/signin", userControllers.authController.userSignIn);
// router.post("/user/register", userControllers.authController.userSignUp);

// // user profile route
// router.get(
//   "/user/profile",
//   authMethods.authenticateToken,
//   authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
//   userControllers.profileController.getUserResumeData
// );
// router.get(
//   "/user/profile-picture",
//   authMethods.authenticateToken,
//   authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
//   userControllers.profileController.getUserProfilePic
// );
// router.post(
//   "/user/profile/edit",
//   authMethods.authenticateToken,
//   authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
//   profilePictureUpload.single("profile_picture"),
//   userControllers.profileController.saveUserResumeData
// );
// router.delete(
//   "/user/profile/delete",
//   authMethods.authenticateToken,
//   authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
//   userControllers.profileController.deleteUserAccount
// );
// router.post(
//   "/user/profile/forget-password",
//   authMethods.authenticateToken,
//   authMethods.verifyUser(ROLES_LIST.user, ROLES_LIST.admin),
//   userControllers.profileController.forgetUserPassword
// );
// router.post(
//   "/user/profile/upload-resume",
//   authMethods.authenticateToken,
//   authMethods.verifyUser(ROLES_LIST.user),
//   ResumeUpload.single("resume_file"),
//   userControllers.profileController.uploadUserResume
// );
// router.get(
//   "/user/get-resume",
//   authMethods.authenticateToken,
//   authMethods.verifyUser(ROLES_LIST.user),
//   userControllers.profileController.getUserResume
// );
// router.post(
//   "/user/change-pass",
//   authMethods.authenticateToken,
//   authMethods.verifyUser(ROLES_LIST.user),
//   userControllers.profileController.changeUserPassword
// );

// // user auth's using google
// router.post(
//   "/user/sign-in-google",
//   userControllers.authController.userSignInGoogle
// );
// router.post(
//   "/user/sign-up-google",
//   userControllers.authController.userSignUpGoogle
// );
// router.get(
//   "/user/account-verification/:user_id/:token",
//   userControllers.authController.userEmailVerification
// );
/*
    admin
*/
router.post("/admin/signin", adminControllers.authController.adminSignIn);
router.get(
  "/get-admin-details",
  authMethods.authenticateToken,
  adminControllers.authController.getAdminById
);
/*
    recruiter
*/

/*
    company
*/
router.post(
  "/company/register",
  companyControllers.authController.companyRegistration
);

////////////////////////////////
module.exports = router;
