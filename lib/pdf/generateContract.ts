import { jsPDF } from 'jspdf';

export type BookingType = {
  clientName: string;
  providerName: string;
  serviceTitle: string;
  price: number;
  bookingDate: string;
  stripeSessionId: string;
};

export function generateContract(bookingData: BookingType) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Service Booking Contract', 20, 20);
  doc.setFontSize(12);
  doc.text(`Client: ${bookingData.clientName}`, 20, 40);
  doc.text(`Provider: ${bookingData.providerName}`, 20, 50);
  doc.text(`Service: ${bookingData.serviceTitle}`, 20, 60);
  doc.text(`Amount: $${bookingData.price.toFixed(2)}`, 20, 70);
  doc.text(`Date: ${bookingData.bookingDate}`, 20, 80);
  doc.text(`Stripe Session ID: ${bookingData.stripeSessionId}`, 20, 90);
  doc.text('By downloading this contract, both parties agree to the terms of service.', 20, 110);
  doc.save(`Booking-Contract-${bookingData.stripeSessionId}.pdf`);
}
