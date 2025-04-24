import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendBookingConfirmation = async (toEmail: string, bookingId: string) => {
  try {
    await resend.emails.send({
      from: 'AuditoryX <booking@auditoryx.com>',
      to: [toEmail],
      subject: 'Your Booking is Confirmed 🎉',
      html: `
        <div style='font-family:sans-serif;padding:20px'>
          <h2>✅ Booking Confirmed</h2>
          <p>Thank you! Your booking <strong>#${bookingId}</strong> is confirmed and paid.</p>
          <p>We’ll be in touch with more details soon.</p>
        </div>
      `,
    });
    console.log('📧 Email sent to', toEmail);
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
};
