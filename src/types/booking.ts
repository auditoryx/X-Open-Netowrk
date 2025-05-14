export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingContract {
  terms: string;
  agreedByClient: boolean;
  agreedByProvider: boolean;
}

export interface Booking {
  id: string;
  clientUid: string;
  providerUid: string;
  serviceId: string;
  serviceName: string;
  datetime: string;
  status: BookingStatus;
  title: string;
  notes?: string;
  createdAt: string;
  contract: BookingContract;
}
