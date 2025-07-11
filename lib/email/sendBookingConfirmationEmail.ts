import sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as path from 'path';
import { format, parseISO } from 'date-fns';

let apiKeySet = false;

interface BookingConfirmationData {
  // Booking info
  id: string;
  status: string;
  totalAmount: number;
  bookingDate: string; // ISO string
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  
  // Client info
  clientId: string;
  clientName: string;
  clientEmail: string;
  
  // Provider info
  providerId: string;
  providerName: string;
  providerEmail: string;
  
  // Service info
  serviceName: string;
  serviceDescription?: string;
  serviceType?: string;
  
  // Contract info (optional)
  contractId?: string;
  contractUrl?: string;
  revenueSplitEnabled?: boolean;
  
  // Payment info
  stripeSessionId?: string;
  paymentStatus?: string;
}

/**
 * Format booking date for display
 */
const formatBookingDate = (dateString: string, timeString?: string): string => {
  try {
    const date = parseISO(dateString);
    const dateFormatted = format(date, 'EEEE, MMMM d, yyyy');
    
    if (timeString) {
      return `${dateFormatted} at ${timeString}`;
    }
    
    return dateFormatted;
  } catch (error) {
    return dateString; // Fallback to original string
  }
};

/**
 * Generate calendar-friendly event data
 */
const generateCalendarData = (booking: BookingConfirmationData) => {
  const startDate = parseISO(booking.bookingDate);
  const endDate = booking.endTime 
    ? parseISO(`${booking.bookingDate}T${booking.endTime}`)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

  return {
    title: `${booking.serviceName} - ${booking.providerName}`,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    location: booking.location || 'Location TBD',
    description: `Booking with ${booking.providerName} for ${booking.serviceName}. Booking ID: ${booking.id}`
  };
};

/**
 * Send booking confirmation email to both client and provider
 */
export const sendBookingConfirmationEmail = async (booking: BookingConfirmationData) => {
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
    const templatePath = path.join(process.cwd(), 'templates', 'email', 'BookingConfirmed.html');
    const html = fs.readFileSync(templatePath, 'utf-8');

    // Generate calendar data
    const calendarData = generateCalendarData(booking);
    
    // Format booking date
    const formattedDate = formatBookingDate(booking.bookingDate, booking.startTime);
    
    // Prepare contract section
    const contractSection = booking.contractId && booking.contractUrl 
      ? `
        <div class="contract-section">
          <h3>📄 Contract & Revenue Split</h3>
          <p>This booking includes a revenue-sharing contract. Please review and sign the contract to finalize all terms.</p>
          <a href="${booking.contractUrl}" class="contract-button">
            📥 Download Contract
          </a>
        </div>
      `
      : '';

    // Common replacements for both emails
    const baseReplacements = {
      bookingId: booking.id,
      serviceName: booking.serviceName,
      serviceDescription: booking.serviceDescription || booking.serviceName,
      totalAmount: booking.totalAmount.toLocaleString(),
      formattedDate: formattedDate,
      location: booking.location || 'Location to be confirmed',
      notes: booking.notes || 'No additional notes',
      contractSection: contractSection,
      contractLink: booking.contractUrl || '#',
      paymentReference: booking.stripeSessionId || booking.id,
      calendarTitle: calendarData.title,
      calendarStart: calendarData.startDate,
      calendarEnd: calendarData.endDate,
      calendarLocation: calendarData.location,
      calendarDescription: calendarData.description
    };

    // Send email to client
    const clientReplacements = {
      ...baseReplacements,
      recipientName: booking.clientName,
      otherPartyName: booking.providerName,
      otherPartyRole: 'provider',
      summaryLine: `You're confirmed to work with ${booking.providerName} on ${format(parseISO(booking.bookingDate), 'MMMM d')}`,
      nextSteps: `
        <li>Your provider will contact you to confirm session details</li>
        <li>You'll receive location and setup information</li>
        ${booking.contractId ? '<li>Review and sign the attached contract</li>' : ''}
        <li>Complete your session and provide feedback</li>
      `
    };

    const clientHtml = replaceTemplateVars(html, clientReplacements);

    await sgMail.send({
      to: booking.clientEmail,
      from: fromEmail,
      subject: `🎉 Booking Confirmed: ${booking.serviceName} with ${booking.providerName}`,
      html: clientHtml,
    });

    // Send email to provider
    const providerReplacements = {
      ...baseReplacements,
      recipientName: booking.providerName,
      otherPartyName: booking.clientName,
      otherPartyRole: 'client',
      summaryLine: `You're confirmed to work with ${booking.clientName} on ${format(parseISO(booking.bookingDate), 'MMMM d')}`,
      nextSteps: `
        <li>Contact your client to confirm session details</li>
        <li>Share location and any setup requirements</li>
        ${booking.contractId ? '<li>Ensure the contract is reviewed and signed</li>' : ''}
        <li>Deliver an amazing session experience</li>
      `
    };

    const providerHtml = replaceTemplateVars(html, providerReplacements);

    await sgMail.send({
      to: booking.providerEmail,
      from: fromEmail,
      subject: `🎵 New Booking: ${booking.serviceName} with ${booking.clientName}`,
      html: providerHtml,
    });

    console.log(`📧 Booking confirmation emails sent for booking ${booking.id}`);
    console.log(`   → Client: ${booking.clientEmail}`);
    console.log(`   → Provider: ${booking.providerEmail}`);

    return { 
      success: true, 
      emailsSent: 2,
      recipients: [booking.clientEmail, booking.providerEmail]
    };

  } catch (error) {
    console.error('❌ Booking confirmation email failed:', error);
    throw error;
  }
};

