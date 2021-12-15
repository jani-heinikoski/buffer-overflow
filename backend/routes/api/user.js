const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passwordValidator = require("password-validator");
const issueToken = require("../../auth/issueToken");
const User = require("../../models/user");

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
        });
      }
    } catch (err) {
      console.error(err);
    }
    return res.status(400).json({ msg: "Invalid password/username" });
  }
);

router.post(
  "/register",
  body("firstName").isString().notEmpty(),
  body("lastName").isString().notEmpty(),
  body("username").isString().notEmpty(),
  body("password").isString().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("bio").if(body("bio").exists()).isString().notEmpty(),
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
