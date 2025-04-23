"use client";
import { useState } from "react";
import SendServiceRequest from "./SendServiceRequest";

export default function ServiceCard({ service }) {
  const [showRequest, setShowRequest] = useState(false);

  return (
    <div className="border border-gray-700 p-4 rounded-lg bg-gray-900 text-white space-y-2">
      <h3 className="text-xl font-bold">{service.serviceName}</h3>
      <p className="text-sm text-gray-400">{service.description}</p>
      <p><strong>Price:</strong> ${service.price}</p>
      <p className="text-gray-500 text-sm">By: {service.displayName}</p>
      <button
        onClick={() => setShowRequest(!showRequest)}
        className="btn btn-primary w-full mt-2"
      >
        {showRequest ? "Close" : "Request This Service"}
      </button>

      {showRequest && (
        <SendServiceRequest recipientId={service.email} recipientRole="provider" />
      )}
    </div>
  );
}
