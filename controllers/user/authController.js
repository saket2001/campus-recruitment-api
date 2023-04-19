const authMethods = require("../../utils/auth");
const userDbOperations = require("../../db/user");
const commonMethods = require("../../utils/common");
const ROLES_LIST = require("../../constants/roles_list");

//////////////////////////////////

const authController = {
  userSignIn: async (req, res) => {
    const body = req.body;

    // checks for if any input field is empty
    const isValid = await commonMethods.checkInputs(body);
    if (!isValid.status)
      return res.status(200).json({ isError: true, message: isValid.message });

    try {
      const user = await userDbOperations.getUserByEmail(body.user_email, {
        password: 1,
        _id: 1,
        role: 1,
        full_name: 1,
      });

      if (user === null)
        return res.status(200).json({
          isError: true,
          message: "User with this email id not found!",
        });

      if (await authMethods.compareHash(body.user_password, user.password)) {
        // assigning role codes acc to saved in db
        const accessToken = await authMethods.signJWT({
          id: user._id,
          roles: [ROLES_LIST[user["role"]]],
        });
        const refreshToken = await authMethods.signRefreshJWT({
          id: user._id,
          roles: [ROLES_LIST[user["role"]]],
        });
        res.status(200).json({
          user_id: user._id,
          isError: false,
          token: accessToken,
          refreshToken: refreshToken,
          message: "User signed in successfully",
          code: ROLES_LIST[user["role"]],
          full_name: user["full_name"],
        });
      } else {
        res.status(200).json({
          isError: true,
          message: "User password didn't match. Try again",
        });
      }
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ isError: true, message: "Something went wrong on the server" });
    }
  },
  userSignUp: async (req, res) => {
    const body = req.body;
    const hashedPassword = await authMethods.generateHash(body.user_password);

    // checks for if any input field is empty
    const isValid = await commonMethods.checkInputs(body);
    if (!isValid.status)
      return res.status(200).json({ isError: true, message: isValid.message });

    try {
      const user = {
        full_name: body.user_name,
        email: body.user_email,
        password: hashedPassword,
        contact_no: body.user_contact,
        college_name: body.college_name,
        college_branch: body.college_branch,
        date_of_birth: body.date_of_birth,
        gender: body.gender,
        role: "user",
        is_verified: false,
        created_at: new Date(),
      };

      // checking if user already exists and saving it
      const response = await userDbOperations.registerUser(user);
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "User with this email already exists",
        });

      const token = await authMethods.signJWT({
        id: response.SavedUser._id.toString(),
        roles: [ROLES_LIST[user.role]],
      });
      const refreshToken = await authMethods.signRefreshJWT({
        id: response.SavedUser._id.toString(),
        roles: [ROLES_LIST[user.role]],
      });

      // send email of account creation and verification process
      commonMethods.sendEmail({
        subject: "User Account Created!",
        to: body?.user_email?.toString(),
        viewName: "userVerification",
        context: {
          link:`http://localhost:3000/auth/user/account-verification?id=${response.SavedUser._id.toString()}&token=${token}`,
          time: new Date().toDateString(),
        },
      });

      // !Bug On no email found user doesn't get any response
      // !TODO delete user account at such time

      res.status(200).json({
        isError: false,
        token: token,
        refreshToken,
        user_id: response.SavedUser._id.toString(),
        message: "User registered successfully",
        code: ROLES_LIST[response.SavedUser["role"]],
        full_name: response.SavedUser["full_name"],
      });
    } catch {
      // userDbOperations.deleteUserById();
      res
        .status(500)
        .json({ isError: true, message: "Something went wrong on the server" });
    }
  },
  userSignInGoogle: async (req, res) => {
    // just check if user exists in our db
    const body = req.body;
    console.log(body);
    // checks for if any input field is empty
    const isValid = await commonMethods.checkInputs(body);
    if (!isValid.status)
      return res.status(200).json({ isError: true, message: isValid.message });

    try {
      const user = await userDbOperations.getUserByEmail(body.user_email, {
        password: 1,
        _id: 1,
        role: 1,
        full_name: 1,
      });

      if (user === null)
        return res.status(200).json({
          isError: true,
          message: "User with this email id not found!",
        });

      const token = await authMethods.signJWT({
        id: user._id,
        roles: [ROLES_LIST[user["role"]]],
      });
      const refreshToken = await authMethods.signRefreshJWT({
        id: user._id,
        roles: [ROLES_LIST[user["role"]]],
      });

      res.status(200).json({
        isError: false,
        token: token,
        user_id:user._id,
        message: "User signed in successfully",
        code: ROLES_LIST[user["role"]],
        full_name: user["full_name"],
        refreshToken,
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ isError: true, message: "Something went wrong on the server" });
    }
  },
  userSignUpGoogle: async (req, res) => {
    const body = req.body;
    console.log({body});

    // checks for if any input field is empty
    const isValid = await commonMethods.checkInputs(body);

    if (!isValid.status)
      return res.status(200).json({ isError: true, message: isValid.message });

    try {
      const user = {
        full_name: body.user_name,
        email: body.user_email,
        password: "",
        role: "user",
        gender:"",
        is_verified: false,
        contact_no: "",
        created_at: new Date(),
      };

      // checking if user already exists and saving it
      const response = await userDbOperations.registerUser(user);
      console.log({ response });
      
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "User with this email already exists",
        });

      const token = await authMethods.signJWT({
        id: response.SavedUser?._id.toString(),
        roles: [ROLES_LIST[response.SavedUser?.role]],
      });
      const refreshToken = await authMethods.signRefreshJWT({
        id: response.SavedUser?._id.toString(),
        roles: [ROLES_LIST[response.SavedUser?.role]],
      });

      res.status(200).json({
        isError: false,
        token: token,
        message: `User registered successfully`,
        code: ROLES_LIST[response.SavedUser["role"]],
        full_name: response.SavedUser["full_name"],
        refreshToken,
        user_id: response.SavedUser?._id.toString(),
      });
    } catch (err) {
      console.log({ err });
      res
        .status(500)
        .json({ isError: true, message: "Something went wrong on the server" });
    }
  },
  userEmailVerification: async (req, res) => {
    try {
      // get user id
      const user_id = req.params["user_id"];
      const token = req.params["token"];

      // check if user exists
      const response = await userDbOperations.userVerification(user_id, token);

      if (response === 1)
        res.status(200).json({
          isError: false,
          message: `User verified successfully`,
        });
      else
        res.status(200).json({
          isError: true,
          message: `User not verified successfully`,
        });
    } catch (err) {
      console.log({ err });
      res
        .status(500)
        .json({ isError: true, message: "Something went wrong on the server" });
    }
  },
};

module.exports = authController;
