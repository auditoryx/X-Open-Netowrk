import React from 'react';
import { CollabPackage, getPackageMembers, formatPackageDuration, formatPackagePrice } from '@/src/lib/types/CollabPackage';
import { 
  Music, 
  Headphones, 
  Mic, 
  Video, 
  Building, 
  Clock, 
  MapPin, 
  Star, 
  Eye,
  Users,
  Tag as TagIcon,
  ChevronRight
} from 'lucide-react';

interface CollabPackageCardProps {
  package: CollabPackage;
  onViewDetails?: (packageId: string) => void;
  onBook?: (packageId: string) => void;
  showBookButton?: boolean;
  variant?: 'grid' | 'list';
}

const ROLE_ICONS = {
  artist: Music,
  producer: Headphones,
  engineer: Mic,
  videographer: Video,
  studio: Building
};

const PACKAGE_TYPE_LABELS = {
  studio_session: 'Studio Session',
  live_performance: 'Live Performance',
  video_production: 'Video Production',
  custom: 'Custom'
};

export function CollabPackageCard({ 
  package: pkg, 
  onViewDetails, 
  onBook, 
  showBookButton = true,
  variant = 'grid'
}: CollabPackageCardProps) {
  const members = getPackageMembers(pkg);
  const truncatedDescription = pkg.description.length > 150 
    ? pkg.description.substring(0, 150) + '...' 
    : pkg.description;

  const handleCardClick = () => {
    onViewDetails?.(pkg.id!);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBook?.(pkg.id!);
  };

  if (variant === 'list') {
    return (
      <div 
        onClick={handleCardClick}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Package Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {pkg.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs">
                    {PACKAGE_TYPE_LABELS[pkg.packageType]}
                  </span>
                  {pkg.featured && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded text-xs flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPackagePrice(pkg.totalPrice)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatPackageDuration(pkg.durationMinutes)}
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {truncatedDescription}
            </p>

            {/* Team Members */}
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4 text-gray-500" />
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((member, index) => (
                  <div
                    key={member.uid}
                    className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-600"
                    title={`${member.name} (${member.role})`}
                  >
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {React.createElement(ROLE_ICONS[member.role], {
                          className: "w-4 h-4 text-gray-500"
                        })}
                      </div>
                    )}
                    {member.verified && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white dark:border-gray-800 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                ))}
                {members.length > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                    +{members.length - 4}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Tags */}
            {pkg.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <TagIcon className="w-4 h-4 text-gray-500" />
                <div className="flex flex-wrap gap-1">
                  {pkg.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {pkg.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                      +{pkg.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3 md:flex-col md:space-x-0 md:space-y-3">
            {showBookButton && (
              <button
                onClick={handleBookClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Book Now
              </button>
            )}
            <button
              onClick={handleCardClick}
              className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              <span>View Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {pkg.title}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs">
                {PACKAGE_TYPE_LABELS[pkg.packageType]}
              </span>
              {pkg.featured && (
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded text-xs flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatPackagePrice(pkg.totalPrice)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatPackageDuration(pkg.durationMinutes)}
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
          {pkg.description}
        </p>

        {/* Team Members */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Members
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {members.slice(0, 4).map((member) => {
              const Icon = ROLE_ICONS[member.role];
              
              return (
                <div
                  key={member.uid}
                  className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="relative">
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    {member.verified && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white dark:border-gray-800 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {member.role}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {members.length > 4 && (
              <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  +{members.length - 4} more
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {pkg.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {pkg.tags.slice(0, 4).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {pkg.tags.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                  +{pkg.tags.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            {pkg.viewCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{pkg.viewCount}</span>
              </div>
            )}
            {pkg.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-current text-yellow-500" />
                <span>{pkg.rating.toFixed(1)}</span>
                {pkg.reviewCount && (
                  <span>({pkg.reviewCount})</span>
                )}
              </div>
            )}
            {pkg.bookingCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{pkg.bookingCount} booked</span>
              </div>
            )}
          </div>
          
          {showBookButton && (
            <button
              onClick={handleBookClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
