const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: false,
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  likes: {
    type: Number,
    required: true,
    default: 0,
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

module.exports = mongoose.model("Post", postSchema);
