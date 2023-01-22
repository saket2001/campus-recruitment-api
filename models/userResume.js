const mongoose = require("mongoose");

const schema = mongoose.Schema;

const userResume = new schema({
  user_id: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  resume_file: {
    type: String,
  },
});

module.exports = mongoose.model("userResume", userResume);
