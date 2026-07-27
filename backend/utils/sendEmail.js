const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    // Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email Options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    console.log("OTP Email Sent Successfully✅");
  } catch (error) {
    console.log(" Email Error:", error.message);
  }
};

module.exports = sendEmail;