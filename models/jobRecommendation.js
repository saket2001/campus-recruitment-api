const mongoose = require("mongoose");

const jobRecommendation = mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    ref: "user",
  },
  job_ids: [],
  recommendations: [],
  similarityPercentage: [],
  created_at: {
    type: mongoose.Schema.Types.Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("jobrecommendation", jobRecommendation);
