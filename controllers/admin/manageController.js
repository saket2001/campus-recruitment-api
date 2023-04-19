const adminDbOperations = require("../../db/admin");
const user = require("../../models/user");
const commonMethods = require("../../utils/common");

///////////////////////////////////////
const manageController = {
  getAllUsers: async (req, res) => {
    try {
      const { year } = req.params;
      const response = await adminDbOperations.getAllUsers(year);

      return response
        ? res.status(200).json({
            isError: false,
            data: response,
          })
        : res.status(200).json({
            isError: true,
            message: "Unable to get all users for the following year!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { user_id } = req.params;
      const userData = await user.findById(user_id, {
        email: 1,
      });

      const response = await adminDbOperations.deleteUser(user_id);
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "Invalid user id received!",
        });

      if (response) {
        // send mail to user
        commonMethods.sendEmail({
          subject: "User Account Update",
          to: userData?.email.toString(),
          viewName: "accountDelete",
          context: {
            time: new Date().toDateString(),
          },
        });
        return res.status(200).json({
          isError: false,
          message: "User account deleted successfully!",
        });
      } else {
        res.status(200).json({
          isError: true,
          message: "Unable to delete user account!",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  toggleUserVerification: async (req, res) => {
    try {
      const { user_id } = req.params;

      const response = await adminDbOperations.toggleUserVerification(user_id);
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "User not found!",
        });

      if (response) {
        const userData = await user.findById(user_id, {
          email: 1,
        });
        // send live notification
        
        // send mail to user
        commonMethods.sendEmail({
          subject: "User Account Status Update",
          to: userData?.email.toString(),
          viewName: "userAccountStatus",
          context: {
            status: userData.is_verified ? "Verified" : "Unverified",
            time: new Date().toDateString(),
          },
        });

        return res.status(200).json({
          isError: false,
          message: "Changed user status successfully",
        });
      } else
        res.status(200).json({
          isError: true,
          message: "Unable to change user status!",
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  dashboardAnalysis: async (req, res) => {
    try {
      const { id } = req.user;
      const response = await adminDbOperations.dashboardAnalysis(id);

      return response
        ? res.status(200).json({
            isError: true,
            data: response,
          })
        : res.status(500).json({
            isError: true,
            message: "Enable to get dashboard statistics",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
};

module.exports = manageController;
