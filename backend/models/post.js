const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  header: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: false,
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  lastModifiedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
