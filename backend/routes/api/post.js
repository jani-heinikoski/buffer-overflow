const express = require("express");
const { body, validationResult } = require("express-validator");
// Require User so that the post's populate function works
require("../../models/user");
const Post = require("../../models/post");
const Comment = require("../../models/comment");
const passport = require("passport");
// Initialize the passport object with the JWT strategy
require("../../auth/validateJWT")(passport);

const router = express.Router();

/* GET all posts */
router.get("/", async (req, res) => {
  try {
    // Returns all the posts
    return res.status(200).json({
      msg: "All posts",
      posts: await Post.find()
        .populate("createdBy", "username")
        .select("-__v")
        .sort({ createdDate: "desc" })
        .exec(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Internal server error occured when fetching all posts.",
      posts: null,
    });
  }
});

/* GET a post by id */
router.get("/:id", async (req, res) => {
  if (!req.params.id) {
    return res
      .status(400)
      .json({ msg: "No id for post provided.", post: null });
  }
  try {
    const post = await Post.findById(req.params.id)
      .populate("createdBy", "username")
      .select("-__v")
      .exec();
    if (post) {
      return res.status(200).json({ msg: "Post found", post: post });
    }
  } catch (error) {
    console.error(error);
  }
  return res.status(404).json({ msg: "Post not found", post: null });
});

/* POST a new post */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  body("post").isObject({ strict: true }),
  body("post.description").isString().isLength({ min: 1 }),
  body("post.code").isString().isLength({ min: 1 }),
  body("post.header").isString().isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: "Invalid request body." });
    }
    try {
      const newPost = new Post({
        header: req.body.post.header,
        description: req.body.post.description,
        code: req.body.post.code,
        comments: [],
        likes: 0,
        createdBy: req.user.id,
      });
      await newPost.save();
      return res.status(200).json({ msg: "Post created.", post: newPost });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: "Invalid request body." });
    }
  }
);

/* POST a new comment to a post */
router.post(
  "/:id/comment",
  passport.authenticate("jwt", { session: false }),
  body("content").isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: "Invalid request body." });
    }
    try {
      const post = await Post.findById(req.params.id).select("-__v").exec();
      const newComment = await new Comment({
        content: req.body.content,
        createdBy: req.user.id,
      }).save();
      post.comments.push(newComment.id);
      await post.save();
      return res.status(200).json({
        msg: "Comment added.",
        comment: newComment,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: "Invalid request body." });
    }
  }
);

/* DELETE a comment from a post */
router.delete(
  "/:postid/comment/:commentid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.commentid)
        .select("-__v")
        .exec();
      if (!comment) {
        return res.status(400).json({ msg: "Invalid request." });
      }
      if (comment.createdBy.toString() === req.user.id) {
        await Post.findByIdAndUpdate(req.params.postid, {
          $pull: {
            comments: req.params.commentid,
          },
        }).exec();
        await Comment.findByIdAndDelete(req.params.commentid).exec();
      }
      res.status(200).json({ msg: "Removed comment successfully." });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: "Invalid request." });
    }
  }
);

/* DELETE a post */
router.delete(
  "/:postid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postid).select("-__v").exec();
      if (!post) {
        return res.status(400).json({ msg: "Invalid request." });
      }
      if (post.createdBy.toString() === req.user.id) {
        await Comment.deleteMany({
          _id: {
            $in: post.comments,
          },
        }).exec();
        await Post.deleteOne({ _id: req.params.postid }).exec();
      }
      res.status(200).json({ msg: "Removed post successfully." });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: "Invalid request." });
    }
  }
);

/* GET all comments of a post */
router.get("/:id/comment", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .select("-__v")
      .populate({
        path: "comments",
        populate: {
          path: "createdBy",
          select: "username",
        },
      })
      .exec();
    return res.status(200).json({
      msg: `All comments of post id ${req.params.id}.`,
      comments: post.comments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Internal server error occured when fetching all comments.",
      posts: null,
    });
  }
});

module.exports = router;
