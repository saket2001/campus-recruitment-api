const mongoose = require("mongoose");

const noticeSchema = mongoose.Schema({
  group_id: {
    type: String,
    required: true,
    ref: "group",
  },
  creator_id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
    default: new Date(),
  },
  isAlertOn: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("notice", noticeSchema);
