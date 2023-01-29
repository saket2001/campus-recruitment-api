const ROLES_LIST = require("../../constants/roles_list");
const userDbOperations = require("../../db/user");
const job = require("../../models/job");
const commonMethods = require("../../utils/common");

////////////////////////////
const JobController = {
  applyToJob: async (req, res) => {
    try {
      const { job_id } = req.params;
      const { id: user_id, roles } = req.user;

      // if not user
      if (!roles.includes(201212))
        return res.status(200).json({
          isError: false,
          message: "You do not have permissions to apply for this job",
        });

      const user = await userDbOperations.getUserById(user_id);

      // user cannot apply if unverified
      if (!user.is_verified)
        return res.status(200).json({
          isError: false,
          message:
            "You do not have permissions to apply for this job as you are unverified candidate",
        });

      const response = await userDbOperations.applyToJob(job_id, user_id);

      if (response === 1)
        return res.status(200).json({
          isError: false,
          message: "No job found by this id!",
        });
      else if (response === 2)
        return res.status(200).json({
          isError: false,
          message: "You have already applied to this job!",
        });
      else if(response === 3)
        return res.status(200).json({
          isError: false,
          message: "The job is no longer accepting responses!",
        });

      if (response) {
        const jobData = await job.findById(job_id, {
          role: 1,
          company_name: 1,
        });
        // sending email and whatsapp notification
        commonMethods.sendEmail({
          subject: "Candidate Application Submitted Successfully!",
          to: user?.email?.toString(),
          viewName: 'applyJob',
          context: {
            role:jobData?.role,
            company_name: jobData?.company_name,
            time:new Date().toDateString(),
          }
        });
        return res.status(200).json({
          isError: false,
          message: `Applied to job successfully`,
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  saveJob: async (req, res) => {
    try {
      const { job_id } = req.params;
      const { id: user_id } = req.user;

      const response = await userDbOperations.saveJob(job_id, user_id);

      if (response === 1)
        return res.status(200).json({
          isError: false,
          message: "Removed from saved jobs successfully!",
        });

      if (response)
        return res.status(200).json({
          isError: false,
          message: "Added to saved jobs successfully!",
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  getSavedJobs: async (req, res) => {
    try {
      const { id: user_id } = req.user;
      const response = await userDbOperations.getSavedJobs(user_id);

      return res.status(200).json({
        isError: false,
        data: response,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  getAppliedJobs: async (req, res) => {
    try {
      const { id: user_id } = req.user;
      const response = await userDbOperations.getAppliedJobs(user_id);

      return res.status(200).json({
        isError: false,
        data: response,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  // common routes
  // getRequestedJobs: async (req, res) => {
  //   try {
  //     const id_arr = req.body;
  //     console.log(req.body);
  //     const response = await userDbOperations.getRequestedJobs(id_arr);

  //     return res.status(200).json({
  //       isError: false,
  //       data: response,
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     return res.status(500).json({
  //       isError: true,
  //       message: "Something went wrong on server!",
  //     });
  //   }
  // },
};
module.exports = JobController;
