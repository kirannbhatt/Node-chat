const fs = require("fs");
const getSqlMap = require("./get-sql-map");

const sqlContentMap = {};

function getSqlContent(fileName, path) {
  const content = fs.readFileSync(path, "binary");
  sqlContentMap[fileName] = content;
}

function getSqlContentMap() {
  const sqlMap = getSqlMap();
  for (const key in sqlMap) {
    getSqlContent(key, sqlMap[key]);
  }

  return sqlContentMap;
}

module.exports = getSqlContentMap;
