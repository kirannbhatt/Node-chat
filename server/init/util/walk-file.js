const fs = require("fs");

const walkFile = (pathResolve, mime) => {
  const files = fs.readdirSync(pathResolve);
  const fileList = {};
  for (const [i, item] of files.entries()) {
    const itemArr = item.split(".");

    const itemMime =
      itemArr.length > 1 ? itemArr[itemArr.length - 1] : "undefined";
    const keyName = `${item}`;
    if (mime === itemMime) {
      fileList[item] = pathResolve + item;
    }
  }

  return fileList;
};

module.exports = walkFile;
