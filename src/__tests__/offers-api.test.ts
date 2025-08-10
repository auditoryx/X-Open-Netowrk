import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

/**
 * Integration tests for the offers API endpoints
 * Tests the full CRUD lifecycle and validation
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Mock authenticated user for testing
const mockUser = {
  uid: 'test-user-123',
  roles: ['producer', 'engineer']
};

// Mock authentication token (in real tests, you'd use a proper test token)
const mockAuthToken = 'mock-auth-token';

describe('Offers API Integration Tests', () => {
  let createdOfferId: string;

  beforeAll(async () => {
    // Setup test environment
    console.log('Setting up offers API tests...');
  });

  afterAll(async () => {
    // Cleanup test data
    if (createdOfferId) {
      try {
        await fetch(`${API_BASE}/api/offers/${createdOfferId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${mockAuthToken}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.warn('Failed to cleanup test offer:', error);
      }
    }
  });

  describe('POST /api/offers', () => {
    it('should create a new producer offer', async () => {
      const offerData = {
        role: 'producer',
        title: 'Test Beat Pack',
        description: 'High-quality hip hop beats for testing purposes',
        price: 25,
        currency: 'USD',
        turnaroundDays: 1,
        revisions: 2,
        deliverables: ['MP3 320kbps', 'WAV stems', 'License agreement'],
        addons: [
          { name: 'Exclusive Rights', price: 500, description: 'Full ownership' }
        ],
        usagePolicy: 'Non-exclusive lease allows unlimited streaming',
        media: [],
        templateId: 'producer_beat_store',
        roleSpecific: {
          licenseOptions: ['Non-Exclusive', 'Exclusive'],
          bpm: 140,
          key: 'Am',
          tags: ['Hip Hop', 'Trap'],
          stemCount: 8
        }
      };

      const response = await fetch(`${API_BASE}/api/offers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(offerData)
      });

      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.offerId).toBeDefined();
      
      createdOfferId = result.offerId;
    });

    it('should reject offer with invalid role', async () => {
      const invalidOffer = {
        role: 'invalid-role',
        title: 'Test Offer',
        description: 'This should fail validation',
        price: 100,
        currency: 'USD',
        turnaroundDays: 3,
        revisions: 1,
        deliverables: ['Something']
      };

      const response = await fetch(`${API_BASE}/api/offers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidOffer)
      });

      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result.error).toBe('Validation failed');
    });

    it('should reject offer with missing required fields', async () => {
      const incompleteOffer = {
        role: 'engineer',
        title: 'Test Mix'
        // Missing required fields
      };

      const response = await fetch(`${API_BASE}/api/offers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(incompleteOffer)
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/offers', () => {
    it('should list offers with filters', async () => {
      const response = await fetch(`${API_BASE}/api/offers?role=producer&active=true&limit=10`);
      
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.offers).toBeDefined();
      expect(Array.isArray(result.offers)).toBe(true);
      expect(result.hasMore).toBeDefined();
      expect(result.total).toBeDefined();
    });

    it('should list user-specific offers', async () => {
      const response = await fetch(`${API_BASE}/api/offers?userId=${mockUser.uid}`);
      
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.offers).toBeDefined();
      result.offers.forEach((offer: any) => {
        expect(offer.userId).toBe(mockUser.uid);
      });
    });
  });

  describe('GET /api/offers/:id', () => {
    it('should get specific offer by ID', async () => {
      if (!createdOfferId) {
        // Skip if no offer was created in setup
        return;
      }

      const response = await fetch(`${API_BASE}/api/offers/${createdOfferId}`);
      
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.offer).toBeDefined();
      expect(result.offer.id).toBe(createdOfferId);
    });

    it('should return 404 for non-existent offer', async () => {
      const response = await fetch(`${API_BASE}/api/offers/non-existent-id`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/offers/:id', () => {
    it('should update offer fields', async () => {
      if (!createdOfferId) return;

      const updateData = {
        title: 'Updated Test Beat Pack',
        price: 30,
        description: 'Updated description for testing'
      };

      const response = await fetch(`${API_BASE}/api/offers/${createdOfferId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.success).toBe(true);
    });

    it('should reject unauthorized updates', async () => {
      if (!createdOfferId) return;

      const response = await fetch(`${API_BASE}/api/offers/${createdOfferId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
          // No authorization header
        },
        body: JSON.stringify({ title: 'Unauthorized Update' })
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/offers/:id/publish', () => {
    it('should toggle offer active status', async () => {
      if (!createdOfferId) return;

      const response = await fetch(`${API_BASE}/api/offers/${createdOfferId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.active).toBeDefined();
    });
  });

  describe('Offer Limits', () => {
    it('should enforce maximum active offers limit', async () => {
      // This test would need to create multiple offers to hit the limit
      // Skipping for now as it would require more complex setup
      console.log('⚠️  Offer limits test requires extensive setup - implement in full test suite');
    });
  });

  describe('Role-specific Validation', () => {
    it('should validate producer-specific fields', async () => {
      const producerOffer = {
        role: 'producer',
        title: 'Test Producer Validation',
        description: 'Testing producer-specific field validation',
        price: 50,
        currency: 'USD',
        turnaroundDays: 2,
        revisions: 1,
        deliverables: ['Beat', 'Stems'],
        roleSpecific: {
          bpm: 999 // Invalid BPM (should be 60-200)
        }
      };

      const response = await fetch(`${API_BASE}/api/offers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(producerOffer)
      });

      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result.error).toContain('Role validation failed');
    });

    it('should validate engineer-specific fields', async () => {
      const engineerOffer = {
        role: 'engineer',
        title: 'Test Engineer Validation',
        description: 'Testing engineer-specific field validation',
        price: 100,
        currency: 'USD',
        turnaroundDays: 5,
        revisions: 2,
        deliverables: ['Mixed track'],
        roleSpecific: {
          service: 'InvalidService' // Should be one of: Mix, Master, Tuning, Bundle, Atmos
        }
      };

      const response = await fetch(`${API_BASE}/api/offers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(engineerOffer)
      });

      expect(response.status).toBe(400);
    });
  });
});

// Export for use in other test files
export { mockUser, mockAuthToken };