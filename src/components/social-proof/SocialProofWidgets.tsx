'use client';

import React, { useState, useEffect } from 'react';
import { socialProofService, SocialProofProfile, SocialProofWidget } from '@/lib/services/socialProofService';
import { testimonialService, Testimonial } from '@/lib/services/testimonialService';
import { 
  Star, 
  Award, 
  Shield, 
  Clock, 
  Users, 
  TrendingUp,
  Heart,
  CheckCircle,
  Trophy,
  Target,
  Zap,
  DollarSign,
  Music,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SocialProofWidgetsProps {
  creatorId: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
  maxWidgets?: number;
}

export default function SocialProofWidgets({ 
  creatorId, 
  layout = 'vertical',
  maxWidgets = 4 
}: SocialProofWidgetsProps) {
  const [profile, setProfile] = useState<SocialProofProfile | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    loadSocialProofData();
  }, [creatorId]);

  const loadSocialProofData = async () => {
    try {
      const [profileData, testimonialsData] = await Promise.all([
        socialProofService.getSocialProofProfile(creatorId),
        testimonialService.getFeaturedTestimonials(creatorId, 5)
      ]);

      setProfile(profileData);
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Error loading social proof data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(maxWidgets)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!profile) return null;

  const getBadgeIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      star: Star,
      target: Target,
      zap: Zap,
      heart: Heart,
      'dollar-sign': DollarSign,
      music: Music,
      'shield-check': Shield,
      clock: Clock
    };
    const IconComponent = icons[iconName] || Award;
    return <IconComponent className="w-5 h-5" />;
  };

  const getBadgeColor = (color: string) => {
    const colors: { [key: string]: string } = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const visibleWidgets = profile.widgets
    .filter(widget => widget.isVisible)
    .sort((a, b) => a.position - b.position)
    .slice(0, maxWidgets);

  const renderTestimonialsWidget = (widget: SocialProofWidget) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
      
      {testimonials.length > 0 ? (
        <div className="space-y-4">
          {widget.settings.displayStyle === 'carousel' ? (
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div key={testimonial.id} className="w-full flex-shrink-0">
                      <TestimonialCard testimonial={testimonial} showAvatar={widget.settings.showAvatars} />
                    </div>
                  ))}
                </div>
              </div>
              
              {testimonials.length > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setCurrentTestimonial(prev => 
                      prev === 0 ? testimonials.length - 1 : prev - 1
                    )}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex space-x-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentTestimonial(prev => 
                      prev === testimonials.length - 1 ? 0 : prev + 1
                    )}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {testimonials.slice(0, widget.settings.showCount || 3).map((testimonial) => (
                <TestimonialCard 
                  key={testimonial.id} 
                  testimonial={testimonial} 
                  showAvatar={widget.settings.showAvatars}
                  compact={widget.settings.compactMode}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No testimonials available</p>
      )}
    </div>
  );

  const renderMetricsWidget = (widget: SocialProofWidget) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
      
      <div className={`grid ${widget.settings.displayStyle === 'grid' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{profile.metrics.totalProjects}</div>
          <div className="text-sm text-gray-600">Projects Completed</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <span className="text-2xl font-bold text-yellow-500">{profile.metrics.averageRating}</span>
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{profile.metrics.responseTime}</div>
          <div className="text-sm text-gray-600">Response Time</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{profile.metrics.clientSatisfactionScore}%</div>
          <div className="text-sm text-gray-600">Client Satisfaction</div>
        </div>
      </div>
    </div>
  );

  const renderBadgesWidget = (widget: SocialProofWidget) => {
    const earnedBadges = profile.badges.filter(badge => badge.isEarned);
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
        
        {earnedBadges.length > 0 ? (
          <div className={`grid ${widget.settings.displayStyle === 'grid' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            {earnedBadges.slice(0, widget.settings.showCount || 6).map((badge) => (
              <div 
                key={badge.id} 
                className={`flex items-center space-x-3 p-3 rounded-lg border ${getBadgeColor(badge.color)}`}
              >
                <div className="flex-shrink-0">
                  {getBadgeIcon(badge.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{badge.title}</p>
                  {!widget.settings.compactMode && (
                    <p className="text-xs opacity-75">{badge.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No badges earned yet</p>
        )}
      </div>
    );
  };

  const renderCertificationsWidget = (widget: SocialProofWidget) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
      
      <div className="space-y-3">
        {profile.trustSignals.filter(signal => signal.status === 'verified').map((signal) => (
          <div key={signal.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{signal.title}</p>
              <p className="text-xs text-gray-600">{signal.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrustScoreWidget = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border border-blue-200">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust Score</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">{profile.trustScore}/100</div>
        <p className="text-sm text-gray-600">Verified Creator Profile</p>
      </div>
    </div>
  );

  const renderWidget = (widget: SocialProofWidget) => {
    switch (widget.type) {
      case 'testimonials':
        return renderTestimonialsWidget(widget);
      case 'metrics':
        return renderMetricsWidget(widget);
      case 'badges':
        return renderBadgesWidget(widget);
      case 'certifications':
        return renderCertificationsWidget(widget);
      default:
        return null;
    }
  };

  const layoutClasses = {
    horizontal: 'flex space-x-6 overflow-x-auto',
    vertical: 'space-y-6',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6'
  };

  return (
    <div className={layoutClasses[layout]}>
      {/* Trust Score Widget (always first) */}
      {renderTrustScoreWidget()}
      
      {/* Other Widgets */}
      {visibleWidgets.map((widget) => (
        <div key={widget.id} className={layout === 'horizontal' ? 'flex-shrink-0 w-80' : ''}>
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  showAvatar?: boolean;
  compact?: boolean;
}

function TestimonialCard({ testimonial, showAvatar = true, compact = false }: TestimonialCardProps) {
  return (
    <div className={`${compact ? 'p-3' : 'p-4'} bg-gray-50 rounded-lg`}>
      <div className="flex items-start space-x-3">
        {showAvatar && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {testimonial.clientName.charAt(0)}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">{testimonial.clientName}</span>
          </div>
          
          <p className={`text-gray-800 ${compact ? 'text-sm' : 'text-sm'} leading-relaxed`}>
            "{testimonial.content.length > 120 && compact 
              ? testimonial.content.substring(0, 120) + '...' 
              : testimonial.content}"
          </p>
          
          {!compact && testimonial.projectType && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {testimonial.projectType}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
