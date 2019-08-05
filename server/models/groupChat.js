const { query } = require("../utils/db");

const getGroupMsg = (groupId, start, count) => {
  const _sql =
    "SELECT * FROM (SELECT g.message,g.attachments,g.time,g.from_user,g.to_group_id, i.avatar ,i.name, i.github_id FROM group_msg  As g inner join user_info AS i ON g.from_user = i.id  WHERE to_group_id = ? order by time desc limit ?,?) as n order by n.time; ";
  return query(_sql, [groupId, start, count]);
};

const getGroupMember = groupId => {
  const _sql =
    "SELECT g.user_id, u.socketid, u.name, u.avatar, u.github_id, u.github, u.intro, u.company, u.location, u.website FROM group_user_relation AS g inner join user_info AS u ON g.user_id = u.id WHERE to_group_id = ?";
  return query(_sql, groupId);
};

const getGroupInfo = arr => {
  const _sql =
    "SELECT to_group_id, name, group_notice, creator_id, create_time FROM group_info  WHERE to_group_id = ? OR name = ? ;";
  return query(_sql, arr);
};

const saveGroupMsg = ({
  from_user,
  to_group_id,
  message,
  time,
  attachments
}) => {
  const data = [from_user, to_group_id, message, time, attachments];
  const _sql =
    " INSERT INTO group_msg(from_user,to_group_id,message ,time, attachments) VALUES(?,?,?,?,?); ";
  return query(_sql, data);
};

const addGroupUserRelation = (user_id, groupId) => {
  const data = [groupId, user_id];
  const _sql =
    " INSERT INTO  group_user_relation(to_group_id,user_id) VALUES(?,?); ";
  return query(_sql, data);
};

const getUnreadCount = ({ sortTime, to_group_id }) => {
  const data = [sortTime, to_group_id];
  const _sql =
    "SELECT count(time) as unread FROM group_msg as p where p.time > ? and p.to_group_id = ?;";
  return query(_sql, data);
};

module.exports = {
  getGroupMsg,
  getGroupMember,
  getGroupInfo,
  saveGroupMsg,
  addGroupUserRelation,
  getUnreadCount
};
