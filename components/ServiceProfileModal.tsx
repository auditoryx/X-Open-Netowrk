"use client";
import { Service } from "../src/types/service";

interface ServiceProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

export default function ServiceProfileModal({ isOpen, onClose, service }: ServiceProfileModalProps) {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-white text-xl">✕</button>
        <h2 className="text-2xl font-bold mb-2">{service.displayName}</h2>
        <p className="text-gray-400 mb-4">{service.description}</p>
        <div className="space-y-2 text-white">
          <p><strong>Role:</strong> {service.role}</p>
          <p><strong>Service:</strong> {service.serviceName}</p>
          <p><strong>Price:</strong> ${service.price}</p>
        </div>
        <button className="btn btn-primary w-full mt-6">Request This Service</button>
      </div>
    </div>
  );
}
