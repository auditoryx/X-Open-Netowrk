// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User and Auth types
export interface User {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: UserRole;
  createdAt?: number;
  updatedAt?: number;
}

export type UserRole = 'artist' | 'producer' | 'engineer' | 'videographer' | 'studio' | 'admin';

// Service types  
export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  createdAt: number;
  updatedAt?: number;
  isActive: boolean;
  tags?: string[];
  location?: string;
  duration?: number;
  images?: string[];
}

export interface CreateServiceRequest {
  title: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  location?: string;
  duration?: number;
  images?: string[];
}

export interface UpdateServiceRequest {
  id: string;
  updates: Partial<Service>;
}

// Booking types
export interface Booking {
  id: string;
  serviceId: string;
  clientId: string;
  providerId: string;
  status: BookingStatus;
  scheduledAt: number;
  createdAt: number;
  updatedAt?: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Availability types
export interface Availability {
  id: string;
  uid: string;
  role: UserRole;
  timeSlot: string;
  createdAt: any;
  isAvailable: boolean;
  date: string;
  startTime: string;
  endTime: string;
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: number;
  isRead: boolean;
  bookingId?: string;
}

// Common request types
export interface PaginatedRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}