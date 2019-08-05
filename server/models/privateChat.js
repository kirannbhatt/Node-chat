const { query } = require("../utils/db");

const getPrivateDetail = (from_user, to_user, start, count) => {
  const data = [from_user, to_user, to_user, from_user, start, count];
  const _sql =
    "SELECT * FROM ( SELECT p.from_user,p.to_user,p.message,p.attachments,p.time,i.avatar,i.name, i.github_id from private_msg as p inner join user_info as i  on p.from_user = i.id  where  (p.from_user = ? AND p.to_user   = ? )  or (p.from_user = ? AND p.to_user   = ? )  order by time desc limit ?,? ) as n order by n.time";
  return query(_sql, data);
};

const savePrivateMsg = ({ from_user, to_user, message, time, attachments }) => {
  const data = [from_user, to_user, message, time, attachments];
  const _sql =
    " INSERT INTO private_msg(from_user,to_user,message,time,attachments)  VALUES(?,?,?,?,?); ";
  return query(_sql, data);
};

const getUnreadCount = ({ sortTime, from_user, to_user }) => {
  const data = [sortTime, from_user, to_user, to_user, from_user];
  const _sql =
    "SELECT count(time) as unread FROM private_msg AS p WHERE p.time > ? and ((p.from_user = ? and p.to_user= ?) or (p.from_user = ? and p.to_user=?));";
  return query(_sql, data);
};

module.exports = {
  getPrivateDetail,
  savePrivateMsg,
  getUnreadCount
};
