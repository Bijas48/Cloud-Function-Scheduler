const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const express = require("express");

const app = express();
const prisma = new PrismaClient();

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.HOST_MAIL,
    pass: process.env.PASS_MAIL,
  },
});

// Setup Mailgen
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "FinancyQ - Manage Your Money, Achieve Your Dreams",
    link: "mailto:financyQworkspace@gmail.com?subject=Inquiry%20about%20FinancyQ", //
  },
});

// Function to generate email content
const generateEmail = (user_name) => {
  const email = {
    body: {
      name: user_name,
      intro: "Jangan Lupa Hari ini Catat Pemasukan dan Pengeluaranmu...",
      outro: "Have a nice day!",
    },
  };

  return mailGenerator.generate(email);
};

// Function to send email
const sendEmail = async (to, name) => {
  const emailBody = generateEmail(name);

  const mailOptions = {
    from: process.env.HOST_MAIL,
    to,
    subject: "Daily Reminder",
    html: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

// Cloud Function to send emails to all users
app.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        username: true,
      },
    });

    const emailPromises = users.map((user) =>
      sendEmail(user.email, user.username)
    );
    await Promise.all(emailPromises);

    res.status(200).send("Emails sent successfully");
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).send("Error sending emails");
  }
});

// Cloud Function entry point
exports.sendEmails = app;

// Initialize Prisma Client
prisma.$connect().catch((error) => {
  console.error("Error connecting to the database:", error);
});
