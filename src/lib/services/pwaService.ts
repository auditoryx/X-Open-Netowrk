/**
 * Progressive Web App Service
 * Implements offline functionality, push notifications, and enhanced mobile experience
 */

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface OfflineData {
  creators: any[];
  bookings: any[];
  messages: any[];
  userPreferences: any;
  lastSync: Date;
}

export class PWAService {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    this.init();
  }

  /**
   * Initialize PWA service
   */
  private async init() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as any;
      this.dispatchInstallPromptEvent();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.trackEvent('pwa_installed');
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOnlineStatusChange(false);
    });

    // Register service worker
    await this.registerServiceWorker();
  }

  /**
   * Register service worker for offline functionality
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = registration;

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailableNotification();
              }
            });
          }
        });

        console.log('Service Worker registered successfully');
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Check if app can be installed
   */
  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  /**
   * Prompt user to install app
   */
  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      this.deferredPrompt = null;
      this.trackEvent('pwa_install_prompt', { outcome });
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Failed to install app:', error);
      return false;
    }
  }

  /**
   * Check if app is installed
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Enable offline mode with data caching
   */
  async enableOfflineMode(): Promise<void> {
    if (!this.swRegistration) {
      console.warn('Service Worker not registered, cannot enable offline mode');
      return;
    }

    try {
      // Cache essential data
      await this.cacheEssentialData();
      
      // Setup background sync
      await this.setupBackgroundSync();
      
      console.log('Offline mode enabled');
      this.trackEvent('offline_mode_enabled');
    } catch (error) {
      console.error('Failed to enable offline mode:', error);
    }
  }

  /**
   * Cache essential data for offline use
   */
  private async cacheEssentialData(): Promise<void> {
    const cache = await caches.open('auditoryx-offline-v1');
    
    // Cache essential API responses
    const essentialRequests = [
      '/api/creators/popular',
      '/api/user/preferences',
      '/api/user/bookings',
      '/api/user/messages'
    ];

    await Promise.all(
      essentialRequests.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response.clone());
          }
        } catch (error) {
          console.warn(`Failed to cache ${url}:`, error);
        }
      })
    );

    // Cache user-specific offline data
    const offlineData = await this.getOfflineData();
    await this.saveOfflineData(offlineData);
  }

  /**
   * Setup background sync for offline actions
   */
  private async setupBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  /**
   * Request notification permission and setup push notifications
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      await this.setupPushNotifications();
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.setupPushNotifications();
      }
      this.trackEvent('notification_permission_requested', { permission });
      return permission;
    }

    return 'denied';
  }

  /**
   * Setup push notifications
   */
  private async setupPushNotifications(): Promise<void> {
    if (!this.swRegistration) {
      console.warn('Service Worker not registered, cannot setup push notifications');
      return;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      console.log('Push notifications setup complete');
      this.trackEvent('push_notifications_enabled');
    } catch (error) {
      console.error('Failed to setup push notifications:', error);
    }
  }

  /**
   * Send local notification
   */
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if (this.swRegistration) {
      await this.swRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192.png',
        badge: payload.badge || '/icons/badge-72.png',
        data: payload.data,
        actions: payload.actions,
        tag: 'auditoryx-notification',
        requireInteraction: true
      });
    } else {
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192.png'
      });
    }
  }

  /**
   * Handle online status changes
   */
  private async handleOnlineStatusChange(isOnline: boolean): Promise<void> {
    if (isOnline) {
      // Sync offline data when back online
      await this.syncOfflineData();
      this.dispatchEvent('online');
    } else {
      // Prepare for offline mode
      await this.enableOfflineMode();
      this.dispatchEvent('offline');
    }
  }

  /**
   * Sync offline data when back online
   */
  private async syncOfflineData(): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();
      
      if (!offlineData) return;

      // Sync offline bookings
      if (offlineData.bookings?.length > 0) {
        await this.syncOfflineBookings(offlineData.bookings);
      }

      // Sync offline messages
      if (offlineData.messages?.length > 0) {
        await this.syncOfflineMessages(offlineData.messages);
      }

      // Clear synced offline data
      await this.clearOfflineData();
      
      console.log('Offline data synced successfully');
      this.trackEvent('offline_data_synced');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  /**
   * Save draft booking for offline mode
   */
  async saveDraftBooking(bookingData: any): Promise<void> {
    const offlineData = await this.getOfflineData() || { bookings: [], messages: [], creators: [], userPreferences: {}, lastSync: new Date() };
    
    const draftBooking = {
      ...bookingData,
      id: `offline_${Date.now()}`,
      isOffline: true,
      createdAt: new Date().toISOString()
    };

    offlineData.bookings.push(draftBooking);
    await this.saveOfflineData(offlineData);
    
    this.showNotification({
      title: 'Booking Saved Offline',
      body: 'Your booking will be submitted when you\'re back online.',
      icon: '/icons/booking-icon.png'
    });
  }

  /**
   * Save draft message for offline mode
   */
  async saveDraftMessage(messageData: any): Promise<void> {
    const offlineData = await this.getOfflineData() || { bookings: [], messages: [], creators: [], userPreferences: {}, lastSync: new Date() };
    
    const draftMessage = {
      ...messageData,
      id: `offline_${Date.now()}`,
      isOffline: true,
      createdAt: new Date().toISOString()
    };

    offlineData.messages.push(draftMessage);
    await this.saveOfflineData(offlineData);
    
    this.showNotification({
      title: 'Message Saved Offline',
      body: 'Your message will be sent when you\'re back online.',
      icon: '/icons/message-icon.png'
    });
  }

  /**
   * Get offline cached data
   */
  private async getOfflineData(): Promise<OfflineData | null> {
    try {
      const data = localStorage.getItem('auditoryx-offline-data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  /**
   * Save offline data
   */
  private async saveOfflineData(data: OfflineData): Promise<void> {
    try {
      localStorage.setItem('auditoryx-offline-data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  /**
   * Clear offline data after sync
   */
  private async clearOfflineData(): Promise<void> {
    try {
      localStorage.removeItem('auditoryx-offline-data');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  /**
   * Sync offline bookings
   */
  private async syncOfflineBookings(bookings: any[]): Promise<void> {
    for (const booking of bookings) {
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking)
        });

        if (response.ok) {
          console.log('Offline booking synced:', booking.id);
        }
      } catch (error) {
        console.error('Failed to sync booking:', booking.id, error);
      }
    }
  }

  /**
   * Sync offline messages
   */
  private async syncOfflineMessages(messages: any[]): Promise<void> {
    for (const message of messages) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });

        if (response.ok) {
          console.log('Offline message synced:', message.id);
        }
      } catch (error) {
        console.error('Failed to sync message:', message.id, error);
      }
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  /**
   * Convert VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Show update available notification
   */
  private showUpdateAvailableNotification(): void {
    this.showNotification({
      title: 'App Update Available',
      body: 'A new version of AuditoryX is available. Refresh to update.',
      actions: [
        { action: 'update', title: 'Update Now' },
        { action: 'dismiss', title: 'Later' }
      ]
    });
  }

  /**
   * Dispatch custom events
   */
  private dispatchEvent(eventName: string, data?: any): void {
    window.dispatchEvent(new CustomEvent(`pwa-${eventName}`, { detail: data }));
  }

  /**
   * Dispatch install prompt event
   */
  private dispatchInstallPromptEvent(): void {
    this.dispatchEvent('install-prompt-available');
  }

  /**
   * Track PWA events
   */
  private trackEvent(eventName: string, properties?: any): void {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        event_category: 'PWA',
        ...properties
      });
    }
  }

  /**
   * Get app installation status
   */
  getInstallationStatus(): {
    isInstalled: boolean;
    canInstall: boolean;
    isOnline: boolean;
    hasNotificationPermission: boolean;
  } {
    return {
      isInstalled: this.isInstalled(),
      canInstall: this.canInstall(),
      isOnline: this.isOnline,
      hasNotificationPermission: Notification.permission === 'granted'
    };
  }

  /**
   * Force update service worker
   */
  async updateApp(): Promise<void> {
    if (this.swRegistration) {
      await this.swRegistration.update();
      window.location.reload();
    }
  }
}

// Singleton instance
export const pwaService = new PWAService();
