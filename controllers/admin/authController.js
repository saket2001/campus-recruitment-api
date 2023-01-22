const authMethods = require("../../utils/auth");
const adminDbOperations = require("../../db/admin");
const commonMethods = require("../../utils/common");
const ROLES_LIST = require("../../constants/roles_list");
//////////////////////////////////

const authController = {
  adminSignIn: async (req, res) => {
    const body = req.body;

    // checks for if any input field is empty
    const isValid = await commonMethods.checkInputs(body);
    if (!isValid.status)
      return res.status(200).json({ isError: true, message: isValid.message });

    try {
      const admin = await adminDbOperations.getAdminByEmail(body.email, {
        password: 1,
        username: 1,
        _id: 1,
        role:1,
        full_name: 1,
        email:1,
      });

      //   checking if admin got is null or not
      if (admin === null)
        return res.status(200).json({
          isError: true,
          message: "Admin with this email id not found!",
        });

      if (
        (await authMethods.compareHash(body.user_password, admin.password)) &&
        (await authMethods.compareHash(body.user_username, admin.username))
      ) {
        const token = await authMethods.signJWT({
          id: admin._id,
          roles: [ROLES_LIST[admin['role']]],
        });
        
        res.status(200).json({
          isError: false,
          token: token,
          message: "Admin signed in successfully",
          code: ROLES_LIST[admin["role"]],
          full_name:admin.full_name,
        });

        //   TODO send sign in mail
        commonMethods.sendEmail({
          subject: "Admin sign in conformation",
          to: admin?.email?.toString(),
          body: `Greetings Admin
          <br/>
          Your account was just logged in 
          at ${new Date().toDateString()} , ${new Date().toLocaleTimeString()}. 
          <br/> 
          This mail was sent to you for alerting account sign in.
        `,
        });
      } else {
        res.status(200).json({
          isError: true,
          message: "Admin password or username didn't match. Try again",
        });
      }
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ isError: true, message: "Something went wrong on the server" });
    }
  },
  getAdminById: async (req, res) => {
    const admin_id = req.user.id;
    const role = req.user.role;
    try {
      if (role !== "admin") return res.status(403).json({ isError: true,message:"Access denied" });
      const user = await adminDbOperations.getAdminById(admin_id);
      res.status(200).json({ data: user });
    } catch {
      res.status(500).json({ message: "Something went wrong on the server" });
    }
  },
};

module.exports = authController;
