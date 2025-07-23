/**
 * Analytics Configuration for X Open Network
 * 
 * This file provides comprehensive analytics tracking for:
 * - User behavior and engagement
 * - Conversion funnel analysis
 * - Business metrics and KPIs
 * - A/B testing framework
 * - Privacy-compliant data collection
 */

// Analytics Event Types
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
}

// User Journey Events
export const USER_EVENTS = {
  // Registration & Onboarding
  REGISTRATION_STARTED: 'registration_started',
  REGISTRATION_COMPLETED: 'registration_completed',
  EMAIL_VERIFIED: 'email_verified',
  PROFILE_COMPLETED: 'profile_completed',
  
  // Search & Discovery
  SEARCH_PERFORMED: 'search_performed',
  CREATOR_PROFILE_VIEWED: 'creator_profile_viewed',
  PORTFOLIO_ITEM_VIEWED: 'portfolio_item_viewed',
  FILTERS_APPLIED: 'filters_applied',
  
  // Booking Flow
  BOOKING_INITIATED: 'booking_initiated',
  BOOKING_DETAILS_ENTERED: 'booking_details_entered',
  PAYMENT_METHOD_SELECTED: 'payment_method_selected',
  PAYMENT_ATTEMPTED: 'payment_attempted',
  BOOKING_COMPLETED: 'booking_completed',
  BOOKING_CANCELLED: 'booking_cancelled',
  
  // Communication
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  VIDEO_CALL_STARTED: 'video_call_started',
  FILE_SHARED: 'file_shared',
  
  // Creator Actions
  CREATOR_PROFILE_UPDATED: 'creator_profile_updated',
  PORTFOLIO_UPDATED: 'portfolio_updated',
  AVAILABILITY_UPDATED: 'availability_updated',
  RATE_UPDATED: 'rate_updated',
  
  // Reviews & Feedback
  REVIEW_SUBMITTED: 'review_submitted',
  REVIEW_RECEIVED: 'review_received',
  TESTIMONIAL_CREATED: 'testimonial_created',
  
  // Business Events
  REVENUE_GENERATED: 'revenue_generated',
  PAYOUT_PROCESSED: 'payout_processed',
  SUBSCRIPTION_STARTED: 'subscription_started',
  REFUND_PROCESSED: 'refund_processed'
} as const;

// Conversion Funnel Definitions
export const CONVERSION_FUNNELS = {
  CLIENT_ONBOARDING: {
    name: 'Client Onboarding',
    steps: [
      'registration_started',
      'registration_completed',
      'email_verified',
      'profile_completed',
      'search_performed'
    ]
  },
  
  CREATOR_ONBOARDING: {
    name: 'Creator Onboarding',
    steps: [
      'registration_started',
      'registration_completed',
      'email_verified',
      'profile_completed',
      'portfolio_updated',
      'availability_updated'
    ]
  },
  
  BOOKING_CONVERSION: {
    name: 'Booking Conversion',
    steps: [
      'search_performed',
      'creator_profile_viewed',
      'booking_initiated',
      'booking_details_entered',
      'payment_attempted',
      'booking_completed'
    ]
  },
  
  CREATOR_SUCCESS: {
    name: 'Creator Success',
    steps: [
      'profile_completed',
      'creator_profile_viewed',
      'booking_initiated',
      'booking_completed',
      'review_received'
    ]
  }
} as const;

// Business KPI Definitions
export const BUSINESS_KPIS = {
  // User Acquisition
  DAILY_ACTIVE_USERS: 'daily_active_users',
  WEEKLY_ACTIVE_USERS: 'weekly_active_users',
  MONTHLY_ACTIVE_USERS: 'monthly_active_users',
  NEW_USER_REGISTRATIONS: 'new_user_registrations',
  USER_RETENTION_RATE: 'user_retention_rate',
  
  // Engagement
  SESSION_DURATION: 'session_duration',
  PAGES_PER_SESSION: 'pages_per_session',
  BOUNCE_RATE: 'bounce_rate',
  SEARCH_TO_PROFILE_RATE: 'search_to_profile_rate',
  PROFILE_TO_BOOKING_RATE: 'profile_to_booking_rate',
  
  // Revenue
  GROSS_MERCHANDISE_VALUE: 'gross_merchandise_value',
  REVENUE_PER_USER: 'revenue_per_user',
  AVERAGE_ORDER_VALUE: 'average_order_value',
  BOOKING_COMPLETION_RATE: 'booking_completion_rate',
  REFUND_RATE: 'refund_rate',
  
  // Creator Success
  CREATOR_APPROVAL_RATE: 'creator_approval_rate',
  CREATOR_EARNINGS: 'creator_earnings',
  CREATOR_BOOKING_RATE: 'creator_booking_rate',
  CREATOR_REPEAT_RATE: 'creator_repeat_rate',
  CREATOR_RATING_AVERAGE: 'creator_rating_average'
} as const;

