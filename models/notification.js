const { default: mongoose } = require("mongoose");

const Schema = require("mongoose").Schema;

const notificationSchema = new Schema({
  type: {
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
    default: new Date(),
  },
  receiver_id: {
    type: String,
  },
  sender_id: {
    type: String,
    required: true,
  },
  delete_after: {
    type: String,
    default: `${new Date().getDate() + 7}/${new Date().getMonth()}/${new Date().getFullYear()}`,
  },
});

module.exports = mongoose.model("notification", notificationSchema);
