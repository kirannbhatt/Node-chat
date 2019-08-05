const path = require("path");
const secrets = require("../secret");

// this._isProduction = process.env.NODE_ENV === "production";

const staticPath = "../build";

const staticDirPath = path.join(__dirname, staticPath);

const db = this._isProduction
  ? secrets.db
  : {
      host: "remotemysql.com",
      port: 3306,
      database: "dLcNd2ad02",
      user: "dLcNd2ad02",
      password: "G3OxRiyc0j"
    };
const baseApi = "api/v1";

const secret = this._isProduction ? secrets && secrets.secretValue : "chat-sec";

module.exports = {
  db,
  baseApi,
  secret,
  staticDirPath
};