// Analytics Configuration
export const analyticsConfig = {
  // Enable/disable analytics in different environments
  enabled: process.env.NODE_ENV === 'production' || process.env.ANALYTICS_ENABLED === 'true',
  
  // Data collection settings
  collection: {
    // GDPR compliant settings
    requireConsent: true,
    anonymizeIp: true,
    cookieExpiration: 30, // days
    
    // Data retention
    dataRetention: 365, // days
    
    // Sampling rate (100% = collect all data, 50% = sample half)
    samplingRate: 100,
    
    // Session settings
    sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
  },
  
  // External analytics providers
  providers: {
    googleAnalytics: {
      enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      debugMode: process.env.NODE_ENV === 'development'
    },
    
    mixpanel: {
      enabled: !!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
      token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
      trackAutomaticEvents: true
    },
    
    hotjar: {
      enabled: !!process.env.NEXT_PUBLIC_HOTJAR_ID,
      siteId: process.env.NEXT_PUBLIC_HOTJAR_ID,
      version: 6
    },
    
    amplitude: {
      enabled: !!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
      apiKey: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
      serverUrl: 'https://api2.amplitude.com'
    }
  }
};

// Event tracking utilities
export class Analytics {
  private static userId: string | null = null;
  private static sessionId: string = '';
  private static userProperties: Record<string, any> = {};
  
  // Initialize analytics
  static initialize(userId?: string) {
    if (!analyticsConfig.enabled) return;
    
    this.userId = userId || null;
    this.sessionId = this.generateSessionId();
    
    // Initialize external providers
    this.initializeProviders();
  }
  
  // Track user events
  static track(event: string, properties: Record<string, any> = {}) {
    if (!analyticsConfig.enabled) return;
    
    const analyticsEvent: AnalyticsEvent = {
      event,
      category: properties.category || 'user',
      action: properties.action || event,
      label: properties.label,
      value: properties.value,
      properties: {
        ...properties,
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date().toISOString()
      },
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      timestamp: new Date()
    };
    
    // Send to internal analytics
    this.sendToInternalAnalytics(analyticsEvent);
    
    // Send to external providers
    this.sendToProviders(analyticsEvent);
  }
  
  // Track page views
  static page(pageName: string, properties: Record<string, any> = {}) {
    this.track('page_view', {
      category: 'navigation',
      action: 'page_view',
      label: pageName,
      page_name: pageName,
      ...properties
    });
  }
  
  // Track conversion events
  static conversion(funnelName: string, step: string, properties: Record<string, any> = {}) {
    this.track('conversion', {
      category: 'conversion',
      action: 'funnel_step',
      label: `${funnelName}:${step}`,
      funnel_name: funnelName,
      funnel_step: step,
      ...properties
    });
  }
  
  // Track business metrics
  static metric(kpi: string, value: number, properties: Record<string, any> = {}) {
    this.track('business_metric', {
      category: 'business',
      action: 'kpi_update',
      label: kpi,
      value,
      kpi_name: kpi,
      ...properties
    });
  }
  
  // Set user properties
  static identify(userId: string, properties: Record<string, any> = {}) {
    this.userId = userId;
    this.userProperties = { ...this.userProperties, ...properties };
    
    // Send to external providers
    if (analyticsConfig.providers.googleAnalytics.enabled) {
      this.setGAUserProperties(properties);
    }
    
    if (analyticsConfig.providers.mixpanel.enabled) {
      this.setMixpanelUserProperties(properties);
    }
  }
  
  // Generate session ID
  private static generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Initialize external providers
  private static initializeProviders() {
    // Google Analytics 4
    if (analyticsConfig.providers.googleAnalytics.enabled) {
      this.initializeGA4();
    }
    
    // Mixpanel
    if (analyticsConfig.providers.mixpanel.enabled) {
      this.initializeMixpanel();
    }
    
    // Hotjar
    if (analyticsConfig.providers.hotjar.enabled) {
      this.initializeHotjar();
    }
  }
  
