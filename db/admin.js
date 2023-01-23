//
const admin = require("../models/admin");
const group = require("../models/group");
const user = require("../models/user");
const { randomUUID } = require("crypto");
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
  deleteGroupMember: async (group_id,user_id) => {
    try {
      // check if group exists
      const groupData = await group.findOne({ _id: group_id }, { members: 1 });
      if (!groupData) return 1;

      // removing user from group
      const newMembers = groupData?.members?.filter((member) => member?.user_id !== user_id);
      // saving
      await group.findOneAndUpdate({ _id: group_id }, { members: newMembers });

      // removing group entry from user
      await user.findOneAndUpdate({ _id: user_id }, {
        applied_to_group: {}
      });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};

module.exports = adminDbOperations;
