const adminDbOperations = require("../../db/admin");
const company = require("../../models/company");
const recruiter = require("../../models/recruiter");
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
  getAllRecruiters: async (req, res) => {
    try {
      const { year } = req.params;
      const response = await adminDbOperations.getAllRecruiters(year);

      return response
        ? res.status(200).json({
            isError: false,
            data: response,
          })
        : res.status(200).json({
            isError: true,
            message: "Unable to get all recruiters for the following year!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  getAllCompanies: async (req, res) => {
    try {
      const { year } = req.params;
      const response = await adminDbOperations.getAllCompanies(year);

      return response
        ? res.status(200).json({
            isError: false,
            data: response,
          })
        : res.status(200).json({
            isError: true,
            message: "Unable to get companies for the following year!",
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
  deleteRecruiter: async (req, res) => {
    try {
      const { user_id } = req.params;
      const userData = await recruiter.findById(user_id, {
        email: 1,
      });
      const response = await adminDbOperations.deleteRecruiter(user_id);
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "Invalid recruiter id received!",
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
          message: "Recruiter account deleted successfully!",
        });
      } else {
        res.status(200).json({
          isError: true,
          message: "Unable to delete recruiter account!",
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
  deleteCompany: async (req, res) => {
    try {
      const { company_id } = req.params;
      const userData = await company.findById(company_id, {
        email: 1,
      });

      const response = await adminDbOperations.deleteCompany(company_id);

      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "Invalid company id received!",
        });

      if (response) {
        // send mail to user
        commonMethods.sendEmail({
          subject: "Account Update",
          to: userData?.email.toString(),
          viewName: "accountDelete",
          context: {
            time: new Date().toDateString(),
          },
        });
        return res.status(200).json({
          isError: false,
          message: "Company account deleted successfully!",
        });
      } else {
        res.status(200).json({
          isError: true,
          message: "Unable to delete company!",
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
  toggleRecruiterVerification: async (req, res) => {
    try {
      const { user_id } = req.params;
      const { status } = req.body;
      const userData = await recruiter.findById(user_id, {
        email: 1,
      });

      const response = await adminDbOperations.toggleRecruiterVerification(
        user_id,
        status
      );
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "Invalid recruiter id received!",
        });

      if (response) {
        // send mail to user
        commonMethods.sendEmail({
          subject: "User Account Status Update",
          to: userData?.email.toString(),
          viewName: "userAccountStatus",
          context: {
            status: status,
            time: new Date().toDateString(),
          },
        });
        return res.status(200).json({
          isError: false,
          message: "Changed recruiter status successfully",
        });
      } else
        res.status(200).json({
          isError: true,
          message: "Unable to change recruiter status!",
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  toggleCompanyVerification: async (req, res) => {
    try {
      const { company_id } = req.params;
      const { status } = req.body;
      const userData = await company.findById(company_id, {
        email: 1,
      });

      const response = await adminDbOperations.toggleCompanyVerification(
        company_id,
        status
      );

      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "Invalid company id received!",
        });

      if (response) {
        // send mail to user
        commonMethods.sendEmail({
          subject: "Company Account Status Update",
          to: userData?.email.toString(),
          viewName: "userAccountStatus",
          context: {
            status: status,
            time: new Date().toDateString(),
          },
        });

        res.status(200).json({
          isError: false,
          message: "Company status changed successfully!",
        });
      } else
        res.status(200).json({
          isError: true,
          message: "Unable to change status of company!",
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