  // Send to internal analytics storage
  private static async sendToInternalAnalytics(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }
  
  // Send to external providers
  private static sendToProviders(event: AnalyticsEvent) {
    // Google Analytics
    if (analyticsConfig.providers.googleAnalytics.enabled && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.properties
      });
    }
    
    // Mixpanel
    if (analyticsConfig.providers.mixpanel.enabled && typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track(event.event, event.properties);
    }
  }
  
  // Google Analytics 4 initialization
  private static initializeGA4() {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.providers.googleAnalytics.measurementId}`;
    script.async = true;
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', analyticsConfig.providers.googleAnalytics.measurementId, {
      anonymize_ip: analyticsConfig.collection.anonymizeIp,
      cookie_expires: analyticsConfig.collection.cookieExpiration * 24 * 60 * 60,
      debug_mode: analyticsConfig.providers.googleAnalytics.debugMode
    });
  }
  
  // Mixpanel initialization
  private static initializeMixpanel() {
    // Mixpanel initialization code would go here
    // This is a simplified version
    const script = document.createElement('script');
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    script.async = true;
    document.head.appendChild(script);
  }
  
  // Hotjar initialization
  private static initializeHotjar() {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${analyticsConfig.providers.hotjar.siteId},hjv:${analyticsConfig.providers.hotjar.version}};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `;
    document.head.appendChild(script);
  }
  
  // Set Google Analytics user properties
  private static setGAUserProperties(properties: Record<string, any>) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', analyticsConfig.providers.googleAnalytics.measurementId, {
        user_id: this.userId,
        custom_map: properties
      });
    }
  }
  
  // Set Mixpanel user properties
  private static setMixpanelUserProperties(properties: Record<string, any>) {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.identify(this.userId);
      window.mixpanel.people.set(properties);
    }
  }
}

// Privacy compliance utilities
export class PrivacyCompliance {
  // Check if user has given consent
  static hasConsent(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('analytics_consent') === 'true';
  }
  
  // Set user consent
  static setConsent(consent: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('analytics_consent', consent.toString());
    
    if (consent) {
      Analytics.initialize();
    }
  }
  
  // Get anonymized user ID
  static getAnonymizedUserId(userId: string): string {
    // Simple hash function for anonymization
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// A/B Testing framework
export class ABTesting {
  private static experiments: Map<string, any> = new Map();
  
  // Initialize A/B test
  static initializeExperiment(experimentId: string, variants: string[], trafficAllocation: number = 100) {
    const userVariant = this.getUserVariant(experimentId, variants);
    
    this.experiments.set(experimentId, {
      variants,
      userVariant,
      trafficAllocation
    });
    
    // Track experiment exposure
    Analytics.track('experiment_exposure', {
      category: 'ab_testing',
      action: 'variant_assigned',
      label: experimentId,
      experiment_id: experimentId,
      variant: userVariant
    });
    
    return userVariant;
  }
  
  // Get user's variant for an experiment
  static getUserVariant(experimentId: string, variants: string[]): string {
    const userId = Analytics['userId'] || 'anonymous';
    const hash = this.hashString(`${experimentId}_${userId}`);
    const variantIndex = hash % variants.length;
    return variants[variantIndex];
  }
  
  // Track experiment conversion
  static trackConversion(experimentId: string, conversionEvent: string, value?: number) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;
    
    Analytics.track('experiment_conversion', {
      category: 'ab_testing',
      action: 'conversion',
      label: experimentId,
      value,
      experiment_id: experimentId,
      variant: experiment.userVariant,
      conversion_event: conversionEvent
    });
  }
  
  // Simple hash function
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// Export convenience functions for common tracking
export const trackUserEvent = (event: string, properties?: Record<string, any>) => 
  Analytics.track(event, properties);

export const trackPageView = (pageName: string, properties?: Record<string, any>) => 
  Analytics.page(pageName, properties);

export const trackConversion = (funnelName: string, step: string, properties?: Record<string, any>) => 
  Analytics.conversion(funnelName, step, properties);

export const trackBusinessMetric = (kpi: string, value: number, properties?: Record<string, any>) => 
  Analytics.metric(kpi, value, properties);

export default Analytics;