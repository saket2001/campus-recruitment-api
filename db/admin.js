//
const admin = require("../models/admin");

///////////////////////////

const adminDbOperations = {
  getAdminById: async (id) => await admin.findById(id, { password: 0,role:0,username:0,contact:0 }),
  getAdminByEmail: async (email, fields = {}) =>
    await admin.findOne({ email: email }, fields),
};

module.exports = adminDbOperations;
