const adminDbOperations = require("../../db/admin");

///////////////////////////////////////
const groupController = {
  createGroup: async (req, res) => {
    try {
      const { id } = req.user;
      const body = req.body;

      const response = await adminDbOperations.createGroup(id, body);
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "Group already exists with given name!",
        });

      return response
        ? res.status(200).json({
            isError: false,
            message: "New group created successfully!",
            data: response,
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to create new group!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  getMyGroups: async (req, res) => {
    try {
      const { id } = req.user;
      const response = await adminDbOperations.getMyGroups(id);
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
            message: "Failed to fetch all groups!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  deleteGroup: async (req, res) => {
    try {
      const { group_id } = req.body;
      const response = await adminDbOperations.deleteGroup(group_id);
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "No group found by given id!",
        });

      return response
        ? res.status(200).json({
            isError: false,
            message: "Deleted group successfully",
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to delete group!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  getMembersDetails: async (req, res) => {
    try {
      const { group_id } = req.params;
      const response = await adminDbOperations.getMembersDetails(group_id);
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
            message: "Failed to fetch group members!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  deleteGroupMember: async (req, res) => {
    try {
      const { group_id, user_id } = req.body;
      console.log(group_id);
      const response = await adminDbOperations.deleteGroupMember(
        group_id,
        user_id
      );

      // TODO Email can be send to candidate later
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "No group found by given id!",
        });

      return response
        ? res.status(200).json({
            isError: false,
            message: "Deleted group member successfully",
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to delete group member!",
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
