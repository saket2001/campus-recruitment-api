const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required:true,
  },
  password: {
    type: String,
    required: true,
  },
  contact_no: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  created_at: {
    type: mongoose.Schema.Types.Date,
    required: true,
  },
});

module.exports=mongoose.model('admins',adminSchema)