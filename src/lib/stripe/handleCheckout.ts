export const handleCheckout = async (data: {
  serviceId: string,
  title: string,
  price: number,
  providerId: string,
  buyerId: string
}) => {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to create checkout session');
  return res.json();
};
