export interface Service {
  id: string;
  title: string;
  serviceName: string;
  description: string;
  price: number;
  userId: string;
  email: string;
  displayName: string;
  role: 'creator' | 'admin' | 'user';
  createdAt: number;
  tags?: string[];
  category?: string;
  availability?: string[];
}

export interface ServiceRequest {
  id: string;
  serviceId: string;
  clientId: string;
  providerId: string;
  recipientId: string;
  recipientRole: 'provider' | 'creator' | 'admin';
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  message?: string;
  createdAt: number;
}

export interface ServiceFormData {
  title: string;
  price: string;
  desc: string;
  userId: string;
  role: 'creator' | 'admin' | 'user';
}