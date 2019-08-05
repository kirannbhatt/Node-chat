module.exports = {
  client_secret: "", // client_secret of github authorization:  github-> settings ->  Developer settings to get
  db: {
    host: "remotemysql.com",
    port: 3306,
    database: "dLcNd2ad02",
    user: "dLcNd2ad02",
    password: "G3OxRiyc0j"
  },
  secretValue: "", // secret of json web token
  qiniu: {
    // qiniu cdn configuration
    accessKey: "",
    secretKey: "",
    bucket: ""
  }
};
