const jwt = require("jsonwebtoken");
const secret = require("../config").secret;

module.exports = token => {
  try {
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (err) {
    console.error(err);
    return false;
  }
};
