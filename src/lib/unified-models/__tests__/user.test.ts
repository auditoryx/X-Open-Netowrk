import { 
  UnifiedUserSchema, 
  CreateUserSchema, 
  UpdateUserSchema,
  validateUnifiedUser, 
  validateCreateUser,
  validateUpdateUser,
  toPublicUser,
  toPrivateUser,
  isAdmin,
  isCreator,
  isVerified,
  canProvideServices,
  getDisplayName 
} from '../user';

describe('UnifiedUserSchema', () => {
  const validUser = {
    uid: 'test-uid-123',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'client' as const,
    tier: 'standard' as const,
    verificationStatus: 'unverified' as const,
    xp: 0,
    rankScore: 0,
    reviewCount: 0,
    emailVerified: false,
    paymentMethodsSetup: false,
    isActive: true,
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    profileVisibility: 'public' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('schema validation', () => {
    test('validates correct user data', () => {
      expect(() => validateUnifiedUser(validUser)).not.toThrow();
    });

    test('requires uid', () => {
      const { uid, ...userWithoutUid } = validUser;
      expect(() => validateUnifiedUser(userWithoutUid)).toThrow();
    });

    test('requires valid email', () => {
      const userWithInvalidEmail = { ...validUser, email: 'invalid-email' };
      expect(() => validateUnifiedUser(userWithInvalidEmail)).toThrow();
    });

    test('validates role enum', () => {
      const userWithInvalidRole = { ...validUser, role: 'invalid-role' };
      expect(() => validateUnifiedUser(userWithInvalidRole)).toThrow();
    });

    test('validates tier enum', () => {
      const userWithInvalidTier = { ...validUser, tier: 'invalid-tier' };
      expect(() => validateUnifiedUser(userWithInvalidTier)).toThrow();
    });

    test('validates verificationStatus enum', () => {
      const userWithInvalidStatus = { ...validUser, verificationStatus: 'invalid-status' };
      expect(() => validateUnifiedUser(userWithInvalidStatus)).toThrow();
    });

    test('validates XP is non-negative', () => {
      const userWithNegativeXP = { ...validUser, xp: -10 };
      expect(() => validateUnifiedUser(userWithNegativeXP)).toThrow();
    });

    test('validates rating range', () => {
      const userWithInvalidRating = { ...validUser, averageRating: 6 };
      expect(() => validateUnifiedUser(userWithInvalidRating)).toThrow();
    });

    test('accepts optional fields', () => {
      const minimalUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        role: 'client' as const,
        tier: 'standard' as const,
        verificationStatus: 'unverified' as const,
        xp: 0,
        rankScore: 0,
        reviewCount: 0,
        emailVerified: false,
        paymentMethodsSetup: false,
        isActive: true,
        notifications: { email: true, push: true, sms: false },
        profileVisibility: 'public' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      expect(() => validateUnifiedUser(minimalUser)).not.toThrow();
    });
  });

  describe('CreateUserSchema', () => {
    test('validates correct create data', () => {
      const createData = {
        email: 'new@example.com',
        displayName: 'New User',
        role: 'creator' as const,
        bio: 'Test bio',
      };
      
      expect(() => validateCreateUser(createData)).not.toThrow();
    });

    test('requires email and displayName', () => {
      const incompleteData = { role: 'client' as const };
      expect(() => validateCreateUser(incompleteData)).toThrow();
    });

    test('defaults role to client', () => {
      const createData = {
        email: 'new@example.com',
        displayName: 'New User',
      };
      
      const result = validateCreateUser(createData);
      expect(result.role).toBe('client');
    });
  });

  describe('UpdateUserSchema', () => {
    test('allows partial updates', () => {
      const updateData = {
        displayName: 'Updated Name',
        bio: 'Updated bio',
      };
      
      expect(() => validateUpdateUser(updateData)).not.toThrow();
    });

    test('prevents updating uid', () => {
      // UpdateUserSchema should omit uid, so this should not be allowed
      const updateData = {
        displayName: 'Updated Name',
      };
      
      // This should pass since we're not trying to update uid
      expect(() => validateUpdateUser(updateData)).not.toThrow();
      
      // But the schema should not allow uid field
      const schemaKeys = Object.keys(UpdateUserSchema.shape);
      expect(schemaKeys).not.toContain('uid');
    });

    test('prevents updating email', () => {
      // UpdateUserSchema should omit email, so this should not be allowed
      const updateData = {
        displayName: 'Updated Name',
      };
      
      // This should pass since we're not trying to update email
      expect(() => validateUpdateUser(updateData)).not.toThrow();
      
      // But the schema should not allow email field
      const schemaKeys = Object.keys(UpdateUserSchema.shape);
      expect(schemaKeys).not.toContain('email');
    });
  });
});

describe('User transformation utilities', () => {
  const fullUser = {
    uid: 'test-uid-123',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'creator' as const,
    tier: 'verified' as const,
    verificationStatus: 'verified' as const,
    xp: 1500,
    rankScore: 850,
    reviewCount: 42,
    averageRating: 4.8,
    emailVerified: true,
    paymentMethodsSetup: true,
    walletId: 'stripe-cust-123',
    bio: 'Professional creator',
    location: 'New York, NY',
    website: 'https://example.com',
    profilePicture: 'https://example.com/pic.jpg',
    isActive: true,
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    profileVisibility: 'public' as const,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('toPublicUser', () => {
    test('returns only public fields', () => {
      const publicUser = toPublicUser(fullUser);
      
      expect(publicUser).toHaveProperty('uid');
      expect(publicUser).toHaveProperty('displayName');
      expect(publicUser).toHaveProperty('role');
      expect(publicUser).toHaveProperty('tier');
      expect(publicUser).toHaveProperty('verificationStatus');
      expect(publicUser).toHaveProperty('averageRating');
      expect(publicUser).toHaveProperty('reviewCount');
      expect(publicUser).toHaveProperty('bio');
      expect(publicUser).toHaveProperty('profilePicture');
      
      // Should not have sensitive fields
      expect(publicUser).not.toHaveProperty('email');
      expect(publicUser).not.toHaveProperty('walletId');
      expect(publicUser).not.toHaveProperty('paymentMethodsSetup');
      expect(publicUser).not.toHaveProperty('notifications');
    });
  });

  describe('toPrivateUser', () => {
    test('returns user data without sensitive financial info', () => {
      const privateUser = toPrivateUser(fullUser);
      
      expect(privateUser).toHaveProperty('email');
      expect(privateUser).toHaveProperty('notifications');
      expect(privateUser).toHaveProperty('profileVisibility');
      
      // Should not have financial fields
      expect(privateUser).not.toHaveProperty('walletId');
      expect(privateUser).not.toHaveProperty('paymentMethodsSetup');
    });
  });
});

describe('User role utilities', () => {
  test('isAdmin correctly identifies admin users', () => {
    const adminUser = { ...validUser, role: 'admin' as const };
    const clientUser = { ...validUser, role: 'client' as const };
    
    expect(isAdmin(adminUser)).toBe(true);
    expect(isAdmin(clientUser)).toBe(false);
  });

  test('isCreator identifies creator roles', () => {
    const creatorRoles = ['creator', 'artist', 'producer', 'engineer', 'studio', 'videographer'] as const;
    
    creatorRoles.forEach(role => {
      const user = { ...validUser, role };
      expect(isCreator(user)).toBe(true);
    });
    
    const clientUser = { ...validUser, role: 'client' as const };
    expect(isCreator(clientUser)).toBe(false);
  });

  test('isVerified checks verification status', () => {
    const verifiedUser = { ...validUser, verificationStatus: 'verified' as const };
    const unverifiedUser = { ...validUser, verificationStatus: 'unverified' as const };
    
    expect(isVerified(verifiedUser)).toBe(true);
    expect(isVerified(unverifiedUser)).toBe(false);
  });

  test('canProvideServices requires creator role and non-standard tier', () => {
    const verifiedCreator = {
      ...validUser,
      role: 'creator' as const,
      tier: 'verified' as const,
    };
    
    const standardCreator = {
      ...validUser,
      role: 'creator' as const,
      tier: 'standard' as const,
    };
    
    const verifiedClient = {
      ...validUser,
      role: 'client' as const,
      tier: 'verified' as const,
    };
    
    expect(canProvideServices(verifiedCreator)).toBe(true);
    expect(canProvideServices(standardCreator)).toBe(false);
    expect(canProvideServices(verifiedClient)).toBe(false);
  });

  test('getDisplayName returns appropriate display name', () => {
    const userWithDisplayName = {
      ...validUser,
      displayName: 'Display Name',
      name: 'Regular Name',
    };
    
    const userWithName = {
      ...validUser,
      displayName: null,
      name: 'Regular Name',
    };
    
    const userWithOnlyEmail = {
      ...validUser,
      displayName: null,
      name: undefined,
      email: 'test@example.com',
    };
    
    expect(getDisplayName(userWithDisplayName)).toBe('Display Name');
    expect(getDisplayName(userWithName)).toBe('Regular Name');
    expect(getDisplayName(userWithOnlyEmail)).toBe('test');
  });
});

describe('User validation edge cases', () => {
  test('handles user with all optional fields', () => {
    const userWithOptionals = {
      ...validUser,
      name: 'Legacy Name',
      bio: 'User bio',
      location: 'City, State',
      website: 'https://example.com',
      socialLinks: {
        twitter: 'https://twitter.com/user',
        linkedin: 'https://linkedin.com/in/user',
      },
      profilePicture: 'https://example.com/pic.jpg',
      lastSignIn: new Date(),
      verificationDocuments: ['doc1', 'doc2'],
      verifiedAt: new Date(),
      walletId: 'stripe-123',
      migratedFrom: 'firestore' as const,
      migrationVersion: '1.0.0',
      migratedAt: new Date(),
    };
    
    expect(() => validateUnifiedUser(userWithOptionals)).not.toThrow();
  });

  test('validates URL fields correctly', () => {
    const userWithInvalidWebsite = {
      ...validUser,
      website: 'not-a-url',
    };
    
    expect(() => validateUnifiedUser(userWithInvalidWebsite)).toThrow();
    
    const userWithValidWebsite = {
      ...validUser,
      website: 'https://example.com',
    };
    
    expect(() => validateUnifiedUser(userWithValidWebsite)).not.toThrow();
  });

  test('validates social links as URLs', () => {
    const userWithInvalidSocialLinks = {
      ...validUser,
      socialLinks: {
        twitter: 'not-a-url',
      },
    };
    
    expect(() => validateUnifiedUser(userWithInvalidSocialLinks)).toThrow();
  });

  test('validates bio length limit', () => {
    const userWithLongBio = {
      ...validUser,
      bio: 'x'.repeat(1001), // Exceeds 1000 character limit
    };
    
    expect(() => validateUnifiedUser(userWithLongBio)).toThrow();
  });

  test('validates notification settings structure', () => {
    const userWithInvalidNotifications = {
      ...validUser,
      notifications: {
        email: 'yes', // Should be boolean
        push: true,
        sms: false,
      },
    };
    
    expect(() => validateUnifiedUser(userWithInvalidNotifications)).toThrow();
  });
});