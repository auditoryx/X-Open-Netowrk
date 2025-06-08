import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASS) {
  throw new Error('SMTP_EMAIL or SMTP_PASS is not defined')
}

// moved to sendEmail
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASS) throw new Error("SMTP_EMAIL or SMTP_PASS is not defined");
  const transporter = nodemailer.createTransport({
    service: Gmail,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS
    }
  });
  to: string,
  subject: string,
  templateName: string,
  replacements: Record<string, string>
) {
  try {
    const templatePath = path.join(process.cwd(), 'public', 'emails', templateName);
    let html = fs.readFileSync(templatePath, 'utf-8');

    for (const [key, value] of Object.entries(replacements)) {
      html = html.replaceAll(`{{${key}}}`, value);
    }

    const info = await transporter.sendMail({
      from: `"AuditoryX" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ''), // Basic fallback text
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true };
  } catch (err: any) {
    console.error('❌ Email failed:', err.message);

    // Optional: Log to Firestore or errorLogs later
    // await logErrorToFirestore({ type: 'email', message: err.message, recipient: to });

    return { error: 'Email send failed' };
  }
}

// Example usage
// await sendEmail('test@example.com', 'Welcome', 'welcome.html', { username: 'John' });
