import { Page, expect } from '@playwright/test';
import { getFirestore, doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

export interface TestUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'client' | 'provider' | 'admin' | 'producer' | 'artist' | 'engineer' | 'videographer' | 'studio';
  verified?: boolean;
  approved?: boolean;
}

export interface TestBooking {
  id: string;
  clientId: string;
  providerId: string;
  serviceName: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  startTime: string;
  location: string;
}

export interface TestService {
  id: string;
  providerId: string;
  title: string;
  description: string;
  price: number;
  type: 'studio' | 'mixing' | 'mastering' | 'production';
  location: string;
}

/**
 * Authentication utilities
 */
export class AuthUtils {
  constructor(private page: Page) {}

  async signIn(email: string, password: string = 'testpass123') {
    await this.page.goto('/auth');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('**/dashboard*', { timeout: 15000 });
  }

  async signOut() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="signout-button"]');
    await this.page.waitForURL('/');
  }

  async waitForAuth() {
    await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
  }

  async signUp(email: string, password: string = 'testpass123') {
    await this.page.goto('/signup');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('**/dashboard*', { timeout: 15000 });
  }
}

/**
 * Firestore test data utilities
 */
export class FirestoreUtils {
  private db: any;

  constructor() {
    // Initialize Firestore connection for test data setup
    if (typeof window === 'undefined') {
      try {
        const admin = require('firebase-admin');
        if (!admin.apps.length) {
          admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || 'test-project'
          });
        }
        this.db = admin.firestore();
      } catch (error) {
        console.warn('Firebase admin not available, skipping Firestore setup:', error.message);
        this.db = null;
      }
    }
  }

  async createTestUser(user: TestUser): Promise<void> {
    if (!this.db) {
      console.warn('Firestore not available, skipping user creation');
      return;
    }
    await this.db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      verified: user.verified ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async createTestService(service: TestService): Promise<void> {
    if (!this.db) {
      console.warn('Firestore not available, skipping service creation');
      return;
    }
    await this.db.collection('services').doc(service.id).set({
      providerId: service.providerId,
      title: service.title,
      description: service.description,
      price: service.price,
      type: service.type,
      location: service.location,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async createTestBooking(booking: TestBooking): Promise<void> {
    if (!this.db) {
      console.warn('Firestore not available, skipping booking creation');
      return;
    }
    await this.db.collection('bookings').doc(booking.id).set({
      clientId: booking.clientId,
      providerId: booking.providerId,
      serviceName: booking.serviceName,
      totalAmount: booking.totalAmount,
      status: booking.status,
      date: booking.date,
      startTime: booking.startTime,
      location: booking.location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async cleanupTestData(): Promise<void> {
    if (!this.db) {
      console.warn('Firestore not available, skipping cleanup');
      return;
    }
    try {
      // Clean up test collections
      const collections = ['users', 'bookings', 'services', 'reviews'];
      
      for (const collectionName of collections) {
        const snapshot = await this.db.collection(collectionName).get();
        const batch = this.db.batch();
        
        snapshot.docs.forEach((doc: any) => {
          if (doc.id.startsWith('test-') || doc.data().email?.includes('test-')) {
            batch.delete(doc.ref);
          }
        });
        
        await batch.commit();
      }
    } catch (error) {
      console.warn('Failed to cleanup test data:', error);
    }
  }
}

/**
 * UI interaction utilities
 */
export class UIUtils {
  constructor(private page: Page) {}

  async fillBookingForm(booking: Partial<TestBooking>) {
    if (booking.date) {
      await this.page.fill('[data-testid="booking-date"]', booking.date);
    }
    if (booking.startTime) {
      await this.page.fill('[data-testid="booking-time"]', booking.startTime);
    }
    if (booking.location) {
      await this.page.fill('[data-testid="booking-location"]', booking.location);
    }
  }

  async submitReview(rating: number, comment: string) {
    // Click stars for rating
    for (let i = 1; i <= rating; i++) {
      await this.page.click(`[data-testid="star-${i}"]`);
    }
    
    // Fill comment
    await this.page.fill('[data-testid="review-comment"]', comment);
    
    // Submit
    await this.page.click('[data-testid="submit-review"]');
  }

  async waitForToast(message?: string) {
    await this.page.waitForSelector('[data-testid="toast"]', { timeout: 5000 });
    if (message) {
      await expect(this.page.locator('[data-testid="toast"]')).toContainText(message);
    }
  }

  async dismissToast() {
    const toast = this.page.locator('[data-testid="toast"]');
    if (await toast.isVisible()) {
      await this.page.click('[data-testid="toast-close"]');
    }
  }
}

/**
 * Stripe mock utilities
 */
export class StripeUtils {
  constructor(private page: Page) {}

  async fillTestCard() {
    // Switch to Stripe iframe
    const stripeFrame = this.page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    
    await stripeFrame.locator('[placeholder="Card number"]').fill('4242424242424242');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('12/34');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    await stripeFrame.locator('[placeholder="ZIP"]').fill('12345');
  }

  async completePayment() {
    await this.fillTestCard();
    await this.page.click('[data-testid="complete-payment"]');
    await this.page.waitForURL('**/success**', { timeout: 30000 });
  }
}

/**
 * Test data factory
 */
export class TestDataFactory {
  static createTestUser(overrides: Partial<TestUser> = {}): TestUser {
    return {
      uid: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: `test-${Date.now()}@example.com`,
      displayName: 'Test User',
      role: 'client',
      verified: true,
      ...overrides
    };
  }

  static createTestProvider(overrides: Partial<TestUser> = {}): TestUser {
    return this.createTestUser({
      role: 'provider',
      displayName: 'Test Provider',
      ...overrides
    });
  }

  static createTestAdmin(overrides: Partial<TestUser> = {}): TestUser {
    return this.createTestUser({
      role: 'admin',
      displayName: 'Test Admin',
      ...overrides
    });
  }

  static createTestService(providerId: string, overrides: Partial<TestService> = {}): TestService {
    return {
      id: `test-service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      providerId,
      title: 'Test Music Production',
      description: 'Professional music production service for testing',
      price: 15000,
      type: 'production',
      location: 'Test Studio, Tokyo',
      ...overrides
    };
  }

  static createTestBooking(clientId: string, providerId: string, overrides: Partial<TestBooking> = {}): TestBooking {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      id: `test-booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      providerId,
      serviceName: 'Test Music Production',
      totalAmount: 15000,
      status: 'pending',
      date: tomorrow.toISOString().split('T')[0],
      startTime: '14:00',
      location: 'Test Studio, Tokyo',
      ...overrides
    };
  }
}
