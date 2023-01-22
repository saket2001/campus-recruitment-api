const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recruiterSchema = new Schema({
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
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
  },
  contact_no: {
    type: String,
    required: true,
  },
  jobs_posted: [],
  created_at: {
    type: mongoose.Schema.Types.Date,
    required: true,
  },
});

module.exports = mongoose.model("recruiters", recruiterSchema);
