const express = require("express");
const ROLES_LIST = require("../constants/roles_list");
const admin_routes = express.Router();
const adminController = require("../controllers/admin/index");
const authMethods = require("../utils/auth");

///////////////////////////////////////
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


module.exports = admin_routes;