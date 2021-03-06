const express = require("express");
const { body, param, validationResult } = require("express-validator");
// Require User so that the post's populate function works
require("../../models/user");
const Post = require("../../models/post");
const Comment = require("../../models/comment");
const passport = require("passport");
// Initialize the passport object with the JWT strategy
require("../../auth/validateJWT")(passport);

const router = express.Router();

/* Route for getting all of the posts */
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

/* Find posts whose header matches body.query, used for the frontend's search functionality */
router.post("/search", body("query").isString(), async (req, res) => {
  /* Check if express-validator "failed" */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: "Invalid request body." });
  }
  try {
    // Returns all the posts
    return res.status(200).json({
      msg: "Posts matching query",
      posts: await Post.find({ header: new RegExp(req.body.query, "i") })
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

/* Finds and returns a user by its id (request param)  */
router.get("/:id", param("id").isString().notEmpty(), async (req, res) => {
  /* Check if express-validator "failed" */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: "Invalid request params." });
  }
  try {
    /* Find the user and populate (i.e., replace id with a document) the createdBy property */
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

/* Route for posting new "posts", contents are passed in the request body */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  body("post").isObject({ strict: true }),
  body("post.description").isString().isLength({ min: 1 }),
  body("post.code").isString().isLength({ min: 1 }),
  body("post.header").isString().isLength({ min: 1 }),
  async (req, res) => {
    /* Check if express-validator "failed" */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: "Invalid request body." });
    }
    try {
      /* Create the new post and save it to the database, same as using Post.create(...) */
      const newPost = new Post({
        header: req.body.post.header,
        description: req.body.post.description,
        code: req.body.post.code,
        comments: [],
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

/* PATCH (update) an existing post, contents passed in the request body */
router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  param("id").isString().notEmpty(),
  body("post").isObject({ strict: true }),
  body("post.description").isString().isLength({ min: 1 }),
  body("post.code").isString().isLength({ min: 1 }),
  body("post.header").isString().isLength({ min: 1 }),
  async (req, res) => {
    /* Check if express-validator "failed" */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: "Invalid request body." });
    }
    try {
      const postToUpdate = await Post.findById(req.params.id).exec();
      if (postToUpdate) {
        /* Check whether the authenticated user has created the post */
        if (
          postToUpdate.createdBy.toString() === req.user.id ||
          req.user.admin
        ) {
          /* If yes, update/patch the post with request body's contents */
          postToUpdate.description = req.body.post.description;
          postToUpdate.code = req.body.post.code;
          postToUpdate.header = req.body.post.header;
          postToUpdate.lastModifiedDate = Date.now();
          await postToUpdate.save();
          return res
            .status(200)
            .json({ msg: "Post updated.", post: postToUpdate });
        }
      } else {
        return res
          .status(401)
          .json({ msg: "Not authorized to modify this post." });
      }
    } catch (error) {
      console.error(error);
    }
    return res.status(400).json({ msg: "Invalid request body." });
  }
);

/* POST a new comment to a post */
router.post(
  "/:id/comment",
  passport.authenticate("jwt", { session: false }),
  body("content").isString().notEmpty(),
  async (req, res) => {
    /* Check if express-validator "failed" */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: "Invalid request body." });
    }
    try {
      /* Find the post by id */
      const post = await Post.findById(req.params.id).select("-__v").exec();
      /* Create the new comment and save it to the database */
      const newComment = await new Comment({
        content: req.body.content,
        createdBy: req.user.id,
      }).save();
      /* Push the new comment's id to the post's comments -array and persist the changes */
      post.comments.push(newComment.id);
      await post.save();
      /* Populate can be used after "find" by using Comment.populate(...) */
      return res.status(200).json({
        msg: "Comment added.",
        comment: await Comment.populate(newComment, {
          path: "createdBy",
          select: "username",
        }),
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: "Invalid request body." });
    }
  }
);

