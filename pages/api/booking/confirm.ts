import { NextApiRequest, NextApiResponse } from 'next';
import { sendBookingConfirmationEmail } from '../../../lib/email/sendBookingConfirmationEmail';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface BookingData {
  id: string;
  status: string;
  totalAmount: number;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  providerId: string;
  providerName: string;
  providerEmail: string;
  serviceName: string;
  serviceDescription?: string;
  serviceType?: string;
  contractId?: string;
  contractUrl?: string;
  revenueSplitEnabled?: boolean;
  stripeSessionId?: string;
  paymentStatus?: string;
}

/**
 * API endpoint to confirm a booking and send confirmation emails
 * POST /api/booking/confirm
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { bookingId, contractUrl } = req.body;

    if (!bookingId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'bookingId is required'
      });
    }

    // Fetch booking data from Firestore
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return res.status(404).json({ 
        error: 'Booking not found',
        message: `No booking found with ID: ${bookingId}`
      });
    }

    const bookingData = bookingSnap.data();

    // Validate booking status
    if (bookingData.status === 'confirmed' && bookingData.confirmationEmailSent) {
      return res.status(400).json({ 
        error: 'Booking already confirmed',
        message: 'Confirmation emails have already been sent for this booking'
      });
    }

    // Fetch client details
    const clientRef = doc(db, 'users', bookingData.clientId);
    const clientSnap = await getDoc(clientRef);
    const clientData = clientSnap.exists() ? clientSnap.data() : {};

    // Fetch provider details
    const providerRef = doc(db, 'users', bookingData.providerId);
    const providerSnap = await getDoc(providerRef);
    const providerData = providerSnap.exists() ? providerSnap.data() : {};

    // Fetch service details if serviceId exists
    let serviceData = {};
    if (bookingData.serviceId) {
      const serviceRef = doc(db, 'services', bookingData.serviceId);
      const serviceSnap = await getDoc(serviceRef);
      serviceData = serviceSnap.exists() ? serviceSnap.data() : {};
    }

    // Prepare booking confirmation data
    const confirmationData: BookingData = {
      id: bookingId,
      status: 'confirmed',
      totalAmount: bookingData.totalAmount || bookingData.price || 0,
      bookingDate: bookingData.date || bookingData.bookingDate,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      location: bookingData.location || serviceData.location,
      notes: bookingData.notes || bookingData.message,
      
      clientId: bookingData.clientId,
      clientName: clientData.displayName || clientData.name || 'Client',
      clientEmail: clientData.email || bookingData.clientEmail,
      
      providerId: bookingData.providerId,
      providerName: providerData.displayName || providerData.name || 'Provider',
      providerEmail: providerData.email || bookingData.providerEmail,
      
      serviceName: serviceData.title || bookingData.serviceName || 'Service',
      serviceDescription: serviceData.description || bookingData.serviceDescription,
      serviceType: serviceData.type || bookingData.serviceType,
      
      contractId: bookingData.contractId,
      contractUrl: contractUrl || bookingData.contractUrl,
      revenueSplitEnabled: bookingData.revenueSplitEnabled || false,
      
      stripeSessionId: bookingData.stripeSessionId || bookingData.paymentIntentId,
      paymentStatus: bookingData.paymentStatus || 'completed'
    };

    // Validate required fields
    if (!confirmationData.clientEmail || !confirmationData.providerEmail) {
      return res.status(400).json({ 
        error: 'Missing contact information',
        message: 'Client and provider email addresses are required'
      });
    }

    // Send confirmation emails
    const emailResult = await sendBookingConfirmationEmail(confirmationData);

    // Update booking status and mark emails as sent
    await updateDoc(bookingRef, {
      status: 'confirmed',
      confirmationEmailSent: true,
      confirmationEmailSentAt: new Date().toISOString(),
      contractUrl: contractUrl || bookingData.contractUrl || null,
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Booking ${bookingId} confirmed and emails sent`);

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed and emails sent successfully',
      booking: {
        id: bookingId,
        status: 'confirmed',
        emailsSent: emailResult.emailsSent,
        recipients: emailResult.recipients
      }
    });

  } catch (error) {
    console.error('❌ Booking confirmation failed:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to confirm booking and send emails',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Helper function to validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Helper function to format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0
  }).format(amount);
}
