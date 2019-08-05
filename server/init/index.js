const fs = require("fs");
const getSqlContentMap = require("./util/get-sql-content-map");
const { query } = require("../utils/db");

const eventLog = (err, sqlFile, index) => {
  if (err) {
    console.log(
      `[ERROR] sql script file: ${sqlFile} ${index +
        1} script execution failed o(╯□╰)o ! `
    );
  } else {
    console.log(
      `[SUCCESS] sql script file: ${sqlFile} ${index +
        1} script executed successfully O(∩_∩)O !`
    );
  }
};

const sqlContentMap = getSqlContentMap();

const createAllTables = async () => {
  for (const key in sqlContentMap) {
    const sqlShell = sqlContentMap[key];
    const sqlShellList = sqlShell.split(";");

    for (const [i, shell] of sqlShellList.entries()) {
      if (shell.trim()) {
        const result = await query(shell);
        if (result.serverStatus * 1 === 2) {
          eventLog(null, key, i);
        } else {
          eventLog(true, key, i);
        }
      }
    }
  }
};

createAllTables();
