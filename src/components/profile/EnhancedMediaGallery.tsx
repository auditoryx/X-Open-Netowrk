'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Star, X, ExternalLink, Heart } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  title?: string;
  description?: string;
  featured?: boolean;
  tags?: string[];
  thumbnailUrl?: string;
}

interface EnhancedMediaGalleryProps {
  items: MediaItem[];
  canEdit?: boolean;
  onFeatureToggle?: (id: string) => void;
  className?: string;
}

export default function EnhancedMediaGallery({ 
  items = [], 
  canEdit = false, 
  onFeatureToggle,
  className = ''
}: EnhancedMediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const featuredItems = items.filter(item => item.featured);
  const regularItems = items.filter(item => !item.featured);
  const allItems = [...featuredItems, ...regularItems];

  if (!allItems.length) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <Play className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">No media samples available</p>
      </div>
    );
  }

  const currentItem = allItems[currentIndex];

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < allItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % allItems.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const renderMediaContent = (item: MediaItem, isFullSize = false) => {
    const containerClass = isFullSize 
      ? "w-full h-full max-h-[80vh] flex items-center justify-center"
      : "w-full h-64 md:h-80";

    if (item.type === 'video') {
      if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
        const videoId = item.url.includes('youtu.be') 
          ? item.url.split('/').pop()
          : item.url.split('v=')[1]?.split('&')[0];
        
        return (
          <div className={containerClass}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={item.title || 'Video'}
              className={isFullSize ? "w-full h-full max-w-4xl" : "w-full h-full"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      } else {
        return (
          <div className={containerClass}>
            <video
              src={item.url}
              controls
              className={isFullSize ? "max-w-full max-h-full" : "w-full h-full object-cover"}
              poster={item.thumbnailUrl}
            />
          </div>
        );
      }
    } else if (item.type === 'audio') {
      return (
        <div className={containerClass}>
          <div className="w-full bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center">
            <Play className="w-12 h-12 text-gray-400 mb-4" />
            <audio
              src={item.url}
              controls
              className="w-full max-w-md"
            />
            {item.title && (
              <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">{item.title}</h3>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className={containerClass}>
          <Image
            src={item.url}
            alt={item.title || 'Media sample'}
            fill={!isFullSize}
            width={isFullSize ? 1200 : undefined}
            height={isFullSize ? 800 : undefined}
            className={isFullSize ? "max-w-full max-h-full object-contain" : "object-cover"}
            onClick={!isFullSize ? openFullscreen : undefined}
          />
        </div>
      );
    }
  };

  // Featured Items Section
  const FeaturedSection = () => {
    if (featuredItems.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          Featured Work
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {featuredItems.slice(0, 2).map((item, index) => (
            <div key={item.id} className="relative bg-white rounded-lg shadow-sm border overflow-hidden group">
              <div className="relative h-48">
                {renderMediaContent(item)}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors cursor-pointer"
                     onClick={() => {
                       setCurrentIndex(allItems.findIndex(i => i.id === item.id));
                       openFullscreen();
                     }}
                />
                {canEdit && (
                  <button
                    onClick={() => onFeatureToggle?.(item.id)}
                    className="absolute top-3 right-3 p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                )}
              </div>
              {item.title && (
                <div className="p-4">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                  )}
                  {item.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <FeaturedSection />
      
      {/* Main Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {featuredItems.length > 0 ? 'More Work' : 'Portfolio'}
          </h3>
          <div className="text-sm text-gray-500">
            {currentIndex + 1} / {allItems.length}
          </div>
        </div>

        {/* Mobile-optimized carousel */}
        <div 
          ref={carouselRef}
          className="relative rounded-lg overflow-hidden bg-gray-100"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative">
            {renderMediaContent(currentItem)}
            
            {/* Featured badge */}
            {currentItem.featured && (
              <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </div>
            )}

            {/* Navigation arrows - hidden on mobile */}
            {allItems.length > 1 && (
              <>
                <button
                  onClick={prevItem}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors hidden md:block"
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextItem}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors hidden md:block"
                  disabled={currentIndex === allItems.length - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Fullscreen button */}
            <button
              onClick={openFullscreen}
              className="absolute bottom-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Edit button for featured toggle */}
            {canEdit && (
              <button
                onClick={() => onFeatureToggle?.(currentItem.id)}
                className={`absolute bottom-3 left-3 p-2 rounded-full transition-colors ${
                  currentItem.featured 
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <Star className={`w-4 h-4 ${currentItem.featured ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {/* Media info overlay */}
          {(currentItem.title || currentItem.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4">
              {currentItem.title && (
                <h4 className="font-medium">{currentItem.title}</h4>
              )}
              {currentItem.description && (
                <p className="text-sm text-gray-200 mt-1">{currentItem.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Mobile dots indicator */}
        {allItems.length > 1 && (
          <div className="flex justify-center gap-2 md:hidden">
            {allItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Thumbnail strip for desktop */}
        {allItems.length > 1 && (
          <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
            {allItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === currentIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={item.title || 'Thumbnail'}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                {item.featured && (
                  <div className="absolute top-1 right-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors z-60"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center">
            {renderMediaContent(currentItem, true)}
            
            {allItems.length > 1 && (
              <>
                <button
                  onClick={prevItem}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextItem}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                  disabled={currentIndex === allItems.length - 1}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Fullscreen info */}
          {(currentItem.title || currentItem.description) && (
            <div className="absolute bottom-8 left-8 right-8 text-white">
              {currentItem.title && (
                <h3 className="text-xl font-semibold mb-2">{currentItem.title}</h3>
              )}
              {currentItem.description && (
                <p className="text-gray-200">{currentItem.description}</p>
              )}
              {currentItem.tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {currentItem.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/20 text-white text-sm rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}