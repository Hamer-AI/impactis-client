import nodemailer from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

function buildSmtpTransport() {
  const smtpService = (process.env.SMTP_SERVICE ?? "").trim().toLowerCase();
  const smtpHost = (process.env.SMTP_HOST ?? "").trim();
  const smtpUser = (process.env.SMTP_USER ?? "").trim();
  const smtpPass = (process.env.SMTP_PASS ?? "").trim();

  // Convenience defaults for Gmail (requires an App Password).
  const inferredGmail =
    smtpService === "gmail" ||
    (smtpUser.toLowerCase().endsWith("@gmail.com") && !smtpHost);

  const host = inferredGmail ? "smtp.gmail.com" : smtpHost;
  const portRaw = (process.env.SMTP_PORT ?? "").trim();
  const port = portRaw ? Number(portRaw) : inferredGmail ? 465 : 587;
  const secure =
    (process.env.SMTP_SECURE ?? "").trim().length > 0
      ? process.env.SMTP_SECURE === "true"
      : inferredGmail
        ? true
        : port === 465;

  if (!host) {
    return { mode: "dev-capture" as const, transporter: null };
  }

  const auth = smtpUser
    ? {
        user: smtpUser,
        pass: smtpPass || undefined,
      }
    : undefined;

  return {
    mode: host === "localhost" ? ("dev-capture" as const) : ("smtp" as const),
    transporter: nodemailer.createTransport({
      host,
      port,
      secure,
      auth,
    }),
  };
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const from = (process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? "").trim();
  if (!from) {
    console.warn(
      "Email not sent: set EMAIL_FROM (recommended) or SMTP_USER (fallback).",
    );
    return;
  }

  const { mode, transporter } = buildSmtpTransport();

  try {
    if (mode === "dev-capture" || !transporter) {
      console.log(
        `\n\n📧 [DEV MODE] Captured Email to ${to}:\nSubject: ${subject}\nBody: ${text || html}\n\n` +
          `To send real emails (Gmail): set SMTP_SERVICE=gmail, SMTP_USER, SMTP_PASS (App Password), EMAIL_FROM.\n`,
      );
      return;
    }

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

