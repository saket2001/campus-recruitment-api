const mongoose = require("mongoose");

const schema = mongoose.Schema;

// remove is_active as no resume builder available
const userResumeData = new schema({
  user_id: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  basic_details: {
    full_name: String,
    email: String,
    contact: String,
    summary: String,
    address: String,
    profile_picture: String,
    age: String,
    admission_number:String,
    college:String,
    branch: String,
    gender:String,
  },
  education: {},
  experience: {
    data: [
      {
        id: String,
        name: String,
        year: String,
        summary: String
      },
    ],
  },
  projects: {
    data: [
      {
        id: String,
        name: String,
        details: String,
      },
    ],
  },
  certificates: {
    data: [
      {
        id: String,
        name: String,
        year: String,
      },
    ],
  },
  skills: {
    data: [
      {
        id: String,
        name: String,
      },
    ],
  },
  hobbies: {
    data: [
      {
        id: String,
        name: String,
      },
    ],
  },
  extra_curricular: {
    data: [
      {
        id: String,
        name: String,
      },
    ],
  },
  languages: {
    data: [
      {
        id: { type: String },
        name: { type: String },
      },
    ],
  },
  created_at: mongoose.Schema.Types.Date,
  last_edited:mongoose.Schema.Types.Date,
});
// const userResumeData = new schema({
//   user_id: {
//     required: true,
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "user",
//   },
//   basic_details: {
//     full_name: String,
//     email: String,
//     contact: String,
//     summary: String,
//     address: String,
//     profile_picture: String,
//     age: String,
//     admission_number:String,
//     college:String,
//     branch: String,
//     gender:String,
//   },
//   education: {
//   },
//   experience: {
//     isActive: false,
//     data: [
//       {
//         id: String,
//         name: String,
//         year: String,
//         summary: String
//       },
//     ],
//   },
//   projects: {
//     isActive: false,
//     data: [
//       {
//         id: String,
//         name: String,
//         details: String,
//       },
//     ],
//   },
//   certificates: {
//     isActive: false,
//     data: [
//       {
//         id: String,
//         name: String,
//         year: String,
//       },
//     ],
//   },
//   skills: {
//     isActive: false,
//     data: [
//       {
//         id: String,
//         name: String,
//       },
//     ],
//   },
//   hobbies: {
//     isActive: false,
//     data: [
//       {
//         id: String,
//         name: String,
//       },
//     ],
//   },
//   extra_curricular: {
//     isActive: Boolean,
//     data: [
//       {
//         id: String,
//         name: String,
//       },
//     ],
//   },
//   languages: {
//     isActive: { type: Boolean },
//     data: [
//       {
//         id: { type: String },
//         name: { type: String },
//       },
//     ],
//   },
//   created_at: mongoose.Schema.Types.Date,
//   last_edited:mongoose.Schema.Types.Date,
// });

module.exports = mongoose.model("userResumeData", userResumeData);
