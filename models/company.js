const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companySchema = new Schema({
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
  },
  contact_no: {
    type: String,
    required: true,
  },
  recruiters: [{
    id: mongoose.Schema.Types.ObjectId,
  },],
  created_at: {
    type: mongoose.Schema.Types.Date,
    required: true,
  },
});

module.exports = mongoose.model("companies", companySchema);
