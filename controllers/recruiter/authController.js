const authMethods = require("../../utils/auth");
const commonMethods = require("../../utils/common");
// const sendEmail = require("../../utils/sendEmail");
const recruiterDbOperations = require("../../db/recruiter");
const company = require("../../models/company");
const ROLES_LIST = require("../../constants/roles_list");
//////////////////////////////////
const authController = {
  recruiterSignIn: async (req, res) => {
    const body = req.body;

    // checks for if any input field is empty
    const isValid = await commonMethods.checkInputs(body);
    if (!isValid.status)
      return res.status(200).json({ isError: true, message: isValid.message });

    try {
      const user = await recruiterDbOperations.getRecruiterByEmail(
        body.email,
        {
          password: 1,
          _id: 1,
          role: 1,
          full_name:1,
        }
      );
      if (user === null)
        return res.status(200).json({
          isError: true,
          message: "Recruiter with this email id not found!",
        });

      if (await authMethods.compareHash(body.user_password, user.password)) {
        const token = await authMethods.signJWT({
          id: user._id,
          roles:[ROLES_LIST[user.role]],
        });
        const refreshToken = await authMethods.signRefreshJWT({
          id: user._id,
          roles:[ROLES_LIST[user.role]],
        });
        res.status(200).json({
          isError: false,
          token: token,
          message: "Recruiter signed in successfully",
          code: ROLES_LIST[user.role],
          full_name: user.full_name,
          refreshToken,
        });
      } else {
        res.status(200).json({
          isError: true,
          message: "Recruiter password didn't match. Try again",
        });
      }
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ isError: true, message: "Something went wrong on the server" });
    }
  },
  recruiterSignUp: async (req, res) => {
    const body = req.body;
    const hashedPassword = await authMethods.generateHash(body.user_password);

    // checks for if any input field is empty
    const isValid = await commonMethods.checkInputs(body);
    if (!isValid.status)
      return res.status(200).json({ isError: true, message: isValid.message });

    // recruiter can be registered only if company is verified by admin
    const isCompanyVerified = await company.findById(body.company_id, {
      isVerified: 1,
    });

    if (!isCompanyVerified.isVerified)
      return res
        .status(200)
        .json({
          isError: true,
          message:
            "To register recruiters the company should be verified first!",
        });

    try {
      const recruiter = {
        full_name: body.user_name,
        email: body.email,
        password: hashedPassword,
        contact_no: body.user_contact,
        role: "recruiter",
        company_id: body.company_id,
        company: body.company,
        isVerified: false,
        jobs_posted: [],
        created_at: new Date(),
      };

      // checking if user already exists and saving it
      const savedRecruiter = await recruiterDbOperations.registerRecruiter(
        recruiter
      );
      

      if (savedRecruiter === 1)
        return res.status(200).json({
          isError: true,
          message: "Recruiter with this email already exists",
        });

      if (savedRecruiter === 2)
        return res.status(200).json({
          isError: true,
          message: "Company with given id is not found",
        });
      
      if (savedRecruiter === 3)
        return res.status(200).json({
          isError: true,
          message: "Any company can not have more than 2 recruiters!",
        });

      const token = await authMethods.signJWT({
        id: savedRecruiter._id.toString(),
        roles: [ROLES_LIST[savedRecruiter.role]],
      });
      const refreshToken = await authMethods.signRefreshJWT({
        id: savedRecruiter._id.toString(),
        roles: [ROLES_LIST[savedRecruiter.role]],
      });

      // send recruiter email of account creation
      commonMethods.sendEmail({
        subject: "Recruiter Account Created Successfully!",
        to: savedRecruiter.email.toString(),
        viewName: "recruiterCreation",
        context: {
          time: new Date().toDateString(),
          company_name: savedRecruiter?.company,
        },
      });

      res.status(200).json({
        isError: false,
        token: token,
        message: `Recruiter registered successfully`,
        code: ROLES_LIST[savedRecruiter.role],
        full_name: savedRecruiter.full_name,
        refreshToken,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        isError: true,
        message: "Something went wrong on the server",
      });
    }
  },
};

module.exports = authController;
