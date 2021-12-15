const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return value && value.length > 0;
      },
      message: "Comment's content must not be empty.",
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Comment", commentSchema);
