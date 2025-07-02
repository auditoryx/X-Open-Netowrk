import sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as path from 'path';

let apiKeySet = false;

interface BookingData {
  id: string;
  clientName?: string;
  clientEmail?: string;
  providerName?: string;
  serviceName?: string;
  serviceTitle?: string;
  total?: number;
  price?: number;
  bookingDate?: string;
  datetime?: string;
  stripeSessionId?: string;
  contractId?: string;
}

export const sendBookingConfirmation = async (toEmail: string, booking: BookingData) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'booking@auditoryx.com';

  if (!apiKey) {
    console.error('SENDGRID_API_KEY is not defined');
    throw new Error('SENDGRID_API_KEY is not defined');
  }

  if (!apiKeySet) {
    sgMail.setApiKey(apiKey);
    apiKeySet = true;
  }

  try {
    // Load HTML template
    const templatePath = path.join(process.cwd(), 'lib', 'email', 'templates', 'bookingConfirmation.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    // Inject dynamic content
    const replacements = {
      clientName: booking.clientName || 'Valued Client',
      providerName: booking.providerName || 'Service Provider',
      service: booking.serviceName || booking.serviceTitle || 'Service',
      total: (booking.total || booking.price || 0).toString(),
      sessionId: booking.stripeSessionId || 'N/A',
      contractLink: booking.contractId ? `/booking/${booking.id}` : '#'
    };

    for (const [key, value] of Object.entries(replacements)) {
      html = html.replaceAll(`{${key}}`, value);
    }

    await sgMail.send({
      to: toEmail,
      from: fromEmail,
      subject: 'Your Booking is Confirmed 🎉',
      html: html,
    });

    console.log('📧 Booking confirmation email sent to', toEmail);
  } catch (error) {
    console.error('❌ Booking confirmation email failed:', error);
    throw error;
  }
};
