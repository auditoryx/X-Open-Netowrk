"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const stripe_1 = __importDefault(require("stripe"));
const admin = __importStar(require("firebase-admin"));
const markAsHeld_1 = require("./markAsHeld");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const stripe = new stripe_1.default(functions.config().stripe.secret, { apiVersion: '2023-10-16' });
const endpointSecret = functions.config().stripe.webhook_secret;
let apiKeySet = false;
const sendBookingConfirmation = async (toEmail, booking) => {
    const apiKey = functions.config().sendgrid.api_key;
    const fromEmail = functions.config().sendgrid.from_email || 'booking@auditoryx.com';
    if (!apiKey) {
        console.error('SendGrid API key is not configured');
        throw new Error('SendGrid API key is not configured');
    }
    if (!apiKeySet) {
        mail_1.default.setApiKey(apiKey);
        apiKeySet = true;
    }
    try {
        const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #f4f4f4;
              }
              .container {
                  background-color: #fff;
                  padding: 30px;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                  text-align: center;
                  margin-bottom: 30px;
              }
              .header h1 {
                  color: #2c3e50;
                  margin-bottom: 10px;
                  font-size: 28px;
              }
              .confirmation-badge {
                  background-color: #27ae60;
                  color: white;
                  padding: 10px 20px;
                  border-radius: 25px;
                  display: inline-block;
                  margin-bottom: 20px;
                  font-weight: bold;
              }
              .booking-details {
                  background-color: #ecf0f1;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
              }
              .booking-details h3 {
                  color: #2c3e50;
                  margin-top: 0;
                  margin-bottom: 15px;
              }
              .detail-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 10px;
                  padding: 8px 0;
                  border-bottom: 1px solid #bdc3c7;
              }
              .detail-row:last-child {
                  border-bottom: none;
                  font-weight: bold;
                  color: #2c3e50;
              }
              .detail-label {
                  font-weight: 600;
                  color: #34495e;
              }
              .detail-value {
                  color: #2c3e50;
              }
              .cta-button {
                  background-color: #3498db;
                  color: white;
                  padding: 15px 30px;
                  text-decoration: none;
                  border-radius: 5px;
                  display: inline-block;
                  margin: 20px 0;
                  font-weight: bold;
                  text-align: center;
                  width: 100%;
                  box-sizing: border-box;
              }
              .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #ecf0f1;
                  color: #7f8c8d;
                  font-size: 14px;
              }
              .footer a {
                  color: #3498db;
                  text-decoration: none;
              }
              @media (max-width: 600px) {
                  body {
                      padding: 10px;
                  }
                  .container {
                      padding: 20px;
                  }
                  .header h1 {
                      font-size: 24px;
                  }
                  .detail-row {
                      flex-direction: column;
                      align-items: flex-start;
                  }
                  .detail-value {
                      margin-top: 5px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🎉 Booking Confirmed!</h1>
                  <div class="confirmation-badge">✅ Payment Successful</div>
              </div>
              
              <p>Hi ${booking.clientName || 'Valued Client'},</p>
              
              <p>Great news! Your booking has been confirmed and your payment has been processed successfully. Here are your booking details:</p>
              
              <div class="booking-details">
                  <h3>📋 Booking Details</h3>
                  <div class="detail-row">
                      <span class="detail-label">Service Provider:</span>
                      <span class="detail-value">${booking.providerName || 'Service Provider'}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Service:</span>
                      <span class="detail-value">${booking.serviceName || booking.serviceTitle || 'Service'}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Total Amount:</span>
                      <span class="detail-value">¥${booking.total || booking.price || 0}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Payment Reference:</span>
                      <span class="detail-value">${booking.stripeSessionId || 'N/A'}</span>
                  </div>
              </div>
              
              <a href="${booking.contractId ? `/booking/${booking.id}` : '#'}" class="cta-button">
                  📄 View Booking Details
              </a>
              
              <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; color: #27ae60;"><strong>🔒 Your payment is secure:</strong> Your funds are held safely and will be released to the provider once the service is completed to your satisfaction.</p>
              </div>
              
              <p>What happens next:</p>
              <ul>
                  <li>Your provider will contact you to confirm the session details</li>
                  <li>You'll receive a booking contract to review and sign</li>
                  <li>After the session, you can release the funds and leave a review</li>
              </ul>
              
              <div class="footer">
                  <p>Need help? <a href="mailto:support@auditoryx.com">Contact our support team</a></p>
                  <p>This is an automated message from AuditoryX</p>
              </div>
          </div>
      </body>
      </html>
    `;
        await mail_1.default.send({
            to: toEmail,
            from: fromEmail,
            subject: 'Your Booking is Confirmed 🎉',
            html: html,
        });
        console.log('📧 Booking confirmation email sent to', toEmail);
    }
    catch (error) {
        console.error('❌ Booking confirmation email failed:', error);
        throw error;
    }
};
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
        console.error('Webhook signature verify failed', err);
        res.status(400).send('Webhook Error');
        return;
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.bookingId;
        if (bookingId) {
            try {
                await admin.firestore().doc(`bookings/${bookingId}`).update({
                    status: 'paid',
                    stripeSessionId: session.id
                });
                await (0, markAsHeld_1.markAsHeld)(bookingId);
                const bookingDoc = await admin.firestore().doc(`bookings/${bookingId}`).get();
                const bookingData = bookingDoc.data();
                if (bookingData) {
                    let clientEmail = bookingData.clientEmail;
                    let clientName = bookingData.clientName;
                    if (!clientEmail && (bookingData.clientId || bookingData.buyerId)) {
                        const userId = bookingData.clientId || bookingData.buyerId;
                        try {
                            const userDoc = await admin.firestore().doc(`users/${userId}`).get();
                            const userData = userDoc.data();
                            if (userData) {
                                clientEmail = userData.email;
                                clientName = clientName || userData.name || userData.displayName;
                            }
                        }
                        catch (userError) {
                            console.warn(`⚠️ Could not fetch user data for ${userId}:`, userError);
                        }
                    }
                    if (clientEmail) {
                        await sendBookingConfirmation(clientEmail, {
                            id: bookingId,
                            clientName: clientName,
                            clientEmail: clientEmail,
                            providerName: bookingData.providerName,
                            serviceName: bookingData.serviceName || bookingData.serviceTitle,
                            total: bookingData.total || bookingData.price,
                            stripeSessionId: session.id,
                            contractId: bookingData.contractId
                        });
                        console.log(`✅ Booking confirmation email sent to ${clientEmail} for booking ${bookingId}`);
                    }
                    else {
                        console.warn(`⚠️ No client email found for booking ${bookingId}. Cannot send confirmation.`);
                    }
                }
                else {
                    console.warn(`⚠️ Booking ${bookingId} not found in Firestore.`);
                }
            }
            catch (error) {
                console.error(`❌ Error processing booking confirmation for ${bookingId}:`, error);
            }
        }
    }
    res.sendStatus(200);
});
