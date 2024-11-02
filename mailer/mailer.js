const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send an email
const sendWelcomeMail = (to, firstName, username, password) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: "Welcome to Lumina Archives!",
    text: "Welcome to Lumina Archives " + firstName + "!",
    html: `
    <h1>Welcome to Lumina Archives ${firstName}!</h1>
    <p>We are so happy you've joined us! Your account has been successfully created: </p>
    <p>Username: ${username}</p>
    <p>Password: ${password}</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const checkedOutMail = (to, itemName) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: "Checked out successfully",
    text: "Checked out item: " + itemName + "!",
    html: `
    
    <p>Hello, you've checked out ${itemName} </p>

    `,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = {sendWelcomeMail, checkedOutMail};
