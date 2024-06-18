require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const express = require("express");
require("dotenv").config();

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
    link: "mailto:financyQworkspace@gmail.com?subject=Inquiry%20about%20FinancyQ",
  },
});

// Function to generate email content
const generateEmail = (
  user_name,
  totalPemasukan,
  totalPengeluaran,
  pesan,
  status
) => {
  let buttonColor;
  let buttonText;

  if (status === "aman") {
    buttonColor = "#22BC66"; // Hijau untuk aman
    buttonText = "Aman";
  } else if (status === "tidak aman") {
    buttonColor = "#BD2A2A"; // Merah untuk tidak aman
    buttonText = "Tidak Aman";
  } else {
    buttonColor = "#808080"; // Abu-abu untuk tidak ada data
    buttonText = "Belum Ada Data";
  }

  const email = {
    body: {
      name: user_name,
      intro: `Jangan Lupa Hari ini Catat Pemasukan dan Pengeluaranmu...`,
      table: {
        data: [
          {
            item: "Pemasukan",
            total: `Rp ${totalPemasukan.toLocaleString()}`,
          },
          {
            item: "Pengeluaran",
            total: `Rp ${totalPengeluaran.toLocaleString()}`,
          },
        ],
        columns: {
          customWidth: {
            item: "50%",
            total: "50%",
          },
          customAlignment: {
            total: "right",
          },
        },
      },
      action: {
        instructions: pesan,
        button: {
          color: buttonColor, // Optional action button color
          text: buttonText,
        },
      },
      outro: "Have a nice day!",
    },
  };

  return mailGenerator.generate(email);
};

// Function to send email
const sendEmail = async (to, name, totalPemasukan, totalPengeluaran) => {
  let pesan;
  let status;

  if (totalPemasukan === 0 && totalPengeluaran === 0) {
    pesan =
      "Anda belum memasukkan catatan pemasukan dan pengeluaran. Silakan tambahkan catatan Anda untuk hari ini.";
    status = "belum ada data";
  } else {
    const selisih = totalPemasukan - totalPengeluaran;
    if (selisih > 0) {
      pesan = `Sejauh ini anda telah menghemat Rp ${selisih.toLocaleString()}. Teruskan usaha yang bagus ini!`;
      status = "aman";
    } else {
      pesan = `Anda telah mengeluarkan Rp ${Math.abs(
        selisih
      ).toLocaleString()} lebih banyak daripada pemasukan. Berusahalah menghemat lebih baik lagi!`;
      status = "tidak aman";
    }
  }

  const emailBody = generateEmail(
    name,
    totalPemasukan,
    totalPengeluaran,
    pesan,
    status
  );

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

// Function to get total transactions for today
const getTotalTransactionsForToday = async (userId, model) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const transactions = await model.findMany({
    where: {
      idUser: userId,
      tanggal: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  return transactions.reduce((acc, transaction) => acc + transaction.jumlah, 0);
};

// Cloud Function to send emails to all users
app.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        username: true,
        id: true,
      },
    });

    for (const user of users) {
      const totalPemasukan = await getTotalTransactionsForToday(
        user.id,
        prisma.pemasukan
      );
      const totalPengeluaran = await getTotalTransactionsForToday(
        user.id,
        prisma.pengeluaran
      );

      await sendEmail(
        user.email,
        user.username,
        totalPemasukan,
        totalPengeluaran
      );
    }

    res.status(200).send("Emails sent successfully");
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).send("Error sending emails");
  }
});

// // Cloud Function entry point
// exports.sendTotalEmails = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

// Initialize Prisma Client
prisma.$connect().catch((error) => {
  console.error("Error connecting to the database:", error);
});
