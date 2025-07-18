/**
 * Calculate provider payout according to platform fee structure
 * Platform takes 20%, provider gets 80% of total booking amount
 */
export async function calculateProviderPayout(totalAmount: number): Promise<{
  providerAmount: number;
  platformFee: number;
  totalAmount: number;
}> {
  if (totalAmount <= 0) {
    throw new Error('Invalid total amount for payout calculation');
  }

  const platformFeeRate = 0.20; // 20% platform fee
  const platformFee = Math.round(totalAmount * platformFeeRate * 100) / 100; // Round to 2 decimal places
  const providerAmount = Math.round((totalAmount - platformFee) * 100) / 100;

  return {
    providerAmount,
    platformFee,
    totalAmount
  };
}