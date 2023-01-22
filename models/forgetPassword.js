const mongoose = require("mongoose");

const forgetPassword = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  pass_code: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

module.exports=mongoose.model("forgetPassword",forgetPassword)
