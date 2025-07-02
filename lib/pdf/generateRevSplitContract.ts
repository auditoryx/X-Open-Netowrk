import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Booking, RevenueSplit } from '@/lib/types/Booking';

export async function generateRevSplitContract(booking: Booking, creatorName: string, clientNames: string[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const fontSize = 12;
  const margin = 50;
  let y = height - margin;

  const drawText = (text: string, x: number, yPos: number, size = fontSize) => {
    page.drawText(text, {
      x,
      y: yPos,
      font,
      size,
      color: rgb(0, 0, 0),
    });
    return size + 5; // Return line height
  };

  y -= drawText('Revenue-Split Contract', margin, y, 18);
  y -= 20;

  y -= drawText(`Date: ${new Date(booking.createdAt.toMillis()).toLocaleDateString()}`, margin, y);
  y -= 15;

  y -= drawText('Parties Involved:', margin, y, 14);
  y -= 10;
  y -= drawText(`- Creator: ${creatorName} (UID: ${booking.creatorUid})`, margin + 10, y);
  clientNames.forEach((name, index) => {
    y -= drawText(`- Client ${index + 1}: ${name} (UID: ${booking.clientUids[index]})`, margin + 10, y);
  });
  y -= 20;

  y -= drawText('Booking Details:', margin, y, 14);
  y -= 10;
  y -= drawText(`- Session Title: ${booking.sessionTitle || 'N/A'}`, margin + 10, y);
  y -= drawText(`- Scheduled At: ${new Date(booking.scheduledAt.toMillis()).toLocaleString()}`, margin + 10, y);
  y -= drawText(`- Duration: ${booking.durationMinutes} minutes`, margin + 10, y);
  y -= drawText(`- Total Cost: $${booking.totalCost.toFixed(2)}`, margin + 10, y);
  y -= 20;

  y -= drawText('Revenue Split Agreement:', margin, y, 14);
  y -= 10;
  if (booking.revenueSplit) {
    for (const role in booking.revenueSplit) {
      const percentage = booking.revenueSplit[role] * 100;
      y -= drawText(`- ${role}: ${percentage.toFixed(2)}%`, margin + 10, y);
    }
  } else {
    y -= drawText('No revenue split defined.', margin + 10, y);
  }
  y -= 30;

  y -= drawText('By confirming this booking, all parties agree to the terms outlined above.', margin, y, 10);

  return pdfDoc.save();
}
