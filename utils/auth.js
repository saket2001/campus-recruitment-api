const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
// const userDbOperations = require("../db/user");
const saltRounds = 10;
/////////////////////////
const authMethods = {
  generateHash: async (text) => await bcrypt.hash(text, saltRounds),
  compareHash: async (input, dbValue) => await bcrypt.compare(input, dbValue),
  signJWT: async (value) =>
    JWT.sign(value, process.env.SECRET_FOR_TOKEN, { expiresIn: "20s" }),
  signRefreshJWT: async (value) =>
    JWT.sign(value, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "120m",
    }),
  authenticateToken: async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token === null)
      return res
        .status(403)
        .json({ message: "You are not authorized to access" });

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
  refreshToken: (req, res) => {
    if (req.body?.jwt) {
      console.log("GOT IN...")
      // Destructuring refreshToken from cookie
      const refreshToken = req.body.jwt;
      
      // Verifying refresh token
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err) {
            // Wrong Refresh Token
            return res
              .status(406)
              .json({ isError: true, message: "Unauthorized Access" });
          } else {
            // Correct token we send a new access token
            const accessToken = JWT.sign(
              {
                id: decoded.id,
                roles: decoded.roles,
              },
              process.env.SECRET_FOR_TOKEN,
              {
                expiresIn: "60m",
              }
            );
            return res.json({ isError: false, token: accessToken });
          }
        }
      );
    } else {
      return res
        .status(406)
        .json({ isError: true, message: "Unauthorized Access" });
    }
  },
};

module.exports = authMethods;
