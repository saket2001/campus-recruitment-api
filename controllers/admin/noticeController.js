const commonMethods = require("../../utils/common");
const group = require("../../models/group");
//////////////////////////////////////////

const adminDbOperations = require("../../db/admin");

const noticeController = {
  createNotice: async (req, res) => {
    try {
      const { id } = req.user;
      const body = req.body;
      // checks for if any input field is empty
      const isValid = await commonMethods.checkInputs(body);
      if (!isValid.status)
        return res
          .status(200)
          .json({ isError: true, message: isValid.message });

      const response = await adminDbOperations.createNotice(body, id);

      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "No notices found for the following group!",
        });

      // TODO send email to group members
      // create func for it
      if (response) {
        // email bulk notification
        const groupData = await group.findOne({ _id: body?.group_id });
          const mailIDs = groupData?.members.map((member) => member.email);

          commonMethods?.sendEmail({
            subject: `New Notice on Virtual Recruitment`,
            to: mailIDs,
            viewName: "NoticeAlert",
            context: {
              date: new Date().toDateString(),
            },
          });

        return res.status(200).json({
          isError: false,
          message: "Notice Created Successfully!",
        });
      } else {
        return res.status(500).json({
          isError: true,
          message: "Failed to create notice",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  editNotice: async (req, res) => {
    try {
      const { notice_id } = req.params;
      const body = req.body;
      const response = await adminDbOperations.editNotice(body, notice_id);

      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "No notice found for given id!",
        });

      return response
        ? res.status(200).json({
            isError: false,
            message: "Edited notice successfully!",
            data: response,
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to edit the notice!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  deleteNotice: async (req, res) => {
    try {
      const { notice_id } = req.params;
      if (notice_id.length <= 0)
        return res.status(200).json({
          isError: true,
          message: "Notice ID is required!",
        });
      const response = await adminDbOperations.deleteNotice(notice_id);

      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "No notice found for given id!",
        });

      return response
        ? res.status(200).json({
            isError: false,
            message: "Deleted notice successfully!",
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to delete the notice!",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  viewAllNotices: async (req, res) => {
    try {
      const { group_id } = req.params;
      if (group_id.length <= 0)
        res.status(200).json({
          isError: true,
          message: "Group ID is required!",
        });
      const response = await adminDbOperations.viewAllNotices(group_id);

      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "No notices found for the following group!",
        });

      return response
        ? res.status(200).json({
            isError: false,
            data: response,
          })
        : res.status(500).json({
            isError: true,
            message: "Failed to get notices",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  viewNotice: async (req, res) => {
    try {
      const { notice_id } = req.params;
      const response = await adminDbOperations.viewNotice(notice_id);

      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "No notice found!",
        });

      return response
        ? res.status(200).json({
            isError: false,
            data: response,
          })
        : res.status(500).json({
            isError: true,
            message: "Failed to get notice!",
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

module.exports = noticeController;
