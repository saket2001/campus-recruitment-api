const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  title: {
    type: "string",
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  creator_id: {
    type: "string",
    required: true,
  },
  creator_name: {
    type: "string",
    required: true,
  },
  date_created: {
    type: "string",
    required: true,
    default: new Date(),
  },
  code: { type: "string", required: true, unique: true },
  posts: [],
  members: [],
});

module.exports = mongoose.model("group", groupSchema);
