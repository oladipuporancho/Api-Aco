const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, from = process.env.SMTP_EMAIL) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL, // Your email address
        pass: process.env.SMTP_PASSWORD, // Your email password
      },
    });

    const mailOptions = {
      from, // Customizable sender
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${to}: ${info.response}`);
    return true; // Indicate successful email sending
  } catch (error) {
    console.error(
      `Failed to send email to ${to}. Error: ${error.message}`
    );
    throw new Error("Email could not be sent. Please try again later.");
  }
};

module.exports = sendEmail;
