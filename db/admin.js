//
const admin = require("../models/admin");
const group = require("../models/group");
const user = require("../models/user");
const notice = require("../models/notice");
const { randomUUID } = require("crypto");
const recruiter = require("../models/recruiter");
const company = require("../models/company");

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
  deleteRecruiter: async (user_id) => {
    try {
      if (!user_id) return 1;
      const res = await recruiter.findByIdAndDelete(user_id);
      return res ? true : false;
    } catch {
      return false;
    }
  },
  deleteCompany: async (company_id) => {
    try {
      if (!company_id) return 1;
      const res = await company.findByIdAndDelete(company_id);
      return res ? true : false;
    } catch {
      return false;
    }
  },
  toggleCompanyVerification: async (company_id, data) => {
    try {
      if (!company_id) return 1;
      const res = await company.findByIdAndUpdate(company_id, {
        isVerified: data,
      });

      return res ? true : false;
    } catch {
      return false;
    }
  },
  toggleRecruiterVerification: async (user_id, data) => {
    try {
      if (!user_id) return 1;
      const res = await recruiter.findByIdAndUpdate(user_id, {
        isVerified: data,
      });

      return res ? true : false;
    } catch {
      return false;
    }
  },
};

module.exports = adminDbOperations;