/* PATCH (update) a comment's content */
router.patch(
  "/:postid/comment/:commentid",
  passport.authenticate("jwt", { session: false }),
  param("postid").isString().notEmpty(),
  param("commentid").isString().notEmpty(),
  body("content").isString(),
  async (req, res) => {
    /* Check if express-validator "failed" */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res
        .status(400)
        .json({ msg: "Invalid request query/body params." });
    }
    try {
      // Find the comment
      const comment = await Comment.findById(req.params.commentid)
        .select("-__v")
        .exec();
      // Return if not found
      if (!comment) {
        return res.status(400).json({ msg: "Invalid commentid." });
      }
      // Check whether the authenticated user has created the comment or is admin
      if (comment.createdBy.toString() === req.user.id || req.user.admin) {
        // If yes, update it and persist the changes
        comment.content = req.body.content;
        comment.lastModifiedDate = Date.now();
        await comment.save();
        return res.status(200).json({ msg: "Saved comment successfully." });
      } else {
        // Otherwise respond with 401 not authorized
        return res
          .status(401)
          .json({ msg: "Not authorized to edit this comment" });
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: "Invalid request." });
    }
  }
);

/* DELETE a comment from a post */
router.delete(
  "/:postid/comment/:commentid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Find the comment
      const comment = await Comment.findById(req.params.commentid)
        .select("-__v")
        .exec();
      // Return if not found
      if (!comment) {
        return res.status(400).json({ msg: "Invalid commentid." });
      }
      // Check whether the authenticated user has created the comment or is admin
      if (comment.createdBy.toString() === req.user.id || req.user.admin) {
        // If yes, delete it
        // (first pull it from the post's comments list and then remove from comments collection)
        await Post.findByIdAndUpdate(req.params.postid, {
          $pull: {
            comments: req.params.commentid,
          },
        }).exec();
        await Comment.findByIdAndDelete(req.params.commentid).exec();
        return res.status(200).json({ msg: "Removed comment successfully." });
      } else {
        // Otherwise respond with 401 not authorized
        return res
          .status(401)
          .json({ msg: "Not authorized to delete this comment" });
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: "Invalid request." });
    }
  }
);

/* DELETE a post by it's id */
router.delete(
  "/:postid",
  passport.authenticate("jwt", { session: false }),
  param("postid").isString().notEmpty(),
  async (req, res) => {
    /* Check if express-validator "failed" */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(400).json({ msg: "Invalid request params." });
    }
    try {
      /* First find the post by it's id */
      const post = await Post.findById(req.params.postid).select("-__v").exec();
      if (!post) {
        return res.status(400).json({ msg: "Invalid request." });
      }
      /* Check if the post was created by the authenticated user */
      if (post.createdBy.toString() === req.user.id || req.user.admin) {
        /* If yes, first delete all the comments inside the post,
         from the comments collection */
        await Comment.deleteMany({
          _id: {
            $in: post.comments,
          },
        }).exec();
        /* Delete the post after deleting the comments */
        await Post.deleteOne({ _id: req.params.postid }).exec();
        res.status(200).json({ msg: "Removed post successfully." });
      } else {
        res.status(401).json({ msg: "Unauthorized to remove this post." });
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: "Invalid request." });
    }
  }
);

/* GET all comments of a post */
router.get(
  "/:id/comment",
  param("id").isString().notEmpty(),
  async (req, res) => {
    /* Check if express-validator "failed" */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(400).json({ msg: "Invalid request params." });
    }
    try {
      /* Find and return the post after populating
     its' comments and each comments' createdBy field */
      const post = await Post.findById(req.params.id)
        .select("-__v")
        .populate({
          path: "comments",
          options: {
            sort: {
              createdDate: "desc",
            },
          },
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
      return res.status(400).json({
        msg: "Bad request params.",
        posts: null,
      });
    }
  }
);

module.exports = router;
