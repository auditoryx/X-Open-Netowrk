import sgMail from '@sendgrid/mail';
import { logger } from '@/lib/logger';

let apiKeySet = false;

export const sendPasswordResetEmail = async (
  toEmail: string,
  resetLink: string,
  userName: string = 'User'
) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@x-open-network.com';

  if (!apiKey) {
    logger.error('SENDGRID_API_KEY is not defined');
    throw new Error('SENDGRID_API_KEY is not defined');
  }

  if (!apiKeySet) {
    sgMail.setApiKey(apiKey);
    apiKeySet = true;
  }

  const msg = {
    to: toEmail,
    from: fromEmail,
    subject: 'Reset Your X-Open-Network Password',
    html: generatePasswordResetHtml(resetLink, userName),
    text: generatePasswordResetText(resetLink, userName)
  };

  try {
    await sgMail.send(msg);
    logger.info('Password reset email sent successfully', { 
      email: toEmail.replace(/@.*/, '@***') 
    });
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw error;
  }
};

function generatePasswordResetHtml(resetLink: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9fafb; }
        .button { 
          display: inline-block; 
          background: #3b82f6; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
        }
        .footer { padding: 20px; font-size: 14px; color: #6b7280; text-align: center; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>X-Open-Network</h1>
          <h2>Password Reset Request</h2>
        </div>
        
        <div class="content">
          <h3>Hi ${userName},</h3>
          
          <p>We received a request to reset your password for your X-Open-Network account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset My Password</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in 24 hours for security reasons</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
            ${resetLink}
          </p>
          
          <p>If you're having trouble, please contact our support team.</p>
          
          <p>Best regards,<br>The X-Open-Network Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${toEmail}. If you didn't request this password reset, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} X-Open-Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePasswordResetText(resetLink: string, userName: string): string {
  return `
Hi ${userName},

We received a request to reset your password for your X-Open-Network account.

Reset your password by clicking this link:
${resetLink}

Important:
- This link will expire in 24 hours for security reasons
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

If you're having trouble, please contact our support team.

Best regards,
The X-Open-Network Team

This email was sent because a password reset was requested for your account. If you didn't request this, please ignore this email.
  `;
}