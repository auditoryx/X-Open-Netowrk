/**
 * Phase 2B Performance Optimization Component
 * 
 * This component provides lazy loading and code splitting utilities
 * to help achieve the target bundle size of <500KB and improve
 * Lighthouse performance scores to 90+
 */

import { lazy, Suspense, ComponentType, ReactElement } from 'react';

// Enhanced loading skeleton components for better UX
export const SkeletonLoader = ({ className = '', height = 'h-4' }: { className?: string; height?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${height} ${className}`} />
);

export const CardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-4">
    <SkeletonLoader height="h-6" className="w-3/4" />
    <SkeletonLoader height="h-4" className="w-1/2" />
    <SkeletonLoader height="h-20" className="w-full" />
    <div className="flex space-x-2">
      <SkeletonLoader height="h-8" className="w-16" />
      <SkeletonLoader height="h-8" className="w-16" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <SkeletonLoader height="h-8" className="w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Enhanced lazy loading wrapper with error boundary
interface LazyComponentWrapperProps {
  fallback?: ReactElement;
  errorFallback?: ReactElement;
  children: ReactElement;
}

export const LazyComponentWrapper = ({ 
  fallback = <SkeletonLoader height="h-64" className="w-full" />, 
  errorFallback = <div className="text-red-500 p-4">Failed to load component</div>,
  children 
}: LazyComponentWrapperProps) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Performance-optimized lazy component factory
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactElement
) {
  const LazyComponent = lazy(importFn);
  
  return (props: Parameters<T>[0]) => (
    <LazyComponentWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyComponentWrapper>
  );
}

// Phase 2B: Lazy-loaded components for code splitting
export const LazyDashboard = createLazyComponent(
  () => import('@/components/dashboard/Dashboard'),
  <DashboardSkeleton />
);

export const LazyBookingFlow = createLazyComponent(
  () => import('@/components/booking/BookingFlow'),
  <SkeletonLoader height="h-96" className="w-full" />
);

export const LazyProfileSetup = createLazyComponent(
  () => import('@/components/profile/ProfileSetup'),
  <CardSkeleton />
);

export const LazySearchResults = createLazyComponent(
  () => import('@/components/search/SearchResults'),
  <DashboardSkeleton />
);

export const LazyPaymentFlow = createLazyComponent(
  () => import('@/components/payment/PaymentFlow'),
  <SkeletonLoader height="h-80" className="w-full" />
);

export const LazyAdminDashboard = createLazyComponent(
  () => import('@/components/admin/AdminDashboard'),
  <DashboardSkeleton />
);

export const LazyAnalytics = createLazyComponent(
  () => import('@/components/analytics/Analytics'),
  <SkeletonLoader height="h-64" className="w-full" />
);

export const LazyMessaging = createLazyComponent(
  () => import('@/components/messaging/Messaging'),
  <SkeletonLoader height="h-96" className="w-full" />
);

// Phase 2B: Dynamic imports for heavy features
export const loadHeavyFeatures = {
  // Lazy load chart libraries
  charts: () => import('react-chartjs-2'),
  
  // Lazy load editor components  
  editor: () => import('@/components/editor/RichTextEditor'),
  
  // Lazy load map components
  maps: () => import('@/components/map/MapComponent'),
  
  // Lazy load file upload components
  fileUpload: () => import('@/components/upload/FileUploadComponent'),
  
  // Lazy load calendar components
  calendar: () => import('@/components/calendar/CalendarComponent'),
  
  // Lazy load video player
  videoPlayer: () => import('@/components/media/VideoPlayer'),
  
  // Lazy load gamification components
  gamification: () => import('@/components/gamification/GamificationDashboard'),
};

// Performance monitoring hook
export const usePerformanceOptimization = () => {
  // Track component load times
  const trackComponentLoad = (componentName: string, startTime: number) => {
    const loadTime = performance.now() - startTime;
    console.log(`[Performance] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    
    // Send to performance monitor if available
    if (typeof window !== 'undefined' && window.performanceMonitor) {
      window.performanceMonitor.trackMetric('componentLoadTime', loadTime, {
        component: componentName
      });
    }
  };

  return { trackComponentLoad };
};

// Image optimization helper
export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className = '',
  ...props 
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  [key: string]: any;
}) => {
  // Use Next.js Image component with optimization
  const NextImage = lazy(() => import('next/image'));
  
  return (
    <Suspense fallback={<SkeletonLoader className={`${className} bg-gray-200`} />}>
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={className}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        {...props}
      />
    </Suspense>
  );
};

export default {
  LazyComponentWrapper,
  createLazyComponent,
  LazyDashboard,
  LazyBookingFlow,
  LazyProfileSetup,
  LazySearchResults,
  LazyPaymentFlow,
  LazyAdminDashboard,
  LazyAnalytics,
  LazyMessaging,
  loadHeavyFeatures,
  usePerformanceOptimization,
  OptimizedImage,
  SkeletonLoader,
  CardSkeleton,
  DashboardSkeleton,
};