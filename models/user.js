const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    // required: true,
  },
  contact_no: {
    type: String,
    // required: true,
  },
  date_of_birth: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },
  college_name: {
    type: String,
  },
  college_year: {
    type: String,
  },
  college_branch: {
    type: String,
  },
  college_UID: {
    type: String,
  },
  created_at: {
    type: mongoose.Schema.Types.Date,
    required: true,
  },
  current_status: {
    type: String,
    default:"Not placed",
  },
  is_verified: {
    type: Boolean,
    required: true,
  },
  status: {
    type: String,
  },
  profile_pic: {
    type: String,
  },
  applied_to_jobs: [],
  selected_in_jobs: [],
  saved_jobs: [],
  applied_to_group: Object,
});

module.exports = mongoose.model("users", userSchema);
