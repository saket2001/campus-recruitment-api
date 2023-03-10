const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

/////////////////////////

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

/////////////////////////
const commonMethods = {
  checkInputs: async (obj,exclude=[]) => {
    for (const key in obj) {
      if (exclude.includes(key)) continue;
      if (obj[key] === "")
        return { status: false, message: `${key} cannot be empty!` };
    }
    return { status: true };
  },
  sendEmail: async (obj) => {
    try {
      let message = '';
      const accessToken = await oAuth2Client.getAccessToken();
      // console.log(process.env.EMAIL);
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.EMAIL,
          // pass: process.env.PASSWORD,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

      const mailOptions = {
        from: "ecampusrecruitment@gmail.com",
        to: obj.to,
        subject: obj.subject,
        //  text: "Hello from gmail email using API",
        html: `<p>${obj.body}</p>`,
      };

      message = transport
        .sendMail(mailOptions)
        .then((result) => {
          console.log(result);
          return "Email send successfully to user";
        })
        .catch((err) => {
          console.log(err);
          return "Error in sending email to user!";
        });
      
      console.log({ message });
      
      return message;
    } catch (error) {
      console.log(error);
    }

    // return message of error or success
  },
  sendWhatsappMsg: async (obj) => {},
  generateUUID: async () => uuidv4(),
};

module.exports = commonMethods;
