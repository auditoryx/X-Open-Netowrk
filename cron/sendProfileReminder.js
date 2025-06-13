const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

admin.initializeApp();
const db = admin.firestore();

const DAY_MS = 24 * 60 * 60 * 1000;

function isProfileEmpty(user) {
  return !user.bio && (!user.services || user.services.length === 0) && (!user.media || user.media.length === 0) && !user.timezone;
}

async function sendReminders() {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    console.error('SendGrid env vars missing');
    return;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const cutoff = Date.now() - DAY_MS;
  const snapshot = await db
    .collection('users')
    .where('createdAt', '<=', admin.firestore.Timestamp.fromMillis(cutoff))
    .get();

  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (isProfileEmpty(data) && !data.profileReminderSent && data.email) {
      try {
        await sgMail.send({
          to: data.email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: 'Complete your AuditoryX profile',
          text: 'Add your details to start getting bookings.',
          html: '<p>Add your details to start getting bookings.</p>',
        });
        await doc.ref.update({
          profileReminderSent: admin.firestore.FieldValue.serverTimestamp(),
        });
        count++;
      } catch (err) {
        console.error('Failed to send reminder to', data.email, err);
      }
    }
  }
  console.log(`Sent ${count} profile reminder emails`);
}

sendReminders().catch(err => {
  console.error(err);
  process.exit(1);
});
