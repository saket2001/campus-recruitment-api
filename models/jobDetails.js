const mongoose = require('mongoose');

const JobDetailsSchema = mongoose.Schema({
  job_id: {
    type: String,
    required: true,
    ref: "Job",
  },
  recruiter_id: {
    type: String,
    required: true,
    ref: "recruiter",
  },
  job_stages: [],
});

module.exports = mongoose.model('JobDetails', JobDetailsSchema);