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
        full_name: "",
        email: "",
        contact: "",
        summary: "",
        address: "",
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

      if (data === [] || !data) return false;

      return data;
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
      // console.log(dbUserData);

      if (dbUserData.length === 0 || !dbUserData) return false;

      return dbUserData;
    } catch {
      return false;
    }
  },
  getUserResume: async (id) => {
    try {
      const data = await userResume.find({ user_id: id }, { resume_file: 1 });
      // console.log(data);
      if (data === [] || !data) return false;
      return data[0].resume_file;
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
      // console.log({ isPassCorrect });

      if (!isPassCorrect) return 1;
      else {
        // deleting account and resume
        await user.findOneAndDelete({ _id: id });
        await userResumeData.findOneAndDelete({ user_id: id });
        await userResume.findOneAndDelete({ user_id: id });

        return email;
      }
    } catch {
      return false;
    }
  },
  // job routes
  applyToJob: async (job_id, user_id) => {
    try {
      // check if job exists
      const jobDetailsData = await jobDetails.findOne({ job_id: job_id });
      // console.log(jobDetailsData);
      // if (jobDetailsData?.length === 0) return 1;

      // check if already applied
      const isApplied = jobDetailsData.applicants?.find(
        (d) => d.user_id === user_id
      );
      if (isApplied) return 2;

      // check before if form is open or not
      // apply to job
      jobDetailsData?.job_stages.forEach((d) => {
        if (d.name === "applicants") {
          d?.data.push({
            user_id: user_id,
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
      // !TODO: Improve this
      // only job id should be stored
      userData.applied_to_jobs.push({
        job_id: job_id,
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
  removeJobApp: async (job_id, user_id) => {},
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

  // group routes
  applyToGroup: async (data, user_id) => {
    try {
      const groupData = await group.findOne({ code: data?.code });
      if (!groupData) return 1;

      // check if candidate is already applied to any group
      const userData = await user.findOne(
        { _id: user_id },
      );
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
};

module.exports = userDbOperations;
