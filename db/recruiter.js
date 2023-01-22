//
const recruiter = require("../models/recruiter");
const company = require("../models/company");
const job = require("../models/job");
const jobDetails = require("../models/jobDetails");
const userResumeData = require("../models/userResumeData");
const userResume = require("../models/userResume");
const { default: mongoose } = require("mongoose");

///////////////////////////

const recruiterDbOperations = {
  registerRecruiter: async (recruiterData) => {
    // first look for any user with same email id
    const recruiterAlreadyExists = await recruiter.findOne({
      email: recruiterData.email,
    });
    if (recruiterAlreadyExists) return 1;

    // check for no of recruiter accounts
    const existingRecruiters = await company.findById(
      recruiterData.company_id,
      { recruiters: 1 }
    );

    if (existingRecruiters.recruiters.length >= 2) return 3;

    const newRecruiter = new recruiter(recruiterData);
    const savedRecruiter = await newRecruiter.save();

    // saving recruiter in company records
    const existing_company = await company.findById(recruiterData.company_id);
    // deleting the saved user from db
    if (!existing_company) {
      recruiterDbOperations.deleteRecruiterById(savedRecruiter._id);
      return 2;
    }
    existing_company.recruiters.push({ id: savedRecruiter._id });
    await existing_company.save();

    return savedRecruiter;
  },
  getRecruiterById: async (id) => await recruiter.findById(id, { password: 0 }),
  getRecruiterByEmail: async (email, fields = {}) =>
    await recruiter.findOne({ email: email }, fields),
  deleteRecruiterById: async (id) => await recruiter.findByIdAndDelete(id),
  createJob: async (id, data) => {
    // checking if recruiter is verified to create job
    const recruiterData = await recruiter.findById(id, { password: 0 });

    // if not verified
    if (!recruiterData?.isVerified) return 1;

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
      recruiter_id: id,
      company_id: recruiterData?.company_id,
      is_active: true,
      created_at: new Date(),
      current_stage: "registration",
    });

    newJob.save();

    // saving this in recruiter
    const oldData = await recruiter.findById(id, { _id: 0, jobs_posted: 1 });
    oldData?.jobs_posted?.push({ job_id: newJob?._id });

    await recruiter.findByIdAndUpdate(id, {
      jobs_posted: oldData.jobs_posted,
    });

    // creating job details in db
    const newJobDetails = new jobDetails({
      job_id: newJob._id,
      recruiter_id: id,
      job_stages: data["job_stages"],
    });

    newJobDetails.save();

    return newJob._id;
  },
  uploadFile: async (id, data) => {
    try {
      const jobData = await job.findByIdAndUpdate(id, { filePath: data });
      console.log(jobData);

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  deleteJob: async (id, job_id) => {
    try {
      const jobExists = await job.find({ _id: job_id });
      console.log(jobExists);
      if (!jobExists) return 1;

      // delete job from recruiters data
      let job_postedData = await recruiter.findById(id, {
        jobs_posted: 1,
      });

      const newData = job_postedData.jobs_posted.filter((d) => {
        if (d.job_id.toString() !== job_id) return d;
      });

      await recruiter.findByIdAndUpdate(id, {
        jobs_posted: newData,
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
      console.log(data);
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
      const jobExists = await job.find({ _id: job_id });
      console.log(jobExists);
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
  // for recruiter only
  getJobAndJobDetails: async (id) => {
    try {
      // get job
      const data = await job.find({ recruiter_id: id });
      // get job details i.e applicants etc
      // data['job_details'] = await jobDetails.find({ recruiter_id: id })
      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getJobEntries: async (id, view) => {
    try {
      let usersData,
        userIDs = [];

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
      usersData = await userResumeData.find(
        { user_id: { $in: obj_ids } },
        { basic_details: 1, education: 1, user_id: 1 }
      );
      return usersData;
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
  // common routes
  getJobs: async (role) => {
    try {
      // get job
      const data = await job.find();
      // get job details i.e applicants etc
      // if (role === 491912 || role === 841031)
      //   data['job_details'] = await jobDetails.find()
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
      data["job"] = await job.findById(job_id);

      const temp = await jobDetails.find(
        { job_id: job_id },
        { job_stages: 1, _id: 0 }
      );
      data["job_details"] = await temp[0]["job_stages"]?.find((d) => {
        if (d.name === "applicants") return d["data"];
      });

      console.log(data["job_details"]);

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
};

module.exports = recruiterDbOperations;
