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
        res.status(200).json({
          isError: false,
          token: token,
          message: "Recruiter signed in successfully",
          code: ROLES_LIST[user.role],
          full_name:user.full_name,
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
      console.log(savedRecruiter);

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

      // send recruiter email of account creation
      const message = await commonMethods.sendEmail({
        subject: "Recruiter Account Created Successfully!",
        to: savedRecruiter.email.toString(),
        body: `<p>Hello ${savedRecruiter.full_name}, your recruiter account has been successfully created for ${savedRecruiter.company} company.
        <br/>
        Your account stands as unverified for now, your verification process will be completed within next 48hrs.
        <br/>
        After that you can perform all the tasks of a recruiter.
        <br/>
        <br/>
        <br/>
        If you haven't created this account, please contact us back immediately.
        <br/>
        For any queries or issues, please contact us using this email.
        </p>`,
      });

      console.log({ message });

      res.status(200).json({
        isError: false,
        token: token,
        message: `Recruiter registered successfully & ${message}`,
        code: ROLES_LIST[savedRecruiter.role],
        full_name: savedRecruiter.full_name,
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
