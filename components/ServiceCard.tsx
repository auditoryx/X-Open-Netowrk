"use client";
import { useState } from "react";
import SendServiceRequest from "./SendServiceRequest";
import { Service } from "../src/types/service";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps): JSX.Element {
  const [showRequest, setShowRequest] = useState<boolean>(false);

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
        <SendServiceRequest
          serviceId={service.id}
          recipientId={service.email}
          recipientRole="provider"
        />
      )}
    </div>
  );
}
