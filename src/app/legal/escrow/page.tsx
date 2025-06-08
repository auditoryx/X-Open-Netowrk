"use client";

export default function EscrowTermsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Escrow Terms & Refund Policy</h1>
        <p>
          All payments are held in escrow until both client and provider confirm the work
          has been completed. If a dispute arises, funds may be refunded according to our
          guidelines. Please review the full policy below.
        </p>
        <p>
          Refund requests must be submitted within 7 days of the scheduled completion date.
          Approved refunds will be returned to the original payment method.
        </p>
      </div>
    </div>
  );
}
