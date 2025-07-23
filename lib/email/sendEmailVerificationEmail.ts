import sgMail from '@sendgrid/mail';
import { logger } from '@/lib/logger';

let apiKeySet = false;

export const sendEmailVerificationEmail = async (
  toEmail: string,
  verificationLink: string,
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
    subject: 'Verify Your X-Open-Network Email Address',
    html: generateEmailVerificationHtml(verificationLink, userName),
    text: generateEmailVerificationText(verificationLink, userName)
  };

  try {
    await sgMail.send(msg);
    logger.info('Email verification email sent successfully', { 
      email: toEmail.replace(/@.*/, '@***') 
    });
  } catch (error) {
    logger.error('Failed to send email verification email:', error);
    throw error;
  }
};

function generateEmailVerificationHtml(verificationLink: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email Address</title>
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
        .info-box { background: #e0f2fe; border: 1px solid #0284c7; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>X-Open-Network</h1>
          <h2>Email Verification Required</h2>
        </div>
        
        <div class="content">
          <h3>Hi ${userName},</h3>
          
          <p>Welcome to X-Open-Network! To complete your account setup and access all features, please verify your email address.</p>
          
          <div style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify My Email Address</a>
          </div>
          
          <div class="info-box">
            <strong>📧 Why verify your email?</strong>
            <ul>
              <li>Secure your account and enable password recovery</li>
              <li>Receive important booking confirmations and updates</li>
              <li>Access premium features and booking tools</li>
              <li>Get notifications about new opportunities</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
            ${verificationLink}
          </p>
          
          <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
          
          <p>If you didn't create an account with X-Open-Network, you can safely ignore this email.</p>
          
          <p>Welcome to the future of creative collaboration!</p>
          
          <p>Best regards,<br>The X-Open-Network Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${verificationLink.includes('?') ? verificationLink.split('?')[0].split('/').pop() : 'your email'} because you signed up for X-Open-Network.</p>
          <p>&copy; ${new Date().getFullYear()} X-Open-Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEmailVerificationText(verificationLink: string, userName: string): string {
  return `
Hi ${userName},

Welcome to X-Open-Network! To complete your account setup and access all features, please verify your email address.

Verify your email by clicking this link:
${verificationLink}

Why verify your email?
- Secure your account and enable password recovery
- Receive important booking confirmations and updates  
- Access premium features and booking tools
- Get notifications about new opportunities

Important: This verification link will expire in 24 hours for security reasons.

If you didn't create an account with X-Open-Network, you can safely ignore this email.

Welcome to the future of creative collaboration!

Best regards,
The X-Open-Network Team

This email was sent because you signed up for X-Open-Network. If you didn't sign up, please ignore this email.
  `;
}