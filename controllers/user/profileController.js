const userDbOperations = require("../../db/user");
const commonMethods = require("../../utils/common");
const fs = require("fs");
const path = require("path");
const ResumeParser = require("simple-resume-parser");
const pdfUtil = require("pdf-to-text");
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

      // sending file data
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        return res.status(200).json({
          isError: false,
          data,
        });
      });
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

      if (fileName === 2) {
        return res.status(200).json({
          isError: true,
          message: "You are not authorized to access this resume file!",
        });
      }

      // sending file data
      fs.readFile(fileName, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            isError: true,
            message: "Error while getting the resume file from the server",
          });
        }
        // pdfUtil.pdfToText(fileName, function (err, data) {
        //   if (err) throw err;
        //   console.log(data); //print all text
        // });
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
  uploadUserPicture: async (req, res) => {
    const image = req.files;

    try {
      if (!image)
        return res.status(200).json({
          isError: true,
          message: "Image uploaded unsuccessfully",
        });
      else {
        const { id } = req.user;
        const profile_picture = req.filePath;

        const fileName = await userDbOperations.getUserPictureFile(id);
        fs.unlink(fileName, (err, msg) => {
          if (err) console.log(err);
          console.log(msg);
        });

        const response = await userDbOperations.saveUserPicture(
          id,
          profile_picture
        );

        if (response)
          return res.status(200).json({
            isError: false,
            message: "Image uploaded successfully",
          });
        else
          return res.status(200).json({
            isError: false,
            message: "Failed to upload image! Please try again",
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
  deleteUserPicture: async (req, res) => {
    try {
      const { id } = req.user;

      const response = userDbOperations.deleteUserPicture(id);

      if (response)
        return res.status(200).json({
          isError: false,
          message: "Profile picture removed successfully!",
        });
      else
        return res.status(200).json({
          isError: false,
          message: "Failed to remove profile picture! Please try again",
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        isError: true,
        message: err.message,
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
      console.log(response);

      // if wrong password
      if (response === 1)
        return res.status(200).json({
          isError: true,
          message: "User password doesn't match! Please try again.",
        });

      //  send email to user about account deletion

      return response
        ? res.status(200).json({
            isError: false,
            message: "User account deleted successfully!",
          })
        : res.status(200).json({
            isError: true,
            message: "Failed to delete user account due to wrong password!",
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

        // // From URL
        // const resume = new ResumeParser(
        //   "https://writing.colostate.edu/guides/documents/resume/functionalSample.pdf"
        // );
        // // //Convert to JSON Object
        // resume
        //   .parseToJSON()
        //   .then((data) => {
        //     console.log("Yay! ", data);
        //   })
        //   .catch((error) => {
        //     console.error(error);
        //   });

        // const p =
        //   __basedir + "\\" + req.filePath.toString().replaceAll("/", "\\");
        // // p.replaceAll("\\", "/");
        // pdfUtil.pdfToText(p),
        //   function (err, data) {
        //     if (err) {
        //       // throw err;
        //       console.log(err);
        //     }
        //     console.log(data); //print all text
        //   };

        const fileName = await userDbOperations.getUserResume(id);
        if (fileName)
          fs.unlink(fileName, (err, msg) => {
            if (err) console.log(err);
            console.log(msg);
          });

        const response = await userDbOperations.saveUserResume(id, data);

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
