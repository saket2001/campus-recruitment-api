const mongoose = require("mongoose");

const placedStudentsHistory = mongoose.Schema({
  job_id: {
    type: String,
    required: true,
    ref: "job",
  },
  created_at: {
    type: Date,
    required: true,
    default: new Date(),
  },
  selected_candidates: [],      // user_ids of students
});

module.exports = mongoose.model("Placed students", placedStudentsHistory);
