import nodemailer from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    console.warn("EMAIL_FROM is not set; skipping email send.");
    return;
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("Failed to send email via SMTP:", err);
  }
}

