import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function sendEmail(to: string, subject: string, templateName: string, replacements: Record<string, string>) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const templatePath = path.join(process.cwd(), 'public', 'emails', templateName);
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Replace all placeholders in the template
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}
