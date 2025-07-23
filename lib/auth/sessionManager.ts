import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, deleteDoc, updateDoc, serverTimestamp, query, where, collection, getDocs } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

interface SessionInfo {
  userId: string;
  sessionToken: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

class SessionManager {
  private auth = getAuth(app);
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly WARNING_TIME = 15 * 60 * 1000; // 15 minutes before expiry

  constructor() {
    this.init();
  }

  private init() {
    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.createSession(user.uid);
        this.startSessionMonitoring();
      } else {
        this.clearSession();
        this.stopSessionMonitoring();
      }
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.auth.currentUser) {
        this.updateActivity();
      }
    });

    // Handle before unload
    window.addEventListener('beforeunload', () => {
      this.updateActivity();
    });
  }

  /**
   * Create a new session for the user
   */
  private async createSession(userId: string): Promise<void> {
    try {
      const sessionToken = this.generateSessionToken();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.SESSION_DURATION);

      const sessionInfo: Partial<SessionInfo> = {
        userId,
        sessionToken,
        createdAt: now,
        expiresAt,
        lastActivity: now,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        deviceInfo: this.getDeviceInfo()
      };

      // Store session in Firestore
      await setDoc(doc(db, 'userSessions', sessionToken), {
        ...sessionInfo,
        createdAt: serverTimestamp(),
        expiresAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      // Store session token in localStorage
      localStorage.setItem('sessionToken', sessionToken);
      localStorage.setItem('sessionExpiry', expiresAt.toISOString());

      logger.info('Session created successfully', { userId, sessionToken: sessionToken.substring(0, 8) + '...' });
    } catch (error) {
      logger.error('Failed to create session:', error);
    }
  }

  /**
   * Update user activity timestamp
   */
  private async updateActivity(): Promise<void> {
    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken || !this.auth.currentUser) return;

    try {
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION);
      
      await updateDoc(doc(db, 'userSessions', sessionToken), {
        lastActivity: serverTimestamp(),
        expiresAt: serverTimestamp()
      });

      localStorage.setItem('sessionExpiry', expiresAt.toISOString());
    } catch (error) {
      logger.error('Failed to update activity:', error);
    }
  }

  /**
   * Check if session is valid and not expired
   */
  private isSessionValid(): boolean {
    const sessionToken = localStorage.getItem('sessionToken');
    const sessionExpiry = localStorage.getItem('sessionExpiry');

    if (!sessionToken || !sessionExpiry) return false;

    const expiryDate = new Date(sessionExpiry);
    return expiryDate > new Date();
  }

  /**
   * Start monitoring session for expiry
   */
  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) return;

    this.sessionCheckInterval = setInterval(() => {
      this.checkSessionExpiry();
    }, 60000); // Check every minute
  }

  /**
   * Stop session monitoring
   */
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Check for session expiry and warn user
   */
  private checkSessionExpiry(): void {
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    if (!sessionExpiry) return;

    const expiryDate = new Date(sessionExpiry);
    const now = new Date();
    const timeUntilExpiry = expiryDate.getTime() - now.getTime();

    if (timeUntilExpiry <= 0) {
      // Session expired
      this.handleSessionExpiry();
    } else if (timeUntilExpiry <= this.WARNING_TIME) {
      // Session expiring soon
      this.showExpiryWarning(Math.ceil(timeUntilExpiry / 60000)); // minutes
    }
  }

  /**
   * Handle session expiry
   */
  private async handleSessionExpiry(): Promise<void> {
    try {
      await this.clearSession();
      await signOut(this.auth);
      
      // Show user-friendly message
      this.showSessionExpiredMessage();
      
      // Redirect to login
      window.location.href = '/login?reason=session_expired';
    } catch (error) {
      logger.error('Failed to handle session expiry:', error);
    }
  }

  /**
   * Show warning about upcoming session expiry
   */
  private showExpiryWarning(minutesLeft: number): void {
    // Create or update warning notification
    const existingWarning = document.getElementById('session-warning');
    if (existingWarning) return; // Don't show multiple warnings

    const warning = document.createElement('div');
    warning.id = 'session-warning';
    warning.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50';
    warning.innerHTML = `
      <div class="flex items-center">
        <div class="flex-1">
          <p class="font-medium">Session Expiring</p>
          <p class="text-sm">Your session will expire in ${minutesLeft} minutes. Click to extend.</p>
        </div>
        <button class="ml-4 bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600" onclick="sessionManager.extendSession()">
          Extend
        </button>
        <button class="ml-2 text-yellow-700 hover:text-yellow-900" onclick="this.parentElement.parentElement.remove()">
          ×
        </button>
      </div>
    `;

    document.body.appendChild(warning);

    // Auto-remove warning after 30 seconds if not interacted with
    setTimeout(() => {
      if (document.getElementById('session-warning')) {
        warning.remove();
      }
    }, 30000);
  }

  /**
   * Show session expired message
   */
  private showSessionExpiredMessage(): void {
    const message = document.createElement('div');
    message.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    message.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Session Expired</h3>
          <p class="text-gray-600 mb-4">Your session has expired for security reasons. Please log in again to continue.</p>
          <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="window.location.href='/login'">
            Log In Again
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(message);
  }

  /**
   * Extend current session
   */
  public async extendSession(): Promise<void> {
    try {
      await this.updateActivity();
      
      // Remove warning if it exists
      const warning = document.getElementById('session-warning');
      if (warning) warning.remove();
      
      // Show success message
      this.showToast('Session extended successfully', 'success');
    } catch (error) {
      logger.error('Failed to extend session:', error);
      this.showToast('Failed to extend session', 'error');
    }
  }

  /**
   * Clear current session
   */
  private async clearSession(): Promise<void> {
    const sessionToken = localStorage.getItem('sessionToken');
    
    if (sessionToken) {
      try {
        await deleteDoc(doc(db, 'userSessions', sessionToken));
      } catch (error) {
        logger.error('Failed to clear session from database:', error);
      }
    }

    localStorage.removeItem('sessionToken');
    localStorage.removeItem('sessionExpiry');
  }

  /**
   * Clear all sessions for a user (useful for "log out from all devices")
   */
  public async clearAllSessions(userId: string): Promise<void> {
    try {
      const sessionsQuery = query(
        collection(db, 'userSessions'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(sessionsQuery);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
      
      logger.info('All sessions cleared for user', { userId });
    } catch (error) {
      logger.error('Failed to clear all sessions:', error);
      throw error;
    }
  }

  /**
   * Get client IP address (approximate)
   */
  private async getClientIP(): Promise<string> {
    try {
      // In a real application, you'd get this from your backend
      // This is a simplified approach
      return 'client-ip'; // Placeholder
    } catch {
      return 'unknown';
    }
  }

  /**
   * Generate secure session token
   */
  private generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): SessionInfo['deviceInfo'] {
    const userAgent = navigator.userAgent;
    
    return {
      browser: this.getBrowser(userAgent),
      os: this.getOS(userAgent),
      device: this.getDevice(userAgent)
    };
  }

  private getBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getDevice(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Get session status
   */
  public getSessionStatus(): {
    isValid: boolean;
    expiresAt: Date | null;
    timeUntilExpiry: number | null;
  } {
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (!sessionExpiry) {
      return { isValid: false, expiresAt: null, timeUntilExpiry: null };
    }

    const expiresAt = new Date(sessionExpiry);
    const timeUntilExpiry = expiresAt.getTime() - Date.now();
    
    return {
      isValid: timeUntilExpiry > 0,
      expiresAt,
      timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : null
    };
  }
}

// Create global instance
export const sessionManager = new SessionManager();

// Make it available globally for button clicks
declare global {
  interface Window {
    sessionManager: SessionManager;
  }
}

if (typeof window !== 'undefined') {
  window.sessionManager = sessionManager;
}