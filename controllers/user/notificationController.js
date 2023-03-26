const userDbOperations = require("../../db/user");

///////////////////////////////////////
const NotificationController = {
  getNotifications: async (req, res) => {
    try {
      const { id } = req.user;
      const response = await userDbOperations.getNotifications(id);

      return response
        ? res.status(200).json({
            isError: false,
            data: response,
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to get notifications!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  deleteNotification: async (req, res) => {
    try {
      const { notification_id } = req.params;
      const response = await userDbOperations.deleteNotification(
        notification_id
      );

      return response
        ? res.status(200).json({
            isError: false,
            message: "Deleted notification successfully!",
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to delete notification!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
  changeStatusOfNotification: async (req, res) => {
    try {
      const { id } = req.user;
      const { notifications } = req.body;

      const response = await userDbOperations.changeStatusOfNotification(
        id,
        notifications
      );

      return response
        ? res.status(200).json({
            isError: false,
            data: response,
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to change notification status",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on server!",
      });
    }
  },
};

module.exports = NotificationController;
