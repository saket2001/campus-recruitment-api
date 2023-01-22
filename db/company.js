const company = require("../models/company");
///////////////////////////

const companyDbOperations = {
  registerCompany: async (companyData) => {
    // first look for any company with same email id
    const companyAlreadyExists = await company.findOne({
      email: companyData.email,
    });
    if (companyAlreadyExists) return 1;

    const newCompany = new company(companyData);
    return await newCompany.save();
  },
  getCompanyById: async (id) => await company.findById(id),
  getCompanyByEmail: async (email, fields = {}) =>
    await company.findOne({ email: email }, fields),
  deleteCompanyById: async (id) => await company.findByIdAndDelete(id),
};


module.exports = companyDbOperations;