/**
 * Replace template variables in HTML
 */
const replaceTemplateVars = (html: string, replacements: Record<string, string>): string => {
  let result = html;
  
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  
  return result;
};

/**
 * Send confirmation email to a single recipient (for testing or individual use)
 */
export const sendSingleBookingConfirmation = async (
  toEmail: string, 
  booking: BookingConfirmationData, 
  recipientType: 'client' | 'provider' = 'client'
) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'booking@auditoryx.com';

  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY is not defined');
  }

  if (!apiKeySet) {
    sgMail.setApiKey(apiKey);
    apiKeySet = true;
  }

  try {
    const templatePath = path.join(process.cwd(), 'templates', 'email', 'BookingConfirmed.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    const calendarData = generateCalendarData(booking);
    const formattedDate = formatBookingDate(booking.bookingDate, booking.startTime);
    
    const contractSection = booking.contractId && booking.contractUrl 
      ? `
        <div class="contract-section">
          <h3>📄 Contract & Revenue Split</h3>
          <p>This booking includes a revenue-sharing contract. Please review and sign the contract to finalize all terms.</p>
          <a href="${booking.contractUrl}" class="contract-button">
            📥 Download Contract
          </a>
        </div>
      `
      : '';

    const isClient = recipientType === 'client';
    const recipientName = isClient ? booking.clientName : booking.providerName;
    const otherPartyName = isClient ? booking.providerName : booking.clientName;
    
    const replacements = {
      bookingId: booking.id,
      recipientName,
      otherPartyName,
      otherPartyRole: isClient ? 'provider' : 'client',
      serviceName: booking.serviceName,
      serviceDescription: booking.serviceDescription || booking.serviceName,
      totalAmount: booking.totalAmount.toLocaleString(),
      formattedDate,
      location: booking.location || 'Location to be confirmed',
      notes: booking.notes || 'No additional notes',
      contractSection,
      contractLink: booking.contractUrl || '#',
      paymentReference: booking.stripeSessionId || booking.id,
      summaryLine: `You're confirmed to work with ${otherPartyName} on ${format(parseISO(booking.bookingDate), 'MMMM d')}`,
      calendarTitle: calendarData.title,
      calendarStart: calendarData.startDate,
      calendarEnd: calendarData.endDate,
      calendarLocation: calendarData.location,
      calendarDescription: calendarData.description,
      nextSteps: isClient 
        ? `
          <li>Your provider will contact you to confirm session details</li>
          <li>You'll receive location and setup information</li>
          ${booking.contractId ? '<li>Review and sign the attached contract</li>' : ''}
          <li>Complete your session and provide feedback</li>
        `
        : `
          <li>Contact your client to confirm session details</li>
          <li>Share location and any setup requirements</li>
          ${booking.contractId ? '<li>Ensure the contract is reviewed and signed</li>' : ''}
          <li>Deliver an amazing session experience</li>
        `
    };

    html = replaceTemplateVars(html, replacements);

    const subject = isClient 
      ? `🎉 Booking Confirmed: ${booking.serviceName} with ${otherPartyName}`
      : `🎵 New Booking: ${booking.serviceName} with ${otherPartyName}`;

    await sgMail.send({
      to: toEmail,
      from: fromEmail,
      subject,
      html,
    });

    console.log(`📧 Booking confirmation email sent to ${toEmail}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Single booking confirmation email failed:', error);
    throw error;
  }
};
