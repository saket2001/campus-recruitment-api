let onlineSessionUsers = [];

// socket io
const socketIO = require("socket.io")(8001, {
  cors: {
    origin: [`${process.env.CLIENT_SERVER}`, "http://localhost:3000"],
  },
});
exports.socketIO = socketIO;

exports.socketUtils = {
  addUserToSession: (data) => {
    if (onlineSessionUsers?.find((user) => user.socket_id === data.socket_id))
      return;

    onlineSessionUsers?.push(data);
    console.log(onlineSessionUsers);
  },
  removeUserFromSession: (socket_id) => {
    onlineSessionUsers = onlineSessionUsers?.filter(
      (user) => user.socket_id !== socket_id
    );
    console.log(onlineSessionUsers);
  },
  GetUserFromSession: (user_id) => {
    const userData = onlineSessionUsers?.find(
      (user) => user.user_id === user_id
    );
    return userData !== null ? userData : false;
  },
};

exports.socketIoOperations = {
  sendTo: (emitKey, socket_id, data) => {
    socketIO.on("connection", (socket) => {
      socket.to(socket_id).emit(emitKey, data);
    });
    console.log("Notification Send");
  },
  receive: (receiveKey) => {
    let returnValue = null;
    socketIO.on("connection", (socket) => {
      socket.on(receiveKey, (...data) => {
        console.log(data);
        returnValue = data;
      });
      return returnValue;
    });
  },
};
