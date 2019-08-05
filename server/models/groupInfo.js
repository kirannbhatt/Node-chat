const {
  query
} = require('../utils/db');

const fuzzyMatchGroups = (link) => {
  const _sql = `
    SELECT * FROM group_info WHERE name LIKE ?;
  `;
  return query(_sql, link);
};

const joinGroup = (user_id, to_group_id) => {
  const _sql = 'INSERT INTO group_user_relation(user_id,to_group_id) VALUES(?,?);';
  return query(_sql, [user_id, to_group_id]);
};

const isInGroup = (user_id, to_group_id) => {
  const _sql = 'SELECT * FROM group_user_relation WHERE user_id = ? AND to_group_id = ?;';
  return query(_sql, [user_id, to_group_id]);
};

const createGroup = (arr) => {
  const _sql = 'INSERT INTO group_info (to_group_id,name,group_notice,creator_id,create_time) VALUES (?,?,?,?,?)';
  return query(_sql, arr);
};


const updateGroupInfo = ({ name, group_notice, to_group_id }) => {
  const _sql = 'UPDATE group_info SET name = ?, group_notice = ? WHERE to_group_id= ? limit 1 ; ';
  return query(_sql, [name, group_notice, to_group_id]);
};

const leaveGroup = (user_id, to_group_id) => {
  const _sql = 'DELETE FROM group_user_relation WHERE user_id = ? AND to_group_id = ? ;';
  return query(_sql, [user_id, to_group_id]);
};


module.exports = {
  fuzzyMatchGroups,
  joinGroup,
  isInGroup,
  createGroup,
  leaveGroup,
  updateGroupInfo,
};
