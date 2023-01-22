const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
// const userDbOperations = require("../db/user");
const saltRounds = 10;
/////////////////////////
const authMethods = {
  generateHash: async (text) => await bcrypt.hash(text, saltRounds),
  compareHash: async (input, dbValue) => await bcrypt.compare(input, dbValue),
  signJWT: async (value) =>
    JWT.sign(value, process.env.SECRET_FOR_TOKEN, { expiresIn: "30m" }),
  authenticateToken: async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token === null) return res.status(403).json({message:"You are not authorized to access"});

    JWT.verify(token, process.env.SECRET_FOR_TOKEN, (err, data) => {
      if (err) {
        console.log({ err });
        return res
          .status(403)
          .json({ isError: true, message: "Token expired" });
      }
      req.user = data;
      req.roles = data.roles;
      next();
    });
  },
  verifyUser: (...allowedRoles) => {
    return (req, res, next) => {
      // if no req found
      if (!req || !req.roles) return res.sendStatus(401);

      // taking user roles allowed from route
      const allowedRolesArr = [...allowedRoles];

      // console.log(req.roles)

      // checking roles
      const result = req.roles
        ?.map((role) => allowedRolesArr.includes(role))
        .find((val) => val === true);

      // if no role found
      if (!result) return res.sendStatus(401);
      next();
    };
  },
};

module.exports = authMethods;
