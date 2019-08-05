const jwt = require("jsonwebtoken");
const md5 = require("md5");
const secret = require("../config").secret;
const userModel = require("../models/userInfo");

module.exports = async (ctx, next) => {
  const { name = "", password = "" } = ctx.request.body;
  if (name === "" || password === "") {
    ctx.body = {
      success: false,
      message: "Username or password cannot be empty"
    };
    return;
  }
  const RowDataPacket = await userModel.findDataByName(name);
  const res = JSON.parse(JSON.stringify(RowDataPacket));
  if (res.length > 0) {
    if (md5(password) === res[0].password) {
      const {
        id,
        name,
        sex,
        website,
        github,
        intro,
        company,
        avatar,
        location,
        socketId
      } = res[0];
      const payload = { id };
      const token = jwt.sign(payload, secret, {
        expiresIn: Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 7 // 一周
      });
      ctx.body = {
        success: true,
        message: "login successful",
        userInfo: {
          name,
          user_id: id,
          sex,
          website,
          github,
          intro,
          company,
          avatar,
          location,
          socketId,
          token
        }
      };
    } else {
      ctx.body = {
        success: false,
        message: "Password error"
      };
    }
  } else {
    ctx.body = {
      success: false,
      message: "Username error"
    };
  }
};
