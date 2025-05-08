import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: "no-reply@coretix.dev",
    ...options,
  });
}
