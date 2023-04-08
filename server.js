const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user_routes");
const commonRoutes = require("./routes/common_routes");
const adminRoutes = require("./routes/admin_routes");
const cookieparser = require("cookie-parser");
let session = require("express-session");
const { socketIO, socketUtils } = require("./utils/socketIO");
// const path = require('path');
// const rateLimit = require('express-rate-limit')
require("dotenv").config();
//////////////////////////////////
const PORT = process.env.PORT;
const server = express();
server.use(express.json());
server.use(cookieparser());
server.use(
  cors({
    exposedHeaders: ["Content-Type"],
  })
);
// rate limiting 
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 20, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
// });
server.set("trust proxy", 1); // trust first proxy
server.use(
  session({
    secret: "218294xjaskand381mdjaye",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 12000000 }, // 60min  12000000
  })
);
server.use(express.urlencoded({ extended: true }));
server.use(express.static("files"));
server.use("/files", express.static("files"));

//////////////////////////////////
// db connection
mongoose
  .connect(process.env.dbURL)
  .then(() => {
    console.log("Connection established");
    server.listen(PORT, (err) => {
      if (err) return console.log("Something went wrong");
      console.log(`Server running on port http://localhost:${PORT}/api/v1`);
    });
  })
  .catch((error) => console.log(error));

//////////////////////////////////
// all routes
server.get("/api/v1/check-status", (req, res) => {
  return res.status(200).send("Server is active");
});
server.use("/api/v1/", commonRoutes);
server.use("/api/v1/user", userRoutes);
server.use("/api/v1/admin", adminRoutes);

// global.__basedir = path.resolve(__dirname);
//////////////////////////////////
// socketIO.on("connection", (socket) => {
//   socket.on("sample", (text) => {
//     console.log(text);
//     socket.broadcast.emit('receive-sample', text);
//   });
// });

// session online users
const onlineSessionUsers = [];
module.exports = onlineSessionUsers;

socketIO.on("connection", (socket) => {
  socket.on("user-login", (data) => {
    socketUtils.addUserToSession(data);
  });

  // on disconnect
  socket.on("disconnect", () => {
    socketUtils.removeUserFromSession(socket.id);
  });
});
