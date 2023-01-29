const authMethods = require("../../utils/auth");
const companyDbOperations = require("../../db/company");
const commonMethods = require("../../utils/common");
//////////////////////////////////
const authController = {
  companyRegistration: async (req, res) => {
    const body = req.body;
    console.log(body);

    // checks for if any input field is empty
    const isValid = await commonMethods.checkInputs(body);
    if (!isValid.status)
      return res.status(200).json({ isError: true, message: isValid.message });

    try {
      const company = {
        full_name: body.full_name,
        email: body.email,
        about: body.about,
        contact_no: body.contact,
        isVerified: false,
        recruiters: [],
        created_at: new Date(),
      };

      // checking if company already exists and saving it
      const savedCompany = await companyDbOperations.registerCompany(company);

      if (savedCompany === 1)
        return res.status(200).json({
          isError: true,
          message: "Company with this email already exists",
        });

      // send company id to company email for creating recruiters
      commonMethods.sendEmail({
        subject: "Company Account Created Successfully!",
        to: savedCompany?.email.toString(),
        viewName: "companyVerification",
        context: {
          company_name: savedCompany?.full_name,
          company_id: savedCompany?._id,
          time: new Date().toDateString(),
        },
      });

      res.status(200).json({
        isError: false,
        message: "Company registered successfully",
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ isError: true, message: "Something went wrong on the server" });
    }
  },
  getCompanyById: async (req, res) => {
    const admin_id = req.user.id;
    const role = req.user.role;
    try {
      if (role !== "admin")
        return res
          .status(403)
          .json({ isError: true, message: "Access denied" });
      const user = await adminDbOperations.getAdminById(admin_id);
      res.status(200).json({ data: user });
    } catch {
      res.status(500).json({ message: "Something went wrong on the server" });
    }
  },
};

module.exports = authController;
