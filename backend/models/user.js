const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  registered: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  email: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: false,
  },
  admin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
