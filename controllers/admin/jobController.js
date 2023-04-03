const group = require("../../models/group");
const job = require("../../models/job");
const user = require("../../models/user");
const commonMethods = require("../../utils/common");
const fs = require("fs");
const {
  socketIoOperations,
  socketUtils,
  socketIO,
} = require("../../utils/socketIO");
const userDbOperations = require("../../db/user");
const jobDbOperations = require("../../db/job");
//////////////////////////////

const JobController = {
  createJob: async (req, res) => {
    try {
      const { id } = req.user;
      const jobData = req.body;

      if (jobData === undefined || Object.keys(jobData).length === 0)
        return res.status(200).json({
          isError: true,
          message: "No data received",
        });

      // checking if anything is not empty
      const isValid = await commonMethods.checkInputs(jobData, [
        "description",
        "requirements",
      ]);
      if (!isValid.status)
        return res
          .status(200)
          .json({ isError: true, message: isValid.message });

      // save the data in db
      const response = await jobDbOperations.createJob(id, jobData);

      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "Recruiter needs to be verified to create job!",
        });

      if (response) {
        // !TODO: Send whatsapp notification to recruiter and user
        // email bulk notification
        const yearsToSendEmail = [
          new Date().getFullYear(),
          new Date().getFullYear() - 1,
        ];
        const groups = await group.find({ year: { $in: yearsToSendEmail } });

        groups?.forEach((groupData) => {
          const mailIDs = groupData?.members.map((member) => member.email);

          commonMethods?.sendEmail({
            subject: `Job Alert at Virtual Recruitment`,
            to: mailIDs,
            viewName: "JobAlert",
            context: {
              role: jobData.role,
              salary: jobData?.salary,
              company_name: jobData.company_name,
              location: jobData.location,
              last_date: new Date(jobData.last_date).toDateString(),
            },
          });
        });

        // by notification system
        socketIO.emit("new-job", {
          title: "New job posting update",
          body: `There is a new job opening from ${jobData.company_name} for the role of ${jobData.role} at ${jobData.location}. Do check out the job in your job section.`,
          type: "alert-notification",
        });
        console.log("Notification Send");
        await userDbOperations.saveNotification({
          title: "New job posting update",
          body: `There is a new job opening from ${jobData.company_name} for the role of ${jobData.role} at ${jobData.location}. Do check out the job in your job section.`,
          type: "alert-notification",
          sender_id: id,
          receiver_id: "",
        });

        return res.status(200).json({
          isError: false,
          message: "Job Created Successfully!",
          data: response,
        });
      }

      return res.status(200).json({
        isError: true,
        message: "Failure occurred in creating the job",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  uploadJobFile: async (req, res) => {
    try {
      const { id } = req.user;
      const filePath = req.filePath;
      const { job_id } = req.body;

      // save filepath in db
      const response = await jobDbOperations.uploadFile(job_id, filePath);

      return response
        ? res
            .status(200)
            .json({ isError: false, message: "File uploaded successfully" })
        : res
            .status(500)
            .json({ isError: true, message: "Failed to upload file!" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  editJob: async (req, res) => {
    try {
      const { job_id, data } = req.body;

      const response = await jobDbOperations.editJob(job_id, data);

      // if doesn't exists
      if (response === 1)
        return res.status(500).json({
          isError: true,
          message: "Job with given id doesn't exists",
        });

      response
        ? res.status(200).json({
            isError: false,
            message: "Job edited successfully!",
            data: response.data,
          })
        : res.status(500).json({
            isError: true,
            message: "Failed to edit the requested job!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  deleteJob: async (req, res) => {
    try {
      const { id } = req.user;
      const { job_id } = req.body;

      const response = await jobDbOperations.deleteJob(id, job_id);

      // if doesn't exists
      if (response === 1)
        return res.status(500).json({
          isError: true,
          message: "Job with given id doesn't exists",
        });

      response
        ? res.status(200).json({
            isError: false,
            message: "Job deleted successfully!",
          })
        : res.status(500).json({
            isError: true,
            message: "Failed to delete the requested job!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  toggleJob: async (req, res) => {
    try {
      const { id } = req.user;
      const { job_id } = req.params;

      const response = await jobDbOperations.toggleJob(id, job_id);

      // if doesn't exists
      if (response === 1)
        return res.status(500).json({
          isError: true,
          message: "Job with given id doesn't exists",
        });

      response
        ? res.status(200).json({
            isError: false,
            message: "Job status modified successfully!",
          })
        : res.status(500).json({
            isError: true,
            message: "Failed to toggle the status of requested job!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  getJobDataByRecruiterId: async (req, res) => {
    try {
      const { id } = req.user;

      const response = await jobDbOperations.getJobAndJobDetails(id);
      if (response)
        return res.status(200).json({
          isError: false,
          data: response,
        });
      return res.status(500).json({
        isError: true,
        message: "Failed to get your jobs!",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  // manage
  getJobEntries: async (req, res) => {
    try {
      const { job_id, view } = req.params;
      const response = await jobDbOperations.getJobEntries(job_id, view);

      // if error
      if (!response || response === 1)
        return res.status(200).json({
          isError: true,
          data: [],
          message: "No job id received!",
        });

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
  getJobStages: async (req, res) => {
    try {
      const { job_id } = req.params;

      const data = await jobDbOperations.getJobStages(job_id);

      data
        ? res.status(200).json({
            isError: false,
            data,
          })
        : res.status(500).json({
            isError: true,
            message: "Something went wrong on server!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  changeUserJobStatus: async (req, res) => {
    try {
      const body = req.body;
      const { id } = req.user;
      const { job_id } = req.params;
      console.log(body);

      const response = await jobDbOperations.changeUserJobStatus(
        job_id,
        body,
        id
      );

      // !TODO send notifications to user
      if (response) {
        const userData = await user.findById(body.user_id, { email: 1 });
        const jobData = await job.findById(job_id, {
          role: 1,
          company_name: 1,
        });

        // by notification system
        const receiver = socketUtils.GetUserFromSession(body.user_id);
        // if user is online
        if (receiver) {
          socketIO.to(receiver?.socket_id).emit("application-update", {
            title: "Job application update",
            body: `Your application for ${jobData?.role} at ${jobData?.company_name} has been recently updated by the recruiter to ${body.newStage} stage`,
            type: "alert-notification",
          });
          console.log("Notification Send");
        } else {
          console.log("User offline!");
          await userDbOperations.saveNotification({
            title: "Job application update",
            body: `Your application for ${jobData?.role} at ${jobData?.company_name} has been recently updated by the recruiter to ${body.newStage} stage`,
            type: "alert-notification",
            sender_id: body.user_id,
            receiver_id: id,
          });
        }
        // by email
        // commonMethods.sendEmail({
        //   subject: `Job application update`,
        //   to: userData?.email?.toString(),
        //   viewName: "jobStatusChange",
        //   context: {
        //     role: jobData?.role,
        //     company_name: jobData?.company_name,
        //     time: new Date().toDateString(),
        //     currStage: body.currStage,
        //     newStage: body.newStage,
        //   },
        // });

        res.status(200).json({
          isError: false,
          message: "Updated candidate status successfully!",
        });
      } else
        res.status(200).json({
          isError: true,
          message: "Unable to update candidate status!",
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  removeCandidate: async (req, res) => {
    try {
      const body = req.body;
      const { job_id } = req.params;
      console.log(job_id,body);

      const response = await jobDbOperations.removeCandidate(
        job_id,
        body
      );

      return response
        ? res.status(200).json({
            isError: false,
            message: `Removed candidate successfully from ${body.view} list!`,
          })
        : res.status(200).json({
            isError: true,
            message: `Unable to remove candidate from ${body.view} list!`,
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  downloadJobApplicantsData: async (req, res) => {
    try {
      const { view, job_id } = req.params;
      const response = await jobDbOperations.downloadJobApplicantsData(
        job_id,
        view
      );

      // writing in file
      fs.writeFile(
        "./files/downloads/recruiter/output.txt",
        JSON.stringify(response),
        "utf8",
        function (err) {
          if (err) {
            console.log("An error occurred while writing JSON Object to File.");
            return console.log(err);
          }

          console.log("JSON file has been saved.");
        }
      );

      return response
        ? res.status(200).json({
            isError: false,
            data: response,
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to get filters!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  updateCurrentStage: async (req, res) => {
    try {
      const { id } = req.user;
      const { job_id, stage } = req.body;
      const response = await jobDbOperations.updateCurrentStage(job_id, stage);

      return response
        ? res.status(200).json({
            isError: false,
            message: "Updated current round successfully",
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to update current round!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  addJobRoundDetails: async (req, res) => {
    try {
      const { id } = req.user;
      const data = req.body;
      const response = await jobDbOperations.addJobRoundDetails(id, data);

      return response
        ? res.status(200).json({
            isError: false,
            message: "Added job round details successfully",
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to add job round details!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  saveJobRoundDetails: async (req, res) => {
    try {
      const { id } = req.user;
      const data = req.body;
      const response = await jobDbOperations.saveJobRoundDetails(id, data);

      return response
        ? res.status(200).json({
            isError: false,
            message: "Saved job round details successfully",
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to save job round details!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  // ViewJobRoundDetails: async (req, res) => {
  //   try {
  //     const { id } = req.user;
  //     const response = await jobDbOperations.AddJobRoundDetails(id, data);

  //     return response
  //       ? res.status(200).json({
  //           isError: false,
  //           message: "Added job round details successfully",
  //         })
  //       : res.status(200).json({
  //           isError: true,
  //           message: "Failed to add job round details!",
  //         });
  //   } catch (err) {
  //     console.log(err);
  //     return res.status(500).json({
  //       isError: true,
  //       message: "Something went wrong on server!",
  //     });
  //   }
  // },
  deleteJobRoundDetails: async (req, res) => {
    try {
      const { id } = req.user;
      const { job_id, view } = req.params;
      const response = await jobDbOperations.deleteJobRoundDetails(
        id,
        job_id,
        view
      );

      return response
        ? res.status(200).json({
            isError: false,
            message: "Deleted job round details successfully",
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to delete job round details!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  // dashboard
  dashboardAnalysis: async (req, res) => {
    try {
      const { id } = req.user;

      const response = await jobDbOperations.dashboardAnalysis(id);

      return response
        ? res.status(200).json({ isError: false, data: response })
        : res
            .status(200)
            .json({ isError: true, message: "Failed to get dashboard data" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  // common route for all
  getJobs: async (req, res) => {
    try {
      const roleCode = req.user.roles[0];
      const response = await jobDbOperations.getJobs(roleCode);

      if (response)
        return res.status(200).json({
          isError: false,
          data: response,
        });
      return res.status(500).json({
        isError: true,
        message: "Failed to get your jobs!",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  getJobById: async (req, res) => {
    try {
      const { job_id } = req.params;
      const roleCode = req.user.roles[0];

      const response = await jobDbOperations.getJobById(job_id, roleCode);
      if (response)
        return res.status(200).json({
          isError: false,
          data: response,
        });
      return res.status(500).json({
        isError: true,
        message: "Failed to get your job!",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  getFilter: async (req, res) => {
    try {
      const data = await jobDbOperations.getFilters();

      data
        ? res.status(200).json({
            isError: false,
            data,
          })
        : res.status(500).json({
            isError: true,
            message: "Something went wrong on server!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  getDetails: async (req, res) => {
    try {
      const { recruiter_id, company_id } = req.params;
      console.log(recruiter_id);
      const data = await jobDbOperations.getDetails(recruiter_id, company_id);

      data
        ? res.status(200).json({
            isError: false,
            data,
          })
        : res.status(500).json({
            isError: true,
            message: "Something went wrong on server!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  getJobRoundDetails: async (req, res) => {
    try {
      const { job_id, view } = req.params;
      const data = await jobDbOperations.getJobRoundDetails(job_id, view);

      return data
        ? res.status(200).json({
            isError: false,
            data,
          })
        : res.status(200).json({
            isError: true,
            message: "Unable to get job round details at this moment!",
        });
      
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
};

module.exports = JobController;
