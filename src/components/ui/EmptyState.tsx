import React from 'react';
import { LucideIcon } from 'lucide-react';
import { 
  Search, 
  Calendar, 
  Star, 
  Music, 
  Plus, 
  MessageSquare,
  Users,
  Filter,
  MapPin
} from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  iconName?: 'search' | 'calendar' | 'star' | 'music' | 'plus' | 'message' | 'users' | 'filter' | 'mappin';
  ctaButton?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const iconMap = {
  search: Search,
  calendar: Calendar,
  star: Star,
  music: Music,
  plus: Plus,
  message: MessageSquare,
  users: Users,
  filter: Filter,
  mappin: MapPin
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: CustomIcon,
  iconName = 'search',
  ctaButton,
  className = '',
  size = 'md'
}) => {
  const Icon = CustomIcon || iconMap[iconName];
  
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base',
      button: 'px-6 py-3 text-base'
    },
    lg: {
      container: 'py-16',
      icon: 'h-20 w-20',
      title: 'text-2xl',
      description: 'text-lg',
      button: 'px-8 py-4 text-lg'
    }
  };

  const buttonVariants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-800'
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size].container} ${className}`}>
      {/* Icon */}
      <div className="mb-4">
        <Icon className={`${sizeClasses[size].icon} text-gray-500 mx-auto`} />
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-gray-300 mb-2 ${sizeClasses[size].title}`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-gray-500 mb-6 max-w-md ${sizeClasses[size].description}`}>
        {description}
      </p>

      {/* CTA Button */}
      {ctaButton && (
        <button
          onClick={ctaButton.onClick}
          className={`
            ${sizeClasses[size].button}
            ${buttonVariants[ctaButton.variant || 'primary']}
            rounded-lg font-medium transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
          `}
        >
          {ctaButton.text}
        </button>
      )}
    </div>
  );
};

// Pre-configured empty states for common scenarios
export const NoCreatorsFound: React.FC<{ onClearFilters?: () => void }> = ({ onClearFilters }) => (
  <EmptyState
    title="No Creators Found"
    description="We couldn't find any creators matching your criteria. Try adjusting your filters or search terms."
    iconName="users"
    ctaButton={onClearFilters ? {
      text: "Clear Filters",
      onClick: onClearFilters,
      variant: "outline"
    } : undefined}
  />
);

export const NoSearchResults: React.FC<{ query: string; onClearSearch?: () => void }> = ({ query, onClearSearch }) => (
  <EmptyState
    title="No Results Found"
    description={`We couldn't find any creators matching "${query}". Try different keywords or browse all creators.`}
    iconName="search"
    ctaButton={onClearSearch ? {
      text: "Clear Search",
      onClick: onClearSearch,
      variant: "outline"
    } : undefined}
  />
);

export const NoBookings: React.FC<{ 
  userRole: 'client' | 'provider';
  onExplore?: () => void;
  onCreateService?: () => void;
}> = ({ userRole, onExplore, onCreateService }) => {
  const isClient = userRole === 'client';
  
  return (
    <EmptyState
      title={isClient ? "No Bookings Yet" : "No Bookings Received"}
      description={
        isClient 
          ? "Start by exploring creators and booking your first service."
          : "Once clients book your services, they'll appear here."
      }
      iconName="calendar"
      ctaButton={
        isClient && onExplore ? {
          text: "Explore Creators",
          onClick: onExplore,
          variant: "primary"
        } : !isClient && onCreateService ? {
          text: "Create a Service",
          onClick: onCreateService,
          variant: "primary"
        } : undefined
      }
    />
  );
};

export const NoServices: React.FC<{ 
  isOwnProfile: boolean;
  onCreateService?: () => void;
}> = ({ isOwnProfile, onCreateService }) => (
  <EmptyState
    title={isOwnProfile ? "No Services Created" : "No Services Available"}
    description={
      isOwnProfile 
        ? "Create your first service to start receiving bookings from clients."
        : "This creator hasn't added any services yet."
    }
    iconName="music"
    size="sm"
    ctaButton={isOwnProfile && onCreateService ? {
      text: "Create Service",
      onClick: onCreateService,
      variant: "primary"
    } : undefined}
  />
);

export const NoReviews: React.FC<{ 
  isOwnProfile: boolean;
  onRequestReview?: () => void;
}> = ({ isOwnProfile, onRequestReview }) => (
  <EmptyState
    title={isOwnProfile ? "No Reviews Yet" : "No Reviews Available"}
    description={
      isOwnProfile 
        ? "Complete some bookings to start receiving reviews from clients."
        : "This creator hasn't received any reviews yet."
    }
    iconName="star"
    size="sm"
    ctaButton={isOwnProfile && onRequestReview ? {
      text: "Request Reviews",
      onClick: onRequestReview,
      variant: "outline"
    } : undefined}
  />
);

export const NoMessages: React.FC<{ onExplore?: () => void }> = ({ onExplore }) => (
  <EmptyState
    title="No Messages"
    description="Start a conversation by booking a service or reaching out to creators."
    iconName="message"
    ctaButton={onExplore ? {
      text: "Find Creators",
      onClick: onExplore,
      variant: "primary"
    } : undefined}
  />
);

export default EmptyState;
export { EmptyState };
