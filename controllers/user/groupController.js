// const group = require("../../models/group");
const userDbOperations = require("../../db/user");

////////////////////////////////////
const groupController = {
  applyToGroup: async (req, res) => {
    try {
      const data = req.body;
      const { id } = req.user;
      const response = await userDbOperations.applyToGroup(data, id);
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "No group found by given code!",
        });
      else if (response === 2)
        return res.status(200).json({
          isError: true,
          message:
            "You have already applied to another group, please exit that group first!",
        });

      return response
        ? res.status(200).json({
            isError: false,
            message: "Joined the group successfully!",
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to join the group!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  leaveGroup: async (req, res) => {
    try {
      const data = req.body;
      const { id } = req.user;
      const response = await userDbOperations.leaveGroup(data, id);
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "No group found by given code!",
        });

      return response
        ? res.status(200).json({
            isError: false,
            message: "Left the group successfully!",
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to leave the group!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  getMyGroup: async (req, res) => {
    try {
      const { id } = req.user;
      const response = await userDbOperations.getMyGroup(id);
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "No groups found under your id!",
        });

      return response
        ? res.status(200).json({
            isError: false,
            data: response,
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to fetch your group!",
        });
      
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
};

module.exports = groupController;
