/**
 * Cookie Consent Banner
 * 
 * GDPR/CCPA compliant cookie consent management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AccessibleButton } from '@/components/ui/accessible/AccessibleButton';
import { useLiveRegion } from '@/lib/accessibility/screen-reader';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true, // Always required
  analytics: false,
  marketing: false,
  preferences: false,
};

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const { announce } = useLiveRegion();

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
        applyCookieSettings(savedPreferences);
      } catch (error) {
        // If parsing fails, show banner again
        setIsVisible(true);
      }
    }
  }, []);

  const applyCookieSettings = (settings: CookiePreferences) => {
    // Apply cookie settings to tracking scripts
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (settings.analytics) {
        // Enable GA
        window.gtag?.('consent', 'update', {
          analytics_storage: 'granted'
        });
      } else {
        // Disable GA
        window.gtag?.('consent', 'update', {
          analytics_storage: 'denied'
        });
      }

      // Marketing cookies
      if (settings.marketing) {
        window.gtag?.('consent', 'update', {
          ad_storage: 'granted'
        });
      } else {
        window.gtag?.('consent', 'update', {
          ad_storage: 'denied'
        });
      }

      // Preferences cookies (already handled by essential cookies)
      if (!settings.preferences) {
        // Clear non-essential preference cookies
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.startsWith('pref_') || name.startsWith('ui_')) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          }
        });
      }
    }
  };

  const saveConsent = (settings: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(settings));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    applyCookieSettings(settings);
    setIsVisible(false);
    announce('Cookie preferences saved', 'polite');
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const acceptEssential = () => {
    saveConsent(defaultPreferences);
  };

  const saveCustomPreferences = () => {
    saveConsent(preferences);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
      aria-modal="false"
    >
      <div className="max-w-7xl mx-auto p-4">
        <div className="space-y-4">
          <div>
            <h2 id="cookie-banner-title" className="text-lg font-semibold text-gray-900">
              Cookie Preferences
            </h2>
            <p id="cookie-banner-description" className="text-sm text-gray-600 mt-2">
              We use cookies to enhance your experience, analyze site usage, and provide personalized content. 
              You can customize your cookie preferences below.
            </p>
          </div>

          {showDetails && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Essential Cookies */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.essential}
                        disabled
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 opacity-50"
                        aria-describedby="essential-description"
                      />
                      <span className="text-sm font-medium text-gray-900">Essential</span>
                      <span className="text-xs text-gray-500">(Required)</span>
                    </label>
                  </div>
                  <p id="essential-description" className="text-xs text-gray-600">
                    These cookies are necessary for the website to function and cannot be disabled.
                    They include authentication, security, and basic functionality.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => updatePreference('analytics', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        aria-describedby="analytics-description"
                      />
                      <span className="text-sm font-medium text-gray-900">Analytics</span>
                    </label>
                  </div>
                  <p id="analytics-description" className="text-xs text-gray-600">
                    Help us understand how visitors interact with our website by collecting
                    and reporting information anonymously.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => updatePreference('marketing', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        aria-describedby="marketing-description"
                      />
                      <span className="text-sm font-medium text-gray-900">Marketing</span>
                    </label>
                  </div>
                  <p id="marketing-description" className="text-xs text-gray-600">
                    Used to deliver personalized advertisements and track the effectiveness
                    of our marketing campaigns.
                  </p>
                </div>

                {/* Preference Cookies */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.preferences}
                        onChange={(e) => updatePreference('preferences', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        aria-describedby="preferences-description"
                      />
                      <span className="text-sm font-medium text-gray-900">Preferences</span>
                    </label>
                  </div>
                  <p id="preferences-description" className="text-xs text-gray-600">
                    Remember your settings and preferences to provide a more personalized experience.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <AccessibleButton
              variant="primary"
              size="sm"
              onClick={acceptAll}
              announcement="All cookies accepted"
            >
              Accept All
            </AccessibleButton>

            <AccessibleButton
              variant="secondary"
              size="sm"
              onClick={acceptEssential}
              announcement="Only essential cookies accepted"
            >
              Essential Only
            </AccessibleButton>

            <AccessibleButton
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              aria-expanded={showDetails}
              aria-controls="cookie-details"
              announcement={showDetails ? "Cookie details hidden" : "Cookie details shown"}
            >
              {showDetails ? 'Hide Details' : 'Customize'}
            </AccessibleButton>

            {showDetails && (
              <AccessibleButton
                variant="primary"
                size="sm"
                onClick={saveCustomPreferences}
                announcement="Custom cookie preferences saved"
              >
                Save Preferences
              </AccessibleButton>
            )}

            <a
              href="/legal/privacy"
              className="text-xs text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for checking cookie consent
export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      try {
        const preferences = JSON.parse(savedConsent);
        setConsent(preferences);
        setHasConsent(true);
      } catch (error) {
        setHasConsent(false);
      }
    } else {
      setHasConsent(false);
    }
  }, []);

  const updateConsent = (newPreferences: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(newPreferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setConsent(newPreferences);
    setHasConsent(true);
  };

  const clearConsent = () => {
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-consent-date');
    setConsent(null);
    setHasConsent(false);
  };

  return {
    consent,
    hasConsent,
    updateConsent,
    clearConsent,
    canUseAnalytics: consent?.analytics ?? false,
    canUseMarketing: consent?.marketing ?? false,
    canUsePreferences: consent?.preferences ?? false,
  };
};

// Utility for conditional tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  const consent = localStorage.getItem('cookie-consent');
  if (!consent) return;

  try {
    const preferences = JSON.parse(consent);
    if (preferences.analytics && typeof window !== 'undefined' && window.gtag) {
      window.gtag(SCHEMA_FIELDS.XP_TRANSACTION.EVENT, eventName, properties);
    }
  } catch (error) {
    console.warn('Cookie consent check failed:', error);
  }
};

// Global type for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}