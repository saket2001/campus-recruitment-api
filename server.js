const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// const routes = require("./routes") 
const userRoutes = require("./routes/user_routes");
const recruiterRoutes = require("./routes/recruiter_routes");
const commonRoutes = require("./routes/common_routes");
const adminRoutes = require("./routes/admin_routes");
let session = require("express-session");

//////////////////////////////////
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const server = express();
server.use(express.json());
server.use(cors({
  exposedHeaders:['Content-Type']
}));
server.set("trust proxy", 1); // trust first proxy
server.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 120000000000 }, // 60min  12000000
  })
);
server.use(express.urlencoded({ extended: true }));
server.use(express.static("files")); 
server.use("/files", express.static("files"));

// db connection
mongoose.connect(process.env.dbURL).then(() => {
  console.log("Connection established")
  server.listen(PORT, (err) => {
    if (err) return console.log("Something went wrong");
    console.log(`Server running on port http://0.0.0.0:${PORT}/api/v1`);
  });
}).catch((error) => console.log(error));

//////////////////////////////////
// all routes
// server.use('/api/v1', routes)
server.use('/api/v1/',commonRoutes)
server.use('/api/v1/user',userRoutes)
server.use("/api/v1/recruiter", recruiterRoutes);
server.use("/api/v1/admin", adminRoutes);

//////////////////////////////////
// server.listen(PORT, (err) => {
//     if(err) return console.log("Something went wrong")
//     console.log(`Server running on port http://localhost:${PORT}/api/v1`);
// });