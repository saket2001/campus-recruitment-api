//
const admin = require("../models/admin");
const group = require("../models/group");
const user = require("../models/user");
const notice = require("../models/notice");
const { randomUUID } = require("crypto");
const jobDetails = require("../models/jobDetails");
const job = require("../models/job");
const mongoose = require("mongoose");
///////////////////////////

const adminDbOperations = {
  getAdminById: async (id) =>
    await admin.findById(id, { password: 0, role: 0, username: 0, contact: 0 }),
  getAdminByEmail: async (email, fields = {}) =>
    await admin.findOne({ email: email }, fields),
  createGroup: async (id, body, code) => {
    try {
      // check if group exists
      const groupExists = await group.findOne({ title: body?.title });
      if (groupExists) return 1;

      // creating code for group
      let newCode = randomUUID().split("-")[0];
      const doesGroupExistsWithSameCode = await group.findOne({
        code: newCode,
      });

      if (doesGroupExistsWithSameCode) newCode = randomUUID().split("-")[0];

      const newGroupData = {
        title: body?.title,
        year: body?.year,
        creator_id: id,
        creator_name: body?.creator_name,
        date_created: new Date().toString(),
        posts: [],
        members: [],
        code: newCode,
      };
      const newGroup = new group(newGroupData);
      const savedGroup = await newGroup.save();

      if (savedGroup) return newCode;
      else return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getMyGroups: async (id) => {
    try {
      // check if group exists
      const groupData = await group.find({ creator_id: id });
      if (!groupData) return 1;

      return groupData;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  deleteGroup: async (id) => {
    try {
      // check if group exists
      const groupData = await group.findOneAndDelete({ _id: id });
      if (!groupData) return 1;

      return groupData;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getMembersDetails: async (group_id) => {
    try {
      // check if group exists
      const groupMembersData = await group.find(
        { _id: group_id },
        { members: 1, creator_name: 1 }
      );
      if (!groupMembersData) return 1;

      return groupMembersData;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  deleteGroupMember: async (group_id, user_id) => {
    try {
      // check if group exists
      const groupData = await group.findOne({ _id: group_id }, { members: 1 });
      if (!groupData) return 1;

      // removing user from group
      const newMembers = groupData?.members?.filter(
        (member) => member?.user_id !== user_id
      );
      // saving
      await group.findOneAndUpdate({ _id: group_id }, { members: newMembers });

      // removing group entry from user
      await user.findOneAndUpdate(
        { _id: user_id },
        {
          applied_to_group: {},
        }
      );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  createNotice: async (body, creator_id) => {
    try {
      // creating new
      const newNotice = new notice({
        group_id: body?.group_id,
        creator_id: creator_id,
        title: body?.title,
        body: body?.body,
        isAlertOn: !!body?.isAlertOn,
        created_at: new Date(),
      });
      const savedNotice = await newNotice.save();
      // // saving in group data
      // const groupData = await group.findOne(
      //   { _id: body?.group_id },
      //   { posts: [] }
      // );
      // groupData?.posts.push(savedNotice._id);
      // await group.findOneAndUpdate(
      //   { _id: body?.group_id },
      //   {
      //     posts: groupData?.posts,
      //   }
      // );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  editNotice: async (body, notice_id) => {
    try {
      const data = await notice.findOneAndUpdate(
        { _id: notice_id },
        {
          ...body,
        }
      );
      if (!data) return 1;
      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  deleteNotice: async (notice_id) => {
    try {
      const data = await notice.findOneAndDelete({ _id: notice_id });
      if (!data) return 1;
      if (data) return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  viewAllNotices: async (group_id) => {
    try {
      const data = {
        group_details: {},
        notices: [],
      };
      data["group_details"] = await group.findOne({ _id: group_id });
      data["notices"] = await notice.find({ group_id: group_id });
      if (data?.length <= 0) return 1;

      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  viewNotice: async (notice_id) => {
    try {
      const data = await notice.findOne({ _id: notice_id });
      if (data?.length <= 0) return 1;

      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  // manage page
  getAllUsers: async (year) => {
    try {
      // console.log(+year+1);
      const currYear = new Date(year);
      const allUsers = await user.find(
        {
          created_at: { $gte: currYear },
        },
        {
          password: 0,
          role: 0,
          saved_jobs: 0,
          applied_to_group: 0,
          applied_to_jobs: 0,
        }
      );

      // manually filtering on year
      const filteredUsers = allUsers.filter(
        (u) => new Date(u.created_at).getFullYear() === +year
      );
      return filteredUsers;
    } catch {
      return false;
    }
  },
  getAllRecruiters: async (year) => {
    try {
      const currYear = new Date(year);
      const allRecruiters = await recruiter.find(
        {
          created_at: { $gte: currYear },
        },
        {
          password: 0,
          role: 0,
        }
      );

      // manually filtering on year
      const data = allRecruiters.filter(
        (u) => new Date(u.created_at).getFullYear() === +year
      );

      return data;
    } catch {
      return false;
    }
  },
  getAllCompanies: async (year) => {
    try {
      const currYear = new Date(year);
      const allCompanies = await company.find({
        created_at: { $gte: currYear },
      });

      // manually filtering on year
      const data = allCompanies.filter(
        (u) => new Date(u.created_at).getFullYear() === +year
      );

      return data;
    } catch {
      return false;
    }
  },
  deleteUser: async (user_id) => {
    try {
      if (!user_id) return 1;
      const res = await user.findByIdAndDelete(user_id);
      return res ? true : false;
    } catch {
      return false;
    }
  },
  toggleUserVerification: async (user_id) => {
    try {
      const userData = await user.findById(user_id, {
        is_verified: 1,
      });

      // look if user found
      if (!userData) return 1;

      // change status
      userData.is_verified = !userData.is_verified;
      // save
      await user.findByIdAndUpdate(user_id, {
        is_verified: userData.is_verified,
      });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  // dashboard
  dashboardAnalysis: async (id) => {
    try {
      const data = {
        totalStudents: 0,
        totalPlacedStudents: 0,
        jobResponses: [],
        studentsPerBranch: { labels: [], datasets: [{ data: [] }] },
        prevYearPlacementsPerCompany: { labels: [], datasets: [{ data: [] }] },
      };
      let temp = 0;
      // students
      temp = await user.find(
        { isVerified: true },
        { _id: 1, college_branch: 1, current_status: 1 }
      );
      data["totalStudents"] = temp.length;

      // students per branch graph
      let branchNames = [];
      let nums = [];
      branchNames = temp?.map((u) => {
        if (u?.college_branch) return u?.college_branch;
      });
      branchNames = [...new Set(branchNames)];
      nums.length = branchNames.length;
      nums.fill(0);

      temp.forEach((u) => {
        const i = branchNames?.indexOf(u?.college_branch);
        nums[i] = nums[i] + 1;

        // placed students
        if (u?.current_status === "placed") {
          data["totalPlacedStudents"] = data["totalPlacedStudents"] + 1;
        }
      });

      data["studentsPerBranch"]["labels"] = branchNames;
      data["studentsPerBranch"]["datasets"][0]["data"] = nums;

      // placed students

      // job responses
      const jobDetailsData = await jobDetails.find(
        { created_by: id },
        { job_stages: 1 }
      );
      const jobResponses = [];
      jobDetailsData?.forEach((job) => {
        const applicants = job?.job_stages.find((d) => d.name === "applicants");
        jobResponses.push(applicants?.data?.length);
      });

      const allJobs = await job.find({ created_by: id, is_active: true });
      const jobResponsesName = allJobs?.map((j) => `${j.role}`);
      data["jobResponses"] = {
        labels: jobResponsesName,
        datasets: [
          {
            label: "Responses per job",
            data: jobResponses,
            backgroundColor: "rgba(56, 55, 221, 0.8)",
          },
        ],
      };

      // previous placements per company
      const year = new Date().getFullYear();
      const prevYear = new Date().getFullYear() - 2;
      // getting all companies that came 2 years back
      const prevJobs = await job.find(
        {
          $and: [
            { created_at: { $gte: new Date(prevYear + "") } },
            { created_at: { $lt: new Date(year + "") } },
          ],
        },
        { _id: 1, company_name: 1, role: 1 }
      );

      branchNames = nums = [];
      branchNames = prevJobs.map((d) => d.company_name);
      branchNames = [...new Set(branchNames)];
      nums.length = branchNames.length;
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
      data["prevYearPlacementsPerCompany"]["labels"] = branchNames;
      data["prevYearPlacementsPerCompany"]["datasets"][0]["data"] = temp;

      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};

module.exports = adminDbOperations;
