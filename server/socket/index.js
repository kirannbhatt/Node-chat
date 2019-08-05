const socketIo = require("socket.io");
const uuid = require("uuid/v1");
const request = require("request-promise");
const socketModel = require("../models/socket");
const privateChatModel = require("../models/privateChat");
const groupChatModel = require("../models/groupChat");
const msgModel = require("../models/message");
const userInfoModel = require("../models/userInfo");
const groupInfoModel = require("../models/groupInfo");
const { getAllMessage, getGroupItem } = require("./message");
const verify = require("../middlewares/verify");
const getUploadToken = require("../utils/qiniu");
const requestFrequency = require("../middlewares/requestFrequency");

function getSocketIdHandle(arr) {
  return arr[0] ? JSON.parse(JSON.stringify(arr[0])).socketid : "";
}

module.exports = server => {
  const io = socketIo(server);
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (verify(token)) {
      return next();
    }
    return next(
      new Error(`Authentication error! time =>${new Date().toLocaleString()}`)
    );
  });

  io.on("connection", socket => {
    const socketId = socket.id;
    let _userId;
    socket.use((packet, next) => {
      if (!requestFrequency(socketId)) return next();
      next(
        new Error("Access interface frequently, please try again in a minute!")
      );
    });
    socket.on("initSocket", async (user_id, fn) => {
      try {
        _userId = user_id;
        const arr = await socketModel.getUserSocketId(_userId);
        const existSocketIdStr = getSocketIdHandle(arr);
        const newSocketIdStr = existSocketIdStr
          ? `${existSocketIdStr},${socketId}`
          : socketId;

        // if (existSocketIdStr) {
        await socketModel.saveUserSocketId(_userId, newSocketIdStr);
        // } else {
        //   await Promise.all[
        //     socketModel.saveUserSocketId(_userId, newSocketIdStr),
        //     userInfoModel.updateUserStatus(_userId, 1)
        //   ];
        // }

        fn("initSocket success");
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("initGroupChat", async (user_id, fn) => {
      try {
        const result = await msgModel.getGroupList(user_id);
        const groupList = JSON.parse(JSON.stringify(result));
        for (const item of groupList) {
          socket.join(item.to_group_id);
        }
        fn("init group chat success");
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("initMessage", async ({ user_id, clientHomePageList }, fn) => {
      try {
        const data = await getAllMessage({ user_id, clientHomePageList });
        fn(data);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("sendPrivateMsg", async (data, cbFn) => {
      try {
        if (!data) return;
        data.time = Date.parse(new Date()) / 1000;
        await Promise.all([
          privateChatModel.savePrivateMsg({
            ...data,
            attachments: JSON.stringify(data.attachments)
          }),
          socketModel.getUserSocketId(data.to_user).then(arr => {
            const existSocketIdStr = getSocketIdHandle(arr);
            const toUserSocketIds =
              (existSocketIdStr && existSocketIdStr.split(",")) || [];

            toUserSocketIds.forEach(e => {
              io.to(e).emit("getPrivateMsg", data);
            });
          })
        ]);
        cbFn(data);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("sendGroupMsg", async (data, cbFn) => {
      try {
        if (!data) return;
        data.attachments = JSON.stringify(data.attachments);
        data.time = Date.parse(new Date()) / 1000;
        await groupChatModel.saveGroupMsg({ ...data });
        socket.broadcast.to(data.to_group_id).emit("getGroupMsg", data);
        cbFn(data);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("getOnePrivateChatMessages", async (data, fn) => {
      try {
        const { user_id, toUser, start, count } = data;
        const RowDataPacket = await privateChatModel.getPrivateDetail(
          user_id,
          toUser,
          start - 1,
          count
        );
        const privateMessages = JSON.parse(JSON.stringify(RowDataPacket));
        fn(privateMessages);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    // get group messages in a group;
    socket.on("getOneGroupMessages", async (data, fn) => {
      try {
        const RowDataPacket = await groupChatModel.getGroupMsg(
          data.groupId,
          data.start - 1,
          data.count
        );
        const groupMessages = JSON.parse(JSON.stringify(RowDataPacket));
        fn(groupMessages);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    // get group item including messages and group info.
    socket.on("getOneGroupItem", async (data, fn) => {
      try {
        const groupMsgAndInfo = await getGroupItem({
          groupId: data.groupId,
          startLine: data.start || 1,
          count: 20
        });
        fn(groupMsgAndInfo);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("createGroup", async (data, fn) => {
      try {
        const to_group_id = uuid();
        data.create_time = Date.parse(new Date()) / 1000;
        const { name, group_notice, creator_id, create_time } = data;
        const arr = [to_group_id, name, group_notice, creator_id, create_time];
        await groupInfoModel.createGroup(arr);
        await groupInfoModel.joinGroup(creator_id, to_group_id);
        socket.join(to_group_id);
        fn({ to_group_id, ...data });
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("updateGroupInfo", async (data, fn) => {
      try {
        await groupInfoModel.updateGroupInfo(data);
        fn("修改群资料成功");
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("joinGroup", async (data, fn) => {
      try {
        const { userInfo, toGroupId } = data;
        const joinedThisGroup = (await groupInfoModel.isInGroup(
          userInfo.user_id,
          toGroupId
        )).length;
        if (!joinedThisGroup) {
          await groupInfoModel.joinGroup(userInfo.user_id, toGroupId);
          socket.broadcast.to(toGroupId).emit("getGroupMsg", {
            ...userInfo,
            message: `${userInfo.name}加入了群聊`,
            to_group_id: toGroupId,
            tip: "joinGroup"
          });
        }
        socket.join(toGroupId);
        const groupItem = await getGroupItem({ groupId: toGroupId });
        fn(groupItem);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("leaveGroup", async data => {
      try {
        const { user_id, toGroupId } = data;
        socket.leave(toGroupId);
        await groupInfoModel.leaveGroup(user_id, toGroupId);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("getGroupMember", async (groupId, fn) => {
      try {
        const RowDataPacket = await groupChatModel.getGroupMember(groupId);
        const userInfos = JSON.parse(JSON.stringify(RowDataPacket));
        io.in(groupId).clients((err, onlineSockets) => {
          if (err) {
            throw err;
          }
          userInfos.forEach(userInfo => {
            userInfo.status = 0;
            if (userInfo.socketid) {
              const socketIds = userInfo.socketid.split(",");
              for (const onlineSocket of onlineSockets) {
                const socketExist = socketIds.some(
                  socketId => socketId === onlineSocket
                );
                if (socketExist) {
                  userInfo.status = 1;
                }
              }
            }
            delete userInfo.socketid;
          });
          fn(userInfos);
        });
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("fuzzyMatch", async (data, fn) => {
      try {
        let fuzzyMatchResult;
        const field = `%${data.field}%`;
        if (data.searchUser) {
          fuzzyMatchResult = await userInfoModel.fuzzyMatchUsers(field);
        } else {
          fuzzyMatchResult = await groupInfoModel.fuzzyMatchGroups(field);
        }
        fn({ fuzzyMatchResult, searchUser: data.searchUser });
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    // qiniu token
    socket.on("getQiniuToken", async fn => {
      try {
        const uploadToken = await getUploadToken();
        return fn(uploadToken);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("addAsTheContact", async (data, fn) => {
      try {
        const { user_id, from_user } = data;
        const time = Date.parse(new Date()) / 1000;
        await userInfoModel.addFriendEachOther(user_id, from_user, time);
        const userInfo = await userInfoModel.getUserInfo(from_user);
        fn(userInfo[0]);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("getUserInfo", async (user_id, fn) => {
      try {
        const userInfo = await userInfoModel.getUserInfo(user_id);
        fn(userInfo[0]);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("robotChat", async (data, fn) => {
      try {
        const date = {
          key: "92febb91673740c2814911a6c16dbcc5",
          info: data.message,
          userid: data.user_id
        };
        const options = {
          method: "POST",
          uri: "http://www.tuling123.com/openapi/api",
          body: date,
          json: true // Automatically stringifies the body to JSON
        };
        const response = await request(options);
        fn(response);
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("deleteContact", async ({ from_user, to_user }, fn) => {
      try {
        await userInfoModel.deleteContact(from_user, to_user);
        const sockets = await socketModel.getUserSocketId(to_user);
        const existSocketIdStr = getSocketIdHandle(sockets);
        const toUserSocketIds =
          (existSocketIdStr && existSocketIdStr.split(",")) || [];
        toUserSocketIds.forEach(e => {
          io.to(e).emit("beDeleted", from_user);
        });
        fn({ code: 200, data: "delete contact successfully" });
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });

    socket.on("disconnect", async reason => {
      try {
        const arr = await socketModel.getUserSocketId(_userId);
        const existSocketIdStr = getSocketIdHandle(arr);
        const toUserSocketIds =
          (existSocketIdStr && existSocketIdStr.split(",")) || [];
        const index = toUserSocketIds.indexOf(socketId);

        if (index > -1) {
          toUserSocketIds.splice(index, 1);
        }

        await socketModel.saveUserSocketId(_userId, toUserSocketIds.join(","));

        // if (toUserSocketIds.length) {
        //   await socketModel.saveUserSocketId(_userId, toUserSocketIds.join(','));
        // } else {
        //   await Promise.all([
        //     socketModel.saveUserSocketId(_userId, toUserSocketIds.join(',')),
        //     userInfoModel.updateUserStatus(_userId, 0)
        //   ]);
        // }

        console.log(
          "disconnect.=>reason",
          reason,
          "user_id=>",
          _userId,
          "socket.id=>",
          socket.id,
          "time=>",
          new Date().toLocaleString()
        );
      } catch (error) {
        console.log("error", error.message);
        io.to(socketId).emit("error", { code: 500, message: error.message });
      }
    });
  });
};
