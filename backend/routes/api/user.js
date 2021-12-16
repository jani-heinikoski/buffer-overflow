const express = require("express");
const { body, param, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passwordValidator = require("password-validator");
const issueToken = require("../../auth/issueToken");
const User = require("../../models/user");
const passport = require("passport");
const validateJWT = require("../../auth/validateJWT");
// Initialize the passport object with the JWT strategy
require("../../auth/validateJWT")(passport);

const MIN_PWD_LENGTH = 8;
const passwordSchema = new passwordValidator();

passwordSchema
  .is()
  .min(MIN_PWD_LENGTH)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .symbols();

const router = express.Router();

const hashPasswordSync = (password) => {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);
  return { hashedPassword: hash, salt: salt };
};

/**
 * Returns publicly available profile
 */
router.get(
  "/:username",
  param("username").isString().notEmpty(),
  async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username }).select(
        "username registered bio"
      );
      if (user) {
        return res.status(200).json({ msg: "Found user.", user: user });
      } else {
        return res
          .status(404)
          .json({ msg: "Can't find user with given username.", user: null });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Can't fetch user." });
    }
  }
);

/**
 * Update the user's profile (excluding password)
 */
router.patch(
  "/",
  passport.authenticate("jwt", { session: false }),
  body("firstName").isString().notEmpty(),
  body("lastName").isString().notEmpty(),
  body("username").isString().notEmpty(),
  body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }),
  body("bio").isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: "Invalid form data." });
    }
    try {
      // Check if the username is already in use
      if (req.user.username !== req.body.username) {
        if (
          await User.exists({ username: new RegExp(`^${req.body.username}$`) })
        ) {
          return res.status(400).json({ msg: "Username already in use." });
        }
      }
      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          email: req.body.email,
          bio: req.body.bio,
        },
        { new: true }
      ).exec();
      return res.status(200).json({
        msg: "User updated successfully.",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          registered: user.registered,
          bio: user.bio,
          username: user.username,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: "Invalid form data." });
    }
  }
);
/**
 * Login route for authenticating with the server.
 * Returns user information and a JWT token for further authentication and authorization.
 */
router.post(
  "/login",
  body("username").isString().notEmpty(),
  body("password").isLength({ min: MIN_PWD_LENGTH }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty() || !passwordSchema.validate(req.body.password)) {
      return res.status(400).json({ msg: "Invalid password/username" });
    }
    try {
      const user = await User.findOne({
        username: new RegExp(`^${req.body.username}$`),
      })
        .select("-__v")
        .exec();
      if (!user) {
        return res.status(400).json({ msg: "Invalid password/username" });
      }
      if (bcrypt.hashSync(req.body.password, user.salt) === user.password) {
        return res.status(200).json({
          msg: "Authentication successful",
          token: issueToken(user),
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            registered: user.registered,
            bio: user.bio,
            username: user.username,
          },
        });
      }
    } catch (err) {
      console.error(err);
    }
    return res.status(400).json({ msg: "Invalid password/username" });
  }
);
/**
 * Register route for creating new users.
 */
router.post(
  "/register",
  body("firstName").isString().notEmpty(),
  body("lastName").isString().notEmpty(),
  body("username").isString().notEmpty(),
  body("password").isString().notEmpty(),
  body("email").isEmail().normalizeEmail({ gmail_remove_dots: false }),
  body("bio").isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty() || !passwordSchema.validate(req.body.password)) {
      return res.status(400).json({ msg: "Invalid form data." });
    }
    try {
      // Check if the username is already in use
      if (
        !(await User.exists({ username: new RegExp(`^${req.body.username}$`) }))
      ) {
        const { hashedPassword, salt } = hashPasswordSync(req.body.password);
        const newUser = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
          salt: salt,
          bio: req.body.bio || "",
        });
        await newUser.save();
      } else {
        return res.status(400).json({ msg: "Username is already in use." });
      }
    } catch (err) {
      console.error(err);
      return res.status(400).json({ msg: "Invalid form data." });
    }
    res.status(200).json({ msg: "New user created successfully." });
  }
);

module.exports = router;
