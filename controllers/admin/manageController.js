const adminDbOperations = require("../../db/admin");

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
      const response = await adminDbOperations.getAllRecruiters(
        year
      );

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
      const response = await adminDbOperations.getAllCompanies(
        year
      );

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
  deleteUser: async (req, res) => {
    try {
      const { user_id } = req.params;
      const response = await adminDbOperations.deleteUser(user_id);
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "Invalid user id received!",
        });

      // send mail to user

      return response
        ? res.status(200).json({
            isError: false,
            data: response,
          })
        : res.status(200).json({
            isError: true,
            message: "Unable to delete user!",
          });
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
      const response = await adminDbOperations.deleteRecruiter(user_id);
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "Invalid recruiter id received!",
        });

      // send mail to user

      return response
        ? res.status(200).json({
            isError: false,
            data: "Deleted recruiter successfully",
          })
        : res.status(200).json({
            isError: true,
            message: "Unable to delete user!",
          });
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
      const response = await adminDbOperations.deleteCompany(company_id);;
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "Invalid company id received!",
        });

      // send mail to user
      return response
        ? res.status(200).json({
            isError: false,
            message: "Deleted company successfully",
          })
        : res.status(200).json({
            isError: true,
            message: "Unable to delete company!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  verifyRecruiter: async (req, res) => {
     try {
       const { user_id } = req.params;
       const response = await adminDbOperations.deleteRecruiter(user_id);
       if (response === 1)
         return res.status(200).json({
           isError: true,
           message: "Invalid recruiter id received!",
         });

       // send mail to user

       return response
         ? res.status(200).json({
             isError: false,
             data: "Deleted recruiter successfully",
           })
         : res.status(200).json({
             isError: true,
             message: "Unable to delete user!",
           });
     } catch (err) {
       console.log(err);
       return res.status(500).json({
         isError: true,
         message: "Something went wrong on the server!",
       });
     }
  }
};

module.exports = manageController;
