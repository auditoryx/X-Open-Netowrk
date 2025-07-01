const functions = require('firebase-functions');
const Stripe = require('stripe');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

const stripe = new Stripe(functions.config().stripe.secret, { apiVersion: '2023-10-16' });
let apiKeySet = false;

const sendEmail = async (toEmail, booking) => {
  const apiKey = functions.config().sendgrid.api_key;
  const fromEmail = functions.config().sendgrid.from_email || 'booking@auditoryx.com';

  if (!apiKeySet) {
    sgMail.setApiKey(apiKey);
    apiKeySet = true;
  }

  await sgMail.send({
    to: toEmail,
    from: fromEmail,
    subject: 'Your Booking is Confirmed 🎉',
    html: `
      <h1>🎉 Booking Confirmed!</h1>
      <p>Hi ${booking.clientName || 'Valued Client'},</p>
      <p>Your booking has been confirmed!</p>
      <p><strong>Service:</strong> ${booking.serviceName || 'Service'}</p>
      <p><strong>Amount:</strong> ¥${booking.total || 0}</p>
      <p>Best regards,<br>AuditoryX Team</p>
    `,
  });
  console.log('Email sent to', toEmail);
};

const webhookHandler = functions.https.onRequest(async (req, res) => {
  try {
    const event = req.body;
    console.log('Webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      
      if (bookingId) {
        // Update booking
        await admin.firestore().doc(`bookings/${bookingId}`).update({ 
          status: 'paid',
          stripeSessionId: session.id 
        });

        // Get booking data and send email
        const bookingDoc = await admin.firestore().doc(`bookings/${bookingId}`).get();
        const bookingData = bookingDoc.data();

        if (bookingData?.clientEmail) {
          await sendEmail(bookingData.clientEmail, bookingData);
        }
        
        console.log(`✅ Processed booking ${bookingId}`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

module.exports = webhookHandler;
