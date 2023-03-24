const mongoose = require('mongoose');

const JobDetailsSchema = mongoose.Schema({
  job_id: {
    type: String,
    required: true,
    ref: "Job",
  },
  created_by: {
    type: String,
    required: true,
    ref: "admin",
  },
  job_stages: [],
  last_edited: {
    type: Date,
  },
});

module.exports = mongoose.model('JobDetails', JobDetailsSchema);