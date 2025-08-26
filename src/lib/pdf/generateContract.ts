export type BookingType = {
  clientName: string;
  providerName: string;
  serviceTitle: string;
  price: number;
  bookingDate: string;
  stripeSessionId?: string;
};

export function generateContract(b: BookingType) {
  if (typeof window === 'undefined') return;
  const text = [
    'Service Contract',
    `Client: ${b.clientName}`,
    `Provider: ${b.providerName}`,
    `Service: ${b.serviceTitle}`,
    `Amount: $${b.price.toFixed(2)}`,
    `Date: ${b.bookingDate}`,
    b.stripeSessionId ? `Stripe: ${b.stripeSessionId}` : '',
  ].join('\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'contract.txt';
  a.click();
  URL.revokeObjectURL(url);
}
