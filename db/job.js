const recruiter = require("../models/recruiter");
const company = require("../models/company");
const job = require("../models/job");
const jobDetails = require("../models/jobDetails");
const userResumeData = require("../models/userResumeData");
const { default: mongoose } = require("mongoose");
const user = require("../models/user");
const jobRoundDetails = require("../models/jobRoundDetails");
const admin = require("../models/admin");

///////////////////////////
const jobDbOperations = {
  createJob: async (id, data) => {
    const manualFields = [
      {
        name: "applicants",
        data: [],
      },
      {
        name: "shortlisted",
        data: [],
      },
      {
        name: "selected_for_jobs",
        data: [],
      },
      {
        name: "rejected",
        data: [],
      },
    ];
    data["job_stages"]?.push(...manualFields);

    // else
    const newJob = new job({
      ...data,
      is_active: true,
      created_at: new Date(),
      current_stage: "registration",
      created_by: id,
    });

    newJob.save();

    // saving this in recruiter
    const oldData = await admin.findById(id, { _id: 0, created_jobs: 1 });
    oldData?.created_jobs?.push({
      job_id: newJob?._id,
      created_at: new Date(),
    });

    await admin.findByIdAndUpdate(id, {
      created_jobs: oldData.created_jobs,
    });

    // creating job details in db
    const newJobDetails = new jobDetails({
      job_id: newJob._id,
      created_by: id,
      job_stages: data["job_stages"],
      last_edited: new Date(),
    });

    newJobDetails.save();

    return newJob._id;
  },
  uploadFile: async (id, data) => {
    try {
      const jobData = await job.findByIdAndUpdate(id, {
        job_details_file: data,
      });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  deleteJob: async (id, job_id) => {
    try {
      const jobExists = await job.find({ _id: job_id });
      if (!jobExists) return 1;

      // delete job from recruiters data
      let job_postedData = await admin.findById(id, {
        created_jobs: 1,
      });

      const newData = job_postedData.created_jobs.filter((d) => {
        if (d.job_id.toString() !== job_id) return d;
      });

      await admin.findByIdAndUpdate(id, {
        created_jobs: newData,
      });

      // delete job details
      await jobDetails.findOneAndDelete({ job_id: job_id });

      // delete job
      await job.findByIdAndDelete(job_id);

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  editJob: async (job_id, data) => {
    try {
      let dbJobData = await job.findOneAndUpdate({ _id: job_id }, { ...data });

      // updating job stages manually
      await jobDetails.findOneAndUpdate(
        { job_id: job_id },
        { job_stages: data.job_stages }
      );

      if (dbJobData.length === 0 || !dbJobData) return false;
      return dbJobData;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  toggleJob: async (id, job_id) => {
    try {
      const jobExists = await job.find({ _id: job_id, created_by: id });
      if (!jobExists) return 1;

      // toggling status
      jobExists[0].is_active = !jobExists[0].is_active;

      await job.findOneAndUpdate(
        { _id: job_id },
        {
          is_active: jobExists[0]?.is_active,
        }
      );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  // for admin only
  getJobAndJobDetails: async (id) => {
    try {
      // get job
      const data = await job
        .find({ recruiter_id: id })
        .sort({ created_at: -1 });

      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getJobEntries: async (id, view, dir = "asc") => {
    try {
      let returnData = {
        usersData: null,
        usersStatus: null,
        job_info: null,
      };
      let userIDs = [];

      // job info
      returnData["job_info"] = await job.findById(id, {
        role: 1,
        company_name: 1,
        created_at: 1,
        current_stage: 1,
      });

      // const recruiter_name=await recruiter.findById()

      // for now applicants
      const jobDetailsData = await jobDetails.findOne({ job_id: id });
      if (!jobDetailsData) return 1;

      const data = jobDetailsData?.job_stages?.find((d) => d.name === view);
      // getting list of user ids in arr
      for (let d of data.data) {
        userIDs.push(d.user_id);
      }
      // converting user ids into object id schema
      const obj_ids = userIDs.map(function (id) {
        return mongoose.Types.ObjectId(id);
      });

      // converting ids to objects id
      returnData["usersData"] = await userResumeData.find(
        { user_id: { $in: obj_ids } },
        { basic_details: 1, education: 1, user_id: 1, skills: 1 }
      );

      returnData["usersStatus"] = await user.find(
        { _id: { $in: obj_ids } },
        {
          current_status: 1,
        }
      );

      // get round details if round is aptitude test or interview

      return returnData;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  changeUserJobStatus: async (job_id, data, rec_id) => {
    try {
      const jobDetailsData = await jobDetails.findOne(
        { job_id: job_id },
        { job_stages: 1, _id: 0 }
      );
      jobDetailsData?.job_stages?.forEach((d) => {
        // add to new stage
        if (d.name === data.newStage) {
          d.data.push({
            user_id: data.user_id,
            date: new Date(),
            recruiter_id: rec_id,
          });
        }
      });

      await jobDetails.findOneAndUpdate(
        { job_id: job_id },
        { job_stages: jobDetailsData.job_stages }
      );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  removeCandidate: async (job_id, data) => {
    try {
      const jobDetailsData = await jobDetails.findOne(
        { job_id: job_id },
        { job_stages: 1 }
      );

      jobDetailsData?.job_stages.forEach((jobs) => {
        if (jobs.name === data.view) {
          jobs.data = jobs.data?.filter((d) => {
            if (d.user_id !== data.user_id) return d;
          });
        }
      });

      console.log(jobDetailsData?.job_stages);

      await jobDetails.findOneAndUpdate(
        { job_id: job_id },
        { job_stages: jobDetailsData?.job_stages }
      );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  downloadJobApplicantsData: async (job_id, view) => {
    try {
      // getting ids of user
      const jobData = await jobDetails.findOne({ job_id: job_id });
      const viewData = jobData?.job_stages?.find((d) => {
        if (d.name === view) return d;
      });
      const viewDataIDs = viewData?.data?.map((d) => d.user_id);

      // getting users based on ids
      const usersData = await userResumeData.find(
        { user_id: { $in: viewDataIDs } },
        { basic_details: 1, _id: 0, education: 1, skills: 1 }
      );

      return usersData;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  //   dashboardAnalysis: async (id) => {
  //     try {
  //       const data = {
  //         totalJobs: 0,
  //         AvgResponses: 0,
  //         jobResponses: {},
  //         allJobsCount: {},
  //         currentPosts: [],
  //       };

  //       // total jobs created
  //       const allJobs = await job.find(
  //         { recruiter_id: id },
  //         { _id: 1, role: 1, company_name: 1 }
  //       );
  //       data["totalJobs"] = allJobs?.length;

  //       // total avg response range
  //       const jobDetailsData = await jobDetails.find(
  //         { recruiter_id: id },
  //         { job_stages: 1 }
  //       );
  //       const jobResponses = [];
  //       jobDetailsData?.forEach((job) => {
  //         const applicants = job?.job_stages.find((d) => d.name === "applicants");
  //         jobResponses.push(applicants?.data?.length);
  //       });

  //       // job responses
  //       const jobResponsesName = allJobs?.map((j) => `${j.role}`);
  //       data["jobResponses"] = {
  //         labels: jobResponsesName,
  //         datasets: [
  //           {
  //             label: "Responses per job",
  //             data: jobResponses,
  //             backgroundColor: "rgba(56, 55, 221, 0.8)",
  //           },
  //         ],
  //       };

  //       const sorted = [...jobResponses]?.sort((a, b) => a - b);
  //       data["AvgResponses"] = `${sorted.at(0)}-${sorted.at(-1)}`;

  //       // count of all job roles
  //       const allJobRoles = await job.find({ is_active: true }, { role: 1 });
  //       let labels = allJobRoles.map((d) => d.role.toLowerCase());
  //       let labelCount = {};
  //       labels.forEach((role) => {
  //         if (labelCount.hasOwnProperty(role))
  //           labelCount[role] = labelCount[role] + 1;
  //         else labelCount[role] = 1;
  //       });
  //       data["allJobsCount"] = {
  //         labels: labels,
  //         datasets: [
  //           {
  //             label: "Role count",
  //             data: Object.values(labelCount),
  //             backgroundColor: [],
  //           },
  //         ],
  //       };

  //       // current posts
  //       const date = new Date();
  //       const today = `${date.getFullYear()}-${
  //         date.getMonth() + 1 < 10
  //           ? `0${date.getMonth() + 1}`
  //           : date.getMonth() + 1
  //       }-${date.getDate()}`;
  //       data["currentPosts"] = await job.find({
  //         recruiter_id: id,
  //         last_date: { $gte: today },
  //       });

  //       return data;
  //     } catch (err) {
  //       console.log(err);
  //       return false;
  //     }
  //   },
  updateCurrentStage: async (job_id, newStage) => {
    try {
      const jobData = await job.findByIdAndUpdate(job_id, {
        current_stage: newStage,
      });
      await jobDetails.findOneAndUpdate(
        { job_id: job_id },
        { last_edited: new Date() }
      );

      if (!jobData || jobData?.length === 0) return 1;

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  addJobRoundDetails: async (rec_id, data) => {
    try {
      data["recruiter_id"] = rec_id;
      const newDetails = new jobRoundDetails(data);
      await newDetails.save();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  saveJobRoundDetails: async (rec_id, data) => {
    try {
      data["recruiter_id"] = rec_id;
      // const newDetails = await new jobRoundDetails(data);
      const savedDetails = await jobRoundDetails.findOneAndUpdate(
        { job_id: data["job_id"] },
        { ...data }
      );
      console.log(savedDetails);
      return savedDetails ? true : false;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  deleteJobRoundDetails: async (rec_id, job_id, view) => {
    try {
      const deletedDetails = await jobRoundDetails.findOneAndDelete({
        job_id: job_id,
        recruiter_id: rec_id,
        round_name: view,
      });
      console.log(deletedDetails);
      return deletedDetails ? true : false;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  // common routes
  getJobs: async () => {
    try {
      // get job
      const data = await job.find().sort({ created_at: -1 });
      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getJobById: async (job_id, role) => {
    try {
      let data = {};
      // get job
      data["job"] = await job.findById(job_id).sort({ created_at: -1 });

      const temp = await jobDetails
        .find({ job_id: job_id }, { job_stages: 1, _id: 0 })
        .sort({ created_at: -1 });
      data["job_details"] = await temp[0]["job_stages"]?.find((d) => {
        if (d.name === "applicants") return d["data"];
      });

      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getFilters: async () => {
    try {
      let data = {
        role: [],
        location: [],
        company_name: [],
      };

      // !TODO: add company name too
      const dbData = await job.find(
        {},
        { _id: 0, role: 1, location: 1, company_name: 1 }
      );
      // console.log(dbData);

      dbData.forEach((d) => {
        data["role"].push(d.role);
        data["location"].push(d.location);
        data["company_name"].push(d.company_name);
      });

      // keeping unique values
      data["role"] = [...new Set(data["role"])];
      data["location"] = [...new Set(data["location"])];
      data["company_name"] = [...new Set(data["company_name"])];

      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getDetails: async (rec_id, comp_id) => {
    try {
      const data = {
        recruiter: {},
        company: {},
      };
      // get recruiter
      data["recruiter"] = await recruiter.findById(rec_id, {
        email: 1,
        full_name: 1,
        is_verified: 1,
        _id: 0,
      });

      // get company
      data["company"] = await company.findById(comp_id, {
        email: 1,
        full_name: 1,
        about: 1,
        contact_no: 1,
        _id: 0,
      });

      return data;
    } catch {
      return false;
    }
  },
  getJobStages: async (job_id) => {
    try {
      let stagesNames = [];
      const jobStagesData = await jobDetails.find(
        { job_id: job_id },
        {
          job_stages: 1,
        }
      );

      if (jobStagesData[0]?.job_stages)
        jobStagesData[0]?.job_stages?.forEach((d) => stagesNames.push(d.name));

      return stagesNames;
    } catch {
      return false;
    }
  },
  getJobRoundDetails: async (id, view) => {
    try {
      const roundDetails = await jobRoundDetails.findOne({
        job_id: id,
        round_name: view,
      });
      return roundDetails;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};

module.exports = jobDbOperations;
