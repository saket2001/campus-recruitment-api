const mongoose = require('mongoose');

const JobSchema = mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
  total_hiring: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
  },
  last_date: {
    type: String,
    required: true,
  },
  contact_email: {
    type: String,
    required: true,
  },
  contact_number: {
    type: String,
    required: true,
  },
  company_name: {
    type: String,
  },
  description: {
    type: String,
  },
  requirements: {
    type: String,
  },
  filePath: {
    type: String,
  },
  recruiter_id: {
    type: String,
    required: true,
    ref: "recruiter",
  },
  company_id: {
    type: String,
    required: true,
    ref: "company",
  },
  created_at: {
    type: mongoose.Schema.Types.Date,
    required: true,
  },
  is_active: {
    type: mongoose.Schema.Types.Boolean,
    required: true,
  },
  current_stage: {
    type: String,
    required: true,
  },
  job_stages: [],
});

module.exports = mongoose.model('Job', JobSchema);