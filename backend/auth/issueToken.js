const jwt = require("jsonwebtoken");
module.exports = function (user) {
  return jwt.sign({ sub: user.id }, process.env.SECRET, {
    expiresIn: 3600,
  });
};
