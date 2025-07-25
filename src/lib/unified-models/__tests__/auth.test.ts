import { 
  getSessionUser,
  getUserByUid,
  getAuthContext,
  requireAuth,
  requireAdmin,
  requireCreator,
  hasPermission,
  isResourceOwner,
  authenticateRequest
} from '../auth';
import { UnifiedUser } from '../user';

// Mock Next-Auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock Firebase Admin
jest.mock('@/lib/firebase-admin', () => ({
  admin: {
    firestore: () => ({
      collection: jest.fn(),
    }),
    auth: () => ({
      verifyIdToken: jest.fn(),
    }),
  },
}));

// Mock authOptions
jest.mock('@/lib/authOptions', () => ({
  authOptions: {},
}));

const mockGetServerSession = require('next-auth').getServerSession as jest.Mock;
const mockFirestore = require('@/lib/firebase-admin').admin.firestore;
const mockAuth = require('@/lib/firebase-admin').admin.auth;

describe('Authentication Module', () => {
  const mockUser: UnifiedUser = {
    uid: 'test-uid-123',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'creator',
    tier: 'verified',
    verificationStatus: 'verified',
    xp: 1500,
    rankScore: 850,
    reviewCount: 42,
    emailVerified: true,
    paymentMethodsSetup: true,
    isActive: true,
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    profileVisibility: 'public',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSessionUser', () => {
    test('returns user data from valid session', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'test-uid-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'creator',
          tier: 'verified',
        },
      });

      const result = await getSessionUser();
      
      expect(result).toEqual({
        uid: 'test-uid-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'creator',
        tier: 'verified',
      });
    });

    test('returns null for invalid session', async () => {
      mockGetServerSession.mockResolvedValue(null);
      
      const result = await getSessionUser();
      expect(result).toBeNull();
    });

    test('returns null for session without email', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'test-uid' },
      });
      
      const result = await getSessionUser();
      expect(result).toBeNull();
    });

    test('handles session errors gracefully', async () => {
      mockGetServerSession.mockRejectedValue(new Error('Session error'));
      
      const result = await getSessionUser();
      expect(result).toBeNull();
    });
  });

  describe('getUserByUid', () => {
    test('returns user data for existing user', async () => {
      const mockDoc = {
        exists: true,
        data: () => ({
          ...mockUser,
          createdAt: { toDate: () => mockUser.createdAt },
          updatedAt: { toDate: () => mockUser.updatedAt },
        }),
      };

      mockFirestore.mockReturnValue({
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve(mockDoc),
          }),
        }),
      });

      const result = await getUserByUid('test-uid-123');
      expect(result).toBeTruthy();
      expect(result?.uid).toBe('test-uid-123');
      expect(result?.email).toBe('test@example.com');
    });

    test('returns null for non-existent user', async () => {
      const mockDoc = {
        exists: false,
        data: () => null,
      };

      mockFirestore.mockReturnValue({
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve(mockDoc),
          }),
        }),
      });

      const result = await getUserByUid('non-existent-uid');
      expect(result).toBeNull();
    });

    test('handles Firestore errors gracefully', async () => {
      mockFirestore.mockReturnValue({
        collection: () => ({
          doc: () => ({
            get: () => Promise.reject(new Error('Firestore error')),
          }),
        }),
      });

      const result = await getUserByUid('test-uid-123');
      expect(result).toBeNull();
    });
  });

  describe('getAuthContext', () => {
    test('returns authenticated context for valid user', async () => {
      // Mock session
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'test-uid-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      // Mock Firestore
      const mockDoc = {
        exists: true,
        data: () => ({
          ...mockUser,
          createdAt: { toDate: () => mockUser.createdAt },
          updatedAt: { toDate: () => mockUser.updatedAt },
        }),
      };

      mockFirestore.mockReturnValue({
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve(mockDoc),
          }),
        }),
      });

      const context = await getAuthContext();
      
      expect(context.isAuthenticated).toBe(true);
      expect(context.user).toBeTruthy();
      expect(context.isCreator).toBe(true);
      expect(context.isAdmin).toBe(false);
    });

    test('returns unauthenticated context for no session', async () => {
      mockGetServerSession.mockResolvedValue(null);
      
      const context = await getAuthContext();
      
      expect(context.isAuthenticated).toBe(false);
      expect(context.user).toBeNull();
      expect(context.isCreator).toBe(false);
      expect(context.isAdmin).toBe(false);
      expect(context.hasPermission('any.permission')).toBe(false);
    });
  });

  describe('requireAuth', () => {
    test('returns user for authenticated request', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'test-uid-123', email: 'test@example.com' },
      });

      const mockDoc = {
        exists: true,
        data: () => ({
          ...mockUser,
          createdAt: { toDate: () => mockUser.createdAt },
          updatedAt: { toDate: () => mockUser.updatedAt },
        }),
      };

      mockFirestore.mockReturnValue({
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve(mockDoc),
          }),
        }),
      });

      const user = await requireAuth();
      expect(user).toBeTruthy();
      expect(user.uid).toBe('test-uid-123');
    });

    test('throws error for unauthenticated request', async () => {
      mockGetServerSession.mockResolvedValue(null);
      
      await expect(requireAuth()).rejects.toThrow('Authentication required');
    });
  });

  describe('requireAdmin', () => {
    test('returns admin user for admin request', async () => {
      const adminUser = { ...mockUser, role: 'admin' as const };

      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-uid', email: 'admin@example.com' },
      });

      const mockDoc = {
        exists: true,
        data: () => ({
          ...adminUser,
          createdAt: { toDate: () => adminUser.createdAt },
          updatedAt: { toDate: () => adminUser.updatedAt },
        }),
      };

      mockFirestore.mockReturnValue({
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve(mockDoc),
          }),
        }),
      });

      const user = await requireAdmin();
      expect(user).toBeTruthy();
      expect(user.role).toBe('admin');
    });

    test('throws error for non-admin user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'test-uid-123', email: 'test@example.com' },
      });

      const mockDoc = {
        exists: true,
        data: () => ({
          ...mockUser,
          role: 'client',
          createdAt: { toDate: () => mockUser.createdAt },
          updatedAt: { toDate: () => mockUser.updatedAt },
        }),
      };

      mockFirestore.mockReturnValue({
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve(mockDoc),
          }),
        }),
      });

      await expect(requireAdmin()).rejects.toThrow('Admin access required');
    });
  });

  describe('requireCreator', () => {
    test('returns creator user for creator request', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'test-uid-123', email: 'test@example.com' },
      });

      const mockDoc = {
        exists: true,
        data: () => ({
          ...mockUser,
          role: 'creator',
          createdAt: { toDate: () => mockUser.createdAt },
          updatedAt: { toDate: () => mockUser.updatedAt },
        }),
      };

      mockFirestore.mockReturnValue({
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve(mockDoc),
          }),
        }),
      });

      const user = await requireCreator();
      expect(user).toBeTruthy();
      expect(user.role).toBe('creator');
    });

    test('throws error for non-creator user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'test-uid-123', email: 'test@example.com' },
      });

      const mockDoc = {
        exists: true,
        data: () => ({
          ...mockUser,
          role: 'client',
          createdAt: { toDate: () => mockUser.createdAt },
          updatedAt: { toDate: () => mockUser.updatedAt },
        }),
      };

      mockFirestore.mockReturnValue({
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve(mockDoc),
          }),
        }),
      });

      await expect(requireCreator()).rejects.toThrow('Creator access required');
    });
  });

  describe('hasPermission', () => {
    test('admin has all permissions', () => {
      const adminUser = { ...mockUser, role: 'admin' as const };
      
      expect(hasPermission(adminUser, 'user.ban')).toBe(true);
      expect(hasPermission(adminUser, 'service.create')).toBe(true);
      expect(hasPermission(adminUser, 'analytics.view')).toBe(true);
    });

    test('creator can create services', () => {
      const creatorUser = { ...mockUser, role: 'creator' as const };
      
      expect(hasPermission(creatorUser, 'service.create')).toBe(true);
      expect(hasPermission(creatorUser, 'service.edit')).toBe(true);
    });

    test('standard tier cannot provide services', () => {
      const standardCreator = { 
        ...mockUser, 
        role: 'creator' as const, 
        tier: 'standard' as const 
      };
      
      expect(hasPermission(standardCreator, 'service.create')).toBe(false);
    });

    test('client cannot create services', () => {
      const clientUser = { ...mockUser, role: 'client' as const };
      
      expect(hasPermission(clientUser, 'service.create')).toBe(false);
      expect(hasPermission(clientUser, 'booking.create')).toBe(true);
    });

    test('returns false for unknown permissions', () => {
      expect(hasPermission(mockUser, 'unknown.permission')).toBe(false);
    });
  });

  describe('isResourceOwner', () => {
    test('returns true for matching UIDs', () => {
      const user = { ...mockUser, uid: 'test-uid-123' };
      expect(isResourceOwner(user, 'test-uid-123')).toBe(true);
    });

    test('returns false for different UIDs', () => {
      const user = { ...mockUser, uid: 'test-uid-123' };
      expect(isResourceOwner(user, 'different-uid')).toBe(false);
    });
  });

  describe('authenticateRequest', () => {
    const mockRequest = {
      headers: {
        get: jest.fn(),
      },
    } as any;

    beforeEach(() => {
      mockRequest.headers.get.mockClear();
    });

    test('authenticates with valid session', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'test-uid-123', email: 'test@example.com' },
      });

      const mockDoc = {
        exists: true,
        data: () => ({
          ...mockUser,
          createdAt: { toDate: () => mockUser.createdAt },
          updatedAt: { toDate: () => mockUser.updatedAt },
        }),
      };

      mockFirestore.mockReturnValue({
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve(mockDoc),
          }),
        }),
      });

      const result = await authenticateRequest(mockRequest);
      
      expect(result.user).toBeTruthy();
      expect(result.error).toBeUndefined();
    });

    test('falls back to token authentication', async () => {
      // No session
      mockGetServerSession.mockResolvedValue(null);
      
      // Mock authorization header
      mockRequest.headers.get.mockReturnValue('Bearer valid-token');
      
      // Mock token verification
      mockAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid-123' }),
      });

      const mockDoc = {
        exists: true,
        data: () => ({
          ...mockUser,
          createdAt: { toDate: () => mockUser.createdAt },
          updatedAt: { toDate: () => mockUser.updatedAt },
        }),
      };

      mockFirestore.mockReturnValue({
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve(mockDoc),
          }),
        }),
      });

      const result = await authenticateRequest(mockRequest);
      
      expect(result.user).toBeTruthy();
      expect(result.error).toBeUndefined();
    });

    test('returns error for missing authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);
      mockRequest.headers.get.mockReturnValue(null);
      
      const result = await authenticateRequest(mockRequest);
      
      expect(result.user).toBeUndefined();
      expect(result.error).toEqual({
        message: 'Authentication required',
        status: 401,
      });
    });

    test('returns error for invalid token format', async () => {
      mockGetServerSession.mockResolvedValue(null);
      mockRequest.headers.get.mockReturnValue('Invalid token format');
      
      const result = await authenticateRequest(mockRequest);
      
      expect(result.user).toBeUndefined();
      expect(result.error).toEqual({
        message: 'Invalid authorization header format',
        status: 401,
      });
    });

    test('returns error for invalid token', async () => {
      mockGetServerSession.mockResolvedValue(null);
      mockRequest.headers.get.mockReturnValue('Bearer invalid-token');
      
      mockAuth.mockReturnValue({
        verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token')),
      });

      const result = await authenticateRequest(mockRequest);
      
      expect(result.user).toBeUndefined();
      expect(result.error).toEqual({
        message: 'Invalid or expired token',
        status: 401,
      });
    });
  });
});