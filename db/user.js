const user = require("../models/user");
const VerificationToken = require("../models/verificationToken");
const crypto = require("crypto");
const userResumeData = require("../models/userResumeData");
const authMethods = require("../utils/auth");
const forgetPassword = require("../models/forgetPassword");
const commonMethods = require("../utils/common");
const userResume = require("../models/userResume");
const jobDetails = require("../models/jobDetails");
const job = require("../models/job");
const mongoose = require("mongoose");
const group = require("../models/group");
const notification = require("../models/notification");
const jobRecommendation = require("../models/jobRecommendation");
const jobRoundDetails = require("../models/jobRoundDetails");

///////////////////////////

const userDbOperations = {
  registerUser: async (userData) => {
    // first look for any user with same email id
    const userAlreadyExists = await user.findOne({ email: userData.email });
    if (userAlreadyExists) return 1;

    // create token and user
    const newUser = new user(userData);
    const SavedUser = await newUser.save();

    const token = await new VerificationToken({
      userId: SavedUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    // create user resume data in db
    const newUserResume = {
      user_id: SavedUser._id,
      basic_details: {
        full_name: userData.full_name,
        email: userData.email,
        contact: userData.contact,
        gender: userData.gender,
        college: userData.college_name,
        branch: userData.college_branch,
        summary: "",
        address: "",
        admission_number: "",
        profile_picture: "",
      },
      education: {
        "10th": {
          institute_name: "",
          percentage: 0,
          year: 0,
        },
        "12th": {
          institute_name: "",
          percentage: 0,
          year: 0,
        },
        engineering: {
          institute_name: "",
          percentage: 0,
          year: 0,
        },
      },
      experience: {
        isActive: false,
        data: [],
      },
      projects: {
        isActive: false,
        data: [],
      },
      certificates: {
        isActive: false,
        data: [],
      },
      skills: {
        isActive: false,
        data: [],
      },
      hobbies: {
        isActive: false,
        data: [],
      },
      extra_curricular: {
        isActive: false,
        data: [],
      },
      languages: {
        isActive: false,
        data: [],
      },
      created_at: new Date(),
      last_edited: new Date(),
    };
    const newUserResumeData = new userResumeData(newUserResume);
    newUserResumeData.save();

    // creating user resume file data
    const newUserResumeFile = new userResume({
      user_id: SavedUser._id,
      resume_file: "",
    });
    newUserResumeFile.save();

    return { SavedUser, token };
  },
  getUserById: async (id) => await user.findById(id, { password: 0 }),
  getUserPassChangeCode: async (id) =>
    await forgetPassword.findOne({ user_id: id }),
  saveUserPassChangeCode: async (id) => {
    try {
      // check for existing code
      const codeExists = await forgetPassword.findOne({ user_id: id });
      if (codeExists) return false;

      const code = await commonMethods.generateUUID();
      const newEntry = new forgetPassword({
        user_id: id,
        pass_code: code,
        created_at: new Date(),
      });

      const status = await newEntry.save();
      if (status) return { status: true, code };
      else return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  deleteUserPassChangeCode: async (id) => {
    const status = await forgetPassword.findOneAndDelete({ user_id: id });
  },
  updateUserPass: async (id, new_pass) => {
    const User = await user.findOneAndUpdate(
      { _id: id },
      { password: await authMethods.generateHash(new_pass) }
    );
    return User ? true : false;
  },
  deleteUserById: async (id) => await user.findByIdAndDelete(id),
  getUserByEmail: async (email, fields = {}) =>
    await user.findOne({ email: email }, fields),
  userVerification: async (id, token) => {
    // safety for not making it false again by visiting same link
    // if no user is found
    const User = await user.findById(id, { password: 0 });
    if (!User) return 0;

    const savedToken = await VerificationToken.findOne({
      userId: id,
      token: token,
    });
    if (!savedToken) return 0;

    if (User && savedToken) {
      User.is_verified = true;
      User.save();
      await VerificationToken.findByIdAndRemove(token._id);
      return 1;
    } else return 0;
  },
  getUserResumeData: async (id) => {
    try {
      let data = {
        details: {},
        resume_file: "",
        is_verified: "",
      };
      data["details"] = await userResumeData.findOne(
        { user_id: id },
        { _id: 0, user_id: 0, __v: 0, created_at: 0 }
      );

      const resumeData = await userResume.findOne(
        { user_id: id },
        { resume_file: 1 }
      );

      data["resume_file"] = resumeData.resume_file;

      const userDetail = await user.findById(id, { is_verified: 1 });
      data["is_verified"] = userDetail?.is_verified;

      if (data === [] || !data) return false;
      return data;
    } catch {
      return false;
    }
  },
  getUserPictureFile: async (id) => {
    try {
      const data = await userResumeData.findOne(
        { user_id: id },
        { basic_details: 1 }
      );

      if (data) {
        return data?.basic_details?.profile_picture;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  saveUserPicture: async (id, filePath) => {
    try {
      const basicDetails = await userResumeData.findOne(
        { user_id: id },
        { basic_details: 1 }
      );
      await userResumeData.findOneAndUpdate(
        { user_id: id },
        {
          basic_details: {
            ...basicDetails.basic_details,
            profile_picture: filePath,
          },
        }
      );

      return true;
    } catch {
      return false;
    }
  },
  deleteUserPicture: async (id) => {
    try {
      const basicDetails = await userResumeData.findOne(
        { user_id: id },
        { basic_details: 1 }
      );

      fs.unlink(basicDetails.basic_details.profile_picture, (err, msg) => {
        if (err) console.log(err);
        console.log(msg);
      });

      await userResumeData.findOneAndUpdate(
        { user_id: id },
        {
          basic_details: {
            ...basicDetails.basic_details,
            profile_picture: "",
          },
        }
      );

      return true;
    } catch {
      return false;
    }
  },
  saveUserResumeData: async (id, data) => {
    try {
      let dbUserData = await userResumeData.findOneAndUpdate(
        { user_id: id },
        { ...data }
      );
      // console.log(dbUserData);

      if (dbUserData.length === 0 || !dbUserData) return false;

      return dbUserData;
    } catch {
      return false;
    }
  },
  saveUserData: async (id, data) => {
    try {
      let dbUserData = await user.findOneAndUpdate({ _id: id }, { ...data });
      if (dbUserData.length === 0 || !dbUserData) return false;
      return dbUserData;
    } catch {
      return false;
    }
  },
  saveUserResume: async (id, data) => {
    try {
      let dbUserData = await userResume.findOneAndUpdate(
        { user_id: id },
        { ...data }
      );

      if (dbUserData.length === 0 || !dbUserData) return false;

      return dbUserData;
    } catch {
      return false;
    }
  },
  getUserResume: async (id) => {
    try {
      const data = await userResume.findOne(
        { user_id: id },
        { resume_file: 1, _id: 1, user_id: 1 }
      );
      // if (data?.user_id !== id) return 2;

      if (data === [] || !data) return false;
      return data.resume_file;
    } catch {
      return false;
    }
  },
  deleteUserAccount: async (id, pass) => {
    try {
      // get dbPassword
      const { password: dbPassword, email } = await user.findById(id, {
        password: 1,
        email: 1,
      });

      // check for password
      const isPassCorrect = await authMethods?.compareHash(pass, dbPassword);

      if (!isPassCorrect) return 1;
      else {
        // deleting account and resume
        await user.findOneAndDelete({ _id: id });
        await userResumeData.findOneAndDelete({ user_id: id });
        await userResume.findOneAndDelete({ user_id: id });

        return email;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  checkProfileStatus: async (id) => {
    const userData = await userResumeData.findOne(
      { user_id: id },
      { basic_details: 1, education: 1 }
    );

    if (!userData) return 1;
    const keys1 = [
      "full_name",
      "email",
      "age",
      "college",
      "branch",
      "admission_number",
      "contact",
    ];
    const keys2 = ["institute_name", "percentage", "year"];
    let percentComplete = 0;
    // first check basic details and assign percent complete
    for (const key in userData) {
      if (key === "basic_details") {
        for (const checkKey of keys1) {
          if (userData[key][checkKey] && userData[key][checkKey].length > 0) {
            percentComplete += 10;
          }
        }
      } else if (key === "education") {
        for (const innerKey in userData[key]) {
          for (const checkKey of keys2) {
            if (
              userData[key][innerKey][checkKey] &&
              userData[key][innerKey][checkKey].length > 0
            ) {
              percentComplete += 10;
            }
          }
        }
      }
    }

    if (percentComplete > 100) {
      percentComplete = 100;
    }
    return percentComplete;
  },
  // job routes
  applyToJob: async (job_id, user_id, application) => {
    try {
      // check if job exists
      const jobDetailsData = await jobDetails.findOne({ job_id: job_id });
      const jobDetailsDataApplicants = jobDetailsData?.job_stages?.find(
        (d) => d.name === "applicants"
      );

      // check if already applied
      const isApplied = jobDetailsDataApplicants?.data?.find(
        (d) => d.user_id === user_id
      );
      if (isApplied) return 2;

      // check before if form is open or not
      const jobData = await job.findOne(
        { _id: job_id },
        { last_date: 1, is_active: 1 }
      );
      if (!jobData?.is_active || new Date(jobData?.last_date) < new Date()) {
        return 3;
      }

      // apply to job
      jobDetailsData?.job_stages.forEach((d) => {
        if (d.name === "applicants") {
          d?.data.push({
            user_id: user_id,
            application,
            created_at: new Date(),
          });
        }
      });
      await jobDetails.findOneAndUpdate(
        { job_id: job_id },
        {
          job_stages: jobDetailsData.job_stages,
        }
      );

      // save in user's db
      const userData = await user.findById(user_id, {
        applied_to_jobs: 1,
        _id: 0,
      });

      // only job id should be stored
      userData.applied_to_jobs.push({
        job_id: job_id,
        created_at: new Date(),
      });

      await user.findByIdAndUpdate(user_id, {
        applied_to_jobs: userData.applied_to_jobs,
      });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  saveJob: async (job_id, user_id) => {
    try {
      let data = await user.findById(user_id, { saved_jobs: 1, _id: 0 });
      const jobData = await job.findById(job_id);

      // find if job is already saved
      const isJobSaved = data?.saved_jobs?.find((d) => d._id === job_id);

      // un save job
      if (isJobSaved) {
        data.saved_jobs = data?.saved_jobs?.filter((d) => d._id !== job_id);
        // update in db
        await user.findByIdAndUpdate(user_id, {
          saved_jobs: data.saved_jobs,
        });
        return 1;
      }
      // save
      // !TODO: Improve this
      // only job id should be stored
      else
        data?.saved_jobs?.push({
          _id: job_id,
          role: jobData.role,
          location: jobData.location,
          salary: jobData.salary,
          company_name: jobData.company_name,
          created_at: jobData.created_at,
          mode: jobData.mode,
          is_active: jobData.is_active,
        });

      // update in db
      await user.findByIdAndUpdate(user_id, {
        saved_jobs: data.saved_jobs,
      });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getSavedJobs: async (user_id) => {
    try {
      const data = await user.findById(user_id, { saved_jobs: 1, _id: 0 });
      // fetching job data based on saved job's id
      // const temp = data?.saved_jobs?.map(async (d) => {
      //   return await job.findById(d?.job_id)
      // });
      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  saveJobRecommendations: async (
    user_id,
    job_ids,
    recommendations,
    percentageData
  ) => {
    try {
      const data = {
        user_id: user_id,
        job_ids: job_ids,
        recommendations: recommendations,
        similarityPercentage: percentageData,
      };
      const newData = new jobRecommendation(data);
      await newData.save();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getSavedJobRecommendations: async (user_id) => {
    try {
      let recommendationsData = [];
      let similarityPercentageData = [];
      let temp1 = [];
      let temp2 = [];
      const data = await jobRecommendation.find(
        { user_id: user_id },
        { recommendations: 1, similarityPercentage: 1 }
      );
      // console.log(data);
      for (const job of data) {
        temp1 = job["recommendations"];
        recommendationsData.push(...temp1);
        temp2 = job["similarityPercentage"];
        similarityPercentageData.push(...temp2);
      }
      return {
        recommendations: recommendationsData,
        similarityPercentage: similarityPercentageData,
      };
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getAppliedJobs: async (user_id) => {
    try {
      let jobsData,
        jobIds = [];
      const data = await user.findById(user_id, { applied_to_jobs: 1, _id: 0 });

      // getting list of user ids in arr
      for (let d of data?.applied_to_jobs) {
        jobIds.push(d.job_id);
      }
      // converting user ids into object id schema
      const obj_ids = jobIds.map(function (id) {
        return mongoose.Types.ObjectId(id);
      });

      // converting ids to objects id
      jobsData = await job.find(
        { _id: { $in: obj_ids } },
        {
          company_name: 1,
          role: 1,
          _id: 1,
          location: 1,
          mode: 1,
          salary: 1,
          created_at: 1,
          is_active: 1,
        }
      );

      return jobsData;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getApplicationStatus: async (user_id, job_id) => {
    try {
      // 1. user detail like name,email,id resume,application date
      // 2. job details role, his status
      // 3. other details like Phone Interview In-Person Interview Offer Made Offer Accepted
      const data = {
        userDetails: {},
        jobDetails: {},
        roundDetails: {},
        userResume: "",
        userStatus: "",
        roundInformation: {},
      };
      let temp = [];

      // getting user data
      temp = await user.findById(user_id, {
        full_name: 1,
        email: 1,
        college_name: 1,
        college_branch: 1,
        applied_to_jobs: 1,
      });

      // checking if the user has applied to this job or not
      const hasUserApplied = temp.applied_to_jobs.find(
        (u) => u.job_id === job_id
      );
      // console.log({hasUserApplied});
      if (!hasUserApplied) return 1;

      data["userDetails"] = temp;
      // getting user resume
      temp = await userResume.findOne({ user_id: user_id }, { resume_file: 1 });
      data["userResume"] = temp.resume_file;

      // getting job details
      temp = await job.findById(job_id, {
        role: 1,
        company_name: 1,
        current_stage: 1,
      });
      const curr_stage = temp.current_stage;
      data["jobDetails"] = temp;

      // getting that current round entries
      temp = await jobDetails.findOne({ job_id: job_id }, { job_stages: 1 });
      let entries = [];
      if (curr_stage === "registration") {
        entries = temp.job_stages.find((d) => d.name === "applicants");
      } else {
        entries = temp.job_stages.find((d) => d.name === curr_stage);
      }

      // getting all the entry users data
      const ids = entries.data.map((u) => u.user_id);
      // converting it to object ids
      const obj_ids = ids.map(function (id) {
        return mongoose.Types.ObjectId(id);
      });
      // fetching users
      entries = await user.find(
        { _id: { $in: obj_ids } },
        {
          full_name: 1,
          email: 1,
          college_name: 1,
          college_branch: 1,
        }
      );

      data["roundDetails"] = entries;
      // check if the req made user is in the current round
      // if not then send failed
      const isUserInCurrRound = entries.find(
        (u) => u.email === data["userDetails"].email
      );
      // data["userStatus"] = isUserInCurrRound ? "Selected" : "Not Selected";
      // data["userStatus"] = isUserInCurrRound;
      console.log(curr_stage);

      const userInRounds = ["Applicants"];
      // finding in which round user in
      temp.job_stages.forEach((round) => {
        if (round.name !== "applicants") {
          const present = round.data.find((u) => u.user_id === user_id);
          present && userInRounds.push(round.name);
        }
      });
      console.log(userInRounds);
      data["userStatus"] = `${userInRounds[userInRounds.length-1]}`
      // sending extra round details
      if (
        [
          "aptitude test",
          "technical interview",
          "hr interview",
          "round",
        ].includes(curr_stage.toLowerCase())
      ) {
        temp = await jobRoundDetails.findOne(
          {
            job_id: job_id,
          },
          { admin_id: 0 }
        );
        if (temp) data["roundInformation"] = temp;
      }
      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getAdditionalQuestions: async (job_id) => {
    try {
      const data = await job.findById(job_id, { additional_questions: 1 });
      return data ? data : false;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  // dashboard
  dashboardAnalysis: async (user_id) => {
    try {
      const data = {
        appliedJobs: [],
        newJobs: [],
        prevYearPlacementsPerCompany: { labels: [], datasets: [{ data: [] }] },
        prevYearRoleDemand: { labels: [], datasets: [{ data: [] }] },
      };

      // total applied and applied jobs
      const appliedJobsIds = await user.findById(user_id, {
        applied_to_jobs: 1,
      });

      const appliedJobIds = appliedJobsIds?.applied_to_jobs?.map(
        (d) => d.job_id
      );
      data["appliedJobs"] = await job.find({
        _id: { $in: appliedJobIds },
      });

      // new jobs
      const date = new Date();
      const today = `${date.getFullYear()}-${
        date.getMonth() + 1 < 10
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1
      }-${date.getDate()}`;

      data["newJobs"] = await job.find({
        _id: {
          $not: { $in: appliedJobIds },
        },
        is_active: true,
        last_date: { $gte: today },
      });

      // prevYearRoleDemand
      // shows which roles where in great numbers in last year
      let labelNames = [];
      let nums = [];
      let temp = [];
      // getting prev year roles
      const year = new Date().getFullYear();
      temp = await job.find(
        {
          $and: [
            { created_at: { $gte: new Date(year - 1 + "") } },
            { created_at: { $lt: new Date(year + 1 + "") } },
          ],
        },
        { company_name: 1, role: 1, _id: 1,category:1 }
      );
      const allRoles = temp?.map((j) => j?.category.toLowerCase());
      labelNames = [...new Set(allRoles)];
      nums.length = labelNames.length;
      nums.fill(0);

      allRoles.forEach((role) => {
        const i = labelNames?.indexOf(role);
        nums[i] = nums[i] + 1;
      });

      data["prevYearRoleDemand"]["labels"] = labelNames;
      data["prevYearRoleDemand"]["datasets"][0]["data"] = nums;

      // showing previous company placements stats
      const prevJobs = await job.find(
        {
          $and: [
            { created_at: { $gte: new Date(year - 1 + "") } },
            { created_at: { $lt: new Date(year + "") } },
          ],
        },
        { _id: 1, company_name: 1, role: 1 }
      );

      labelNames = nums = [];
      labelNames = prevJobs.map((d) => d.company_name);
      labelNames = [...new Set(labelNames)];
      nums.length = labelNames.length;
      nums.fill(0);

      // getting ids of previous jobs to fetch other details
      let jobIds = prevJobs.map((d) => d._id);
      // converting user ids into object id schema
      jobIds = jobIds.map(function (id) {
        return mongoose.Types.ObjectId(id);
      });
      let selections = await jobDetails.find(
        { job_id: { $in: jobIds } },
        { job_stages: 1 }
      );
      // getting selected for jobs array data and then counting no of students selected
      temp = [];
      selections?.forEach((jobs) => {
        const { data } = jobs.job_stages.find(
          (stage) => stage.name === "selected_for_jobs"
        );
        temp.push(data?.length);
      });
      data["prevYearPlacementsPerCompany"]["labels"] = labelNames;
      data["prevYearPlacementsPerCompany"]["datasets"][0]["data"] = temp;

      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },

  // group routes
  applyToGroup: async (data, user_id) => {
    try {
      const groupData = await group.findOne({ code: data?.code });
      if (!groupData) return 1;

      // check if candidate is already applied to any group
      const userData = await user.findOne({ _id: user_id });
      if (userData?.applied_to_group?.group_id) {
        return 2;
      }

      groupData.members.push({
        name: userData?.full_name,
        user_id: user_id,
        email: userData?.email,
        contact: userData?.contact,
        subscribed: true,
        joined_at: new Date().toString(),
      });

      await group.findOneAndUpdate(
        { code: data?.code },
        {
          members: groupData.members,
        }
      );

      // saved in user's data
      await user.findOneAndUpdate(
        { _id: user_id },
        {
          applied_to_group: {
            group_id: groupData?._id,
            joined_at: new Date().toString(),
          },
        }
      );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  leaveGroup: async (data, user_id) => {
    try {
      await user.findOneAndUpdate(
        { _id: user_id },
        {
          applied_to_group: {},
        }
      );

      const groupData = await group.findOne(
        { _id: data?.group_id },
        {
          members: 1,
        }
      );

      const newMembers = groupData?.members?.filter(
        (u) => u.user_id !== user_id
      );
      await group.findOneAndUpdate(
        { _id: data?.group_id },
        {
          members: newMembers,
        }
      );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  unsubscribeGroupNotifications: async (data, user_id) => {},
  getMyGroup: async (user_id) => {
    try {
      const userData = await user.findOne(
        { _id: user_id },
        { applied_to_group: 1 }
      );
      if (!userData?.applied_to_group) return 1;

      const groupData = await group.find(
        { _id: userData?.applied_to_group?.group_id },
        { creator_id: 0 }
      );
      if (!groupData) return 1;

      return groupData;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  // notifications
  saveNotification: async (data) => {
    try {
      const newNotification = new notification(data);
      await newNotification.save();

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getNotifications: async (id) => {
    try {
      const data = notification
        .find({ receiver_id: id })
        .sort({ created_at: -1 });
      if (!data || data === null) return false;

      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  deleteNotification: async (id) => {
    try {
      const data = notification.findByIdAndDelete(id);
      if (!data || data === null) return false;
      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  changeStatusOfNotification: async (id, notifications_id) => {
    try {
      // let data = [];
      if (notifications_id?.length > 0) {
        // update status
        notifications_id?.forEach(async (n_id) => {
          await notification.findByIdAndUpdate(
            { receiver_id: id, _id: n_id },
            {
              status: "seen",
            }
          );
        });
        // // send new updated notifications back
        // notifications_id?.forEach(async (n_id) => {
        //   const n = await notification.findOne({ _id: n_id });
        //   console.log({n});
        //   data.push(n);
        // });
        // return data;
      }

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};

module.exports = userDbOperations;
