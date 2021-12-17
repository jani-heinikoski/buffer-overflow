const User = require("./models/user");
const bcrypt = require("bcryptjs");
/* Function for hashing (and salting) passwords */
const hashPasswordSync = (password) => {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);
  return { hashedPassword: hash, salt: salt };
};

module.exports = async (username, password) => {
  try {
    if (!(await User.exists({ admin: true }))) {
      const { hashedPassword, salt } = hashPasswordSync(password);
      console.log("Creating admin account...");
      console.log(
        await User.create({
          username: username,
          firstName: "admin",
          lastName: "admin",
          password: hashedPassword,
          salt: salt,
          email: "email@admin.com",
          bio: "admin",
          admin: true,
        })
      );
      console.log("Admin account created");
    } else {
      console.log("Admin account already exists");
    }
  } catch (ex) {
    console.error(ex);
  }
};
