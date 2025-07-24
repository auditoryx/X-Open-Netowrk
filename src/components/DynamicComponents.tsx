/**
 * Phase 2B: Dynamic Import Components
 * Lazy load heavy components to reduce initial bundle size
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading component for dynamic imports
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-sm text-gray-600">Loading...</span>
  </div>
);

// Chart components (heavy dependencies)
export const EarningsChart = dynamic(
  () => import('../components/admin/EarningsChart'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const AnalyticsChart = dynamic(
  () => import('../components/analytics/AnalyticsChart'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Map components (Mapbox/Leaflet are heavy)
export const MapComponent = dynamic(
  () => import('../components/map/MapComponent'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const StudioMap = dynamic(
  () => import('../components/map/StudioMap'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Admin components (feature-flagged, load on demand)
export const AdminDashboard = dynamic(
  () => import('../components/admin/AdminDashboard'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const UserManagement = dynamic(
  () => import('../components/admin/UserManagement'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Beat marketplace (feature-flagged)
export const BeatPlayer = dynamic(
  () => import('../components/beats/BeatPlayer'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const BeatUploader = dynamic(
  () => import('../components/beats/BeatUploader'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// PDF generation (heavy dependency)
export const ContractGenerator = dynamic(
  () => import('../components/contracts/ContractGenerator'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Video components (feature-flagged)
export const VideoPlayer = dynamic(
  () => import('../components/video/VideoPlayer'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Calendar components (can be heavy with all the logic)
export const BookingCalendar = dynamic(
  () => import('../components/calendar/BookingCalendar'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const AvailabilityCalendar = dynamic(
  () => import('../components/calendar/AvailabilityCalendar'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Chat components (real-time features)
export const BookingChat = dynamic(
  () => import('../components/chat/BookingChat'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const MessageThread = dynamic(
  () => import('../components/chat/MessageThread'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Advanced forms (heavy with validation)
export const AdvancedProfileForm = dynamic(
  () => import('../components/forms/AdvancedProfileForm'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const ServiceCreationForm = dynamic(
  () => import('../components/forms/ServiceCreationForm'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Gamification components (feature-flagged)
export const Leaderboard = dynamic(
  () => import('../components/gamification/Leaderboard'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const BadgeSystem = dynamic(
  () => import('../components/gamification/BadgeSystem'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Payment components (critical but can be lazy loaded)
export const StripeCheckout = dynamic(
  () => import('../components/payments/StripeCheckout'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const PaymentHistory = dynamic(
  () => import('../components/payments/PaymentHistory'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Social features (feature-flagged)
export const ReviewSystem = dynamic(
  () => import('../components/reviews/ReviewSystem'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const TestimonialCarousel = dynamic(
  () => import('../components/testimonials/TestimonialCarousel'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Collaboration features (post-MVP)
export const CollabManager = dynamic(
  () => import('../components/collabs/CollabManager'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Export helper function for conditional loading based on feature flags
export const getDynamicComponent = (componentName: string, featureFlags?: Record<string, boolean>) => {
  const components: Record<string, ComponentType<any>> = {
    EarningsChart,
    AnalyticsChart,
    MapComponent,
    StudioMap,
    AdminDashboard,
    UserManagement,
    BeatPlayer,
    BeatUploader,
    ContractGenerator,
    VideoPlayer,
    BookingCalendar,
    AvailabilityCalendar,
    BookingChat,
    MessageThread,
    AdvancedProfileForm,
    ServiceCreationForm,
    Leaderboard,
    BadgeSystem,
    StripeCheckout,
    PaymentHistory,
    ReviewSystem,
    TestimonialCarousel,
    CollabManager,
  };

  // Check feature flags if provided
  if (featureFlags) {
    const flaggedComponents = {
      AdminDashboard: featureFlags.adminDashboard,
      UserManagement: featureFlags.adminDashboard,
      BeatPlayer: featureFlags.beatMarketplace,
      BeatUploader: featureFlags.beatMarketplace,
      Leaderboard: featureFlags.gamification,
      BadgeSystem: featureFlags.gamification,
      ReviewSystem: featureFlags.reviews,
      TestimonialCarousel: featureFlags.testimonials,
      CollabManager: featureFlags.collaborations,
    };

    if (componentName in flaggedComponents && !flaggedComponents[componentName as keyof typeof flaggedComponents]) {
      return null; // Component disabled by feature flag
    }
  }

  return components[componentName] || null;
};

export default {
  EarningsChart,
  AnalyticsChart,
  MapComponent,
  StudioMap,
  AdminDashboard,
  UserManagement,
  BeatPlayer,
  BeatUploader,
  ContractGenerator,
  VideoPlayer,
  BookingCalendar,
  AvailabilityCalendar,
  BookingChat,
  MessageThread,
  AdvancedProfileForm,
  ServiceCreationForm,
  Leaderboard,
  BadgeSystem,
  StripeCheckout,
  PaymentHistory,
  ReviewSystem,
  TestimonialCarousel,
  CollabManager,
  getDynamicComponent,
};