const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vehicletrackingsystem03111989@gmail.com",
    pass: "rvdjdpwtistvsinx",
  },
});

const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: "vehicletrackingsystem03111989@gmail.com",
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
 