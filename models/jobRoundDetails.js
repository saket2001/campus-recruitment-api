const mongoose = require("mongoose");

const jobRoundDetailsSchema = mongoose.Schema({
  job_id: {
    type: String,
    required: true,
    ref: "job",
  },
  recruiter_id: {
    type: String,
    required: true,
    ref: "recruiter",
  },
  round_name: {
    type: String,
    required: true,
  },
  round_date: {
    type: Date,
    required: true,
  },
  round_link: {
    type: String,
  },
  round_candidates: [],
  round_description: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("Job round details", jobRoundDetailsSchema);
