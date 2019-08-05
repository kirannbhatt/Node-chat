const md5 = require("md5");
const userModel = require("../models/userInfo");

module.exports = async (ctx, next) => {
  console.log("register");
  const { name, password } = ctx.request.body;

  await userModel.findDataByName(name).then(result => {
    console.log(result);
    if (result.length) {
      ctx.body = {
        success: false,
        message: "Username already exists"
      };
    } else {
      ctx.body = {
        success: true,
        message: "registration success!"
      };
      userModel.insertData([name, md5(password)]);
    }
  });
};
