const userDbOperations = require("../../db/user");
const commonMethods = require("../../utils/common");
const fs = require("fs");
const path = require("path");
///////////////////////////////////

//  console.log(err);
//  return res.status(500).json({
//    isError: true,
//    message: "Something went wrong on the server!",
//  });

const profileController = {
  getUserResumeData: async (req, res) => {
    try {
      // get resume data
      const { id } = req.user;
      const data = await userDbOperations.getUserResumeData(id);

      if (!data || data.length === 0)
        return res.status(200).json({
          isError: true,
          message: "Resume Data not found for given user id!",
        });

      return res.status(200).json({
        isError: false,
        data,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "User not found for given ID!",
      });
    }
  },
  getUserProfilePic: async (req, res) => {
    try {
      const { id } = req.user;
      const data = await userDbOperations.getUserResumeData(id);

      if (!data || data.length === 0)
        return res.status(200).json({
          isError: true,
          message: "Resume Data not found for given user id!",
        });

      let filePath = data[0]["basic_details"]["profile_picture"];
      // const options = {
      //   root: path.dirname(filePath)
      // };
      // filePath = filePath.split('/')[4]

      // sending file data
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        // console.log(typeof data);
        return res.status(200).json({
          isError: false,
          data,
        });
      });

      // doesn't work
      // return res.status(200).download(filePath);
      // doesn't work
      // return res.status(200).sendFile(filePath, options)
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  getUserResume: async (req, res) => {
    try {
      const { user_id } = req.params || req.user;
      const fileName = await userDbOperations.getUserResume(user_id);

      if (!fileName)
        return res.status(200).json({
          isError: true,
          message: "Resume Data not found for given user id!",
        });

      // sending file data
      fs.readFile(fileName, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            isError: true,
            message: "Error while getting the resume file from the server",
          });
        }
        // console.log(typeof data);
        return res.status(200).json({
          isError: false,
          fileName,
        });
      });

      // return res.status(200).download(fileName);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  saveUserResumeData: async (req, res) => {
    try {
      const { id } = req.user;
      let data = req.body;
      console.log(data);

      if (data.length === 0)
        return res.status(200).json({
          isError: true,
          message: "No data received!",
        });

      // check if files are available too
      if (req.files) {
        // file path
        const filePath = req.filePath;
        const basicDetailsData = data["basic_details"];
        data = {
          ...data,
          basic_details: {
            ...basicDetailsData,
            profile_picture: filePath,
          },
        };
      }

      const savedData = await userDbOperations.saveUserResumeData(id, data);

      if (!savedData || savedData.length === 0)
        return res.status(200).json({
          isError: true,
          message: "Resume not found for given user id!",
        });

      return res.status(200).json({
        isError: false,
        message: "Resume updated successfully!",
        data: savedData,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  deleteUserAccount: async (req, res) => {
    try {
      const { id } = req.user;
      const { user_pass } = req.body;

      const response = await userDbOperations.deleteUserAccount(id, user_pass);

      console.log({ response });

      // if wrong password
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "User password doesn't match! Please try again.",
        });

      //  send email to user about account deletion
      // !Bug: Not working
      // const emailStatus = await commonMethods.sendEmail({
      //   to: response,
      //   subject: "User Account Deletion",
      //   body: `Attention User,
      //         < br />
      //         Your account has been deleted from Campus Recruitment System on your request.
      //         < br />
      //         < br />
      //         < br />
      //         If you haven't requested this service then please contact us back.
      //   `,
      // });

      // console.log({ emailStatus });

      if (response)
        return res.status(200).json({
          isError: false,
          message: "User account deleted successfully!",
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  forgetUserPassword: async (req, res) => {
    try {
      const { id } = req.user;
      const { email, user_code, new_pass } = req.body;

      // check if unique code
      const savedCode = await userDbOperations.getUserPassChangeCode(id);

      // if code already sent
      if (
        savedCode?.pass_code &&
        user_code === undefined &&
        new_pass === undefined
      ) {
        return res.status(200).json({
          isError: true,
          message: "Code already sent to user's email!",
        });
      }
      if (savedCode?.pass_code && user_code && new_pass) {
        // confirm the code and save new password
        if (user_code === savedCode?.pass_code) {
          // change password
          await userDbOperations.updateUserPass(id, new_pass);
          // delete pass code from db
          await userDbOperations.deleteUserPassChangeCode(id);
          //
          return res.status(200).json({
            isError: false,
            message: "User password changed successfully!",
          });
        } else {
          return res.status(200).json({
            isError: true,
            message: "Wrong user code! Please enter code sent to user's email.",
          });
        }
      } else {
        // create and save it in db
        const { status, code } = await userDbOperations.saveUserPassChangeCode(
          id
        );
        if (!status)
          return res.status(500).json({
            isError: true,
            message: "Something went wrong on the server!",
          });

        console.log({ status, code });

        // 3. send email to user
        // !Bug: Fix email sent
        const emailStatus = await commonMethods.sendEmail({
          to: email,
          subject: "User Password Reset",
          body: `Your password reset code is ${code}`,
        });
        console.log(emailStatus);
        // return res.status(200).json({
        //   isError: false,
        //   code,
        // });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  changeUserPassword: async (req, res) => {
    try {
      const { id } = req.user;
      const { new_pass } = req.body;
      console.log(req.body);

      if (!new_pass)
        return res.status(200).json({
          isError: true,
          message: "New password cannot by empty!",
        });

      const response = await userDbOperations.updateUserPass(id, new_pass);

      response
        ? res.status(200).json({
            isError: false,
            message: "User password updated successfully",
          })
        : res.status(200).json({
            isError: true,
            message: "User password updated unsuccessfully",
          });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: "Something went wrong on the server!",
      });
    }
  },
  uploadUserResume: async (req, res) => {
    const file = req.files;
    console.log(file);
    try {
      if (!file)
        return res.status(200).json({
          isError: true,
          message: "File uploaded unsuccessfully",
        });
      if (file.mimetype !== "application/pdf") {
        return res.status(200).json({
          isError: true,
          message: "Only pdf file format is accepted!",
        });
      } else {
        // save filepath string in users db

        const { id } = req.user;
        const data = {
          resume_file: req.filePath,
        };
        const response = await userDbOperations.saveUserResume(id, data);

        // console.log(response);

        if (response)
          return res.status(200).json({
            isError: false,
            message: "File uploaded successfully",
          });
        else
          return res.status(200).json({
            isError: false,
            message: "Failed to upload file! Please try again",
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
  checkProfileStatus: async (req, res) => {
    try {
      const { id } = req.user;
      const response = await userDbOperations.checkProfileStatus(id);

      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "Your profile data is missing or given wrong user id!",
        });

      return res.status(200).json({
        isError: true,
        data: response,
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

module.exports = profileController;
