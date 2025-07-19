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
    <div className="card-brutalist card-brutalist-interactive spacing-brutalist-md">
      <h3 className="heading-brutalist-sm mb-4">{service.serviceName}</h3>
      <p className="text-brutalist-mono mb-6 opacity-80">{service.description}</p>
      <div className="mb-4">
        <p className="text-brutalist-mono mb-2">
          <span className="text-brutalist">PRICE:</span> ${service.price}
        </p>
        <p className="text-brutalist-mono opacity-60">
          BY: {service.displayName}
        </p>
      </div>
      <button
        onClick={() => setShowRequest(!showRequest)}
        className={`w-full ${showRequest ? 'btn-brutalist-secondary' : 'btn-brutalist'}`}
      >
        {showRequest ? "CLOSE" : "REQUEST SERVICE"}
      </button>

      {showRequest && (
        <div className="mt-6 pt-6 border-t-2 border-white">
          <SendServiceRequest
            serviceId={service.id}
            recipientId={service.email}
            recipientRole="provider"
          />
        </div>
      )}
    </div>
  );
}
