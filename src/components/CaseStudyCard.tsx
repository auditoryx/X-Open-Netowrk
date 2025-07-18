'use client';

import { Star, Play, ExternalLink, TrendingUp, Users, DollarSign } from 'lucide-react';
import Image from 'next/image';

interface CaseStudyData {
  id: string;
  creatorName: string;
  creatorRole: string;
  profileImage: string;
  beforeStats: {
    monthlyEarnings: number;
    clients: number;
    rating: number;
  };
  afterStats: {
    monthlyEarnings: number;
    clients: number;
    rating: number;
  };
  timeframe: string;
  testimonial: string;
  projectTitle: string;
  projectDescription: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video';
  tags: string[];
  featured?: boolean;
}

interface CaseStudyCardProps {
  caseStudy: CaseStudyData;
  variant?: 'default' | 'featured' | 'compact';
}

export default function CaseStudyCard({ caseStudy, variant = 'default' }: CaseStudyCardProps) {
  const {
    creatorName,
    creatorRole,
    profileImage,
    beforeStats,
    afterStats,
    timeframe,
    testimonial,
    projectTitle,
    projectDescription,
    mediaUrl,
    mediaType,
    tags,
    featured
  } = caseStudy;

  const earningsGrowth = ((afterStats.monthlyEarnings - beforeStats.monthlyEarnings) / beforeStats.monthlyEarnings * 100);
  const clientGrowth = ((afterStats.clients - beforeStats.clients) / beforeStats.clients * 100);

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <Image
            src={profileImage}
            alt={creatorName}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{creatorName}</h3>
            <p className="text-sm text-gray-600">{creatorRole}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-green-600 font-medium">
                +{earningsGrowth.toFixed(0)}% earnings
              </span>
              <span className="text-blue-600 font-medium">
                +{clientGrowth.toFixed(0)}% clients
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">"{testimonial}"</p>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-200 p-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          <span className="text-sm font-medium text-blue-800">Featured Success Story</span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Creator Info & Story */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Image
                src={profileImage}
                alt={creatorName}
                width={64}
                height={64}
                className="rounded-full"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{creatorName}</h2>
                <p className="text-gray-600">{creatorRole}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < afterStats.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">({afterStats.rating}/5)</span>
                </div>
              </div>
            </div>

            <blockquote className="text-lg text-gray-700 italic mb-6">
              "{testimonial}"
            </blockquote>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Project: {projectTitle}</h3>
              <p className="text-gray-600">{projectDescription}</p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats & Media */}
          <div className="space-y-6">
            {/* Growth Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Growth in {timeframe}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-lg font-bold">+{earningsGrowth.toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-gray-600">Monthly Earnings</p>
                  <p className="text-sm font-medium text-gray-900">
                    ${beforeStats.monthlyEarnings.toLocaleString()} → ${afterStats.monthlyEarnings.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-lg font-bold">+{clientGrowth.toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-gray-600">Active Clients</p>
                  <p className="text-sm font-medium text-gray-900">
                    {beforeStats.clients} → {afterStats.clients}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <Star className="w-4 h-4" />
                    <span className="text-lg font-bold">{afterStats.rating}</span>
                  </div>
                  <p className="text-xs text-gray-600">Rating</p>
                  <p className="text-sm font-medium text-gray-900">
                    {beforeStats.rating} → {afterStats.rating}
                  </p>
                </div>
              </div>
            </div>

            {/* Media Preview */}
            {mediaUrl && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-900 mb-3">Project Sample</h4>
                <div className="relative rounded-lg overflow-hidden">
                  {mediaType === 'video' ? (
                    <div className="relative">
                      <video
                        src={mediaUrl}
                        className="w-full h-32 object-cover"
                        poster="/placeholder-video.jpg"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={mediaUrl}
                      alt="Project sample"
                      width={300}
                      height={128}
                      className="w-full h-32 object-cover"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
      {/* Media Header */}
      {mediaUrl && (
        <div className="relative h-48">
          {mediaType === 'video' ? (
            <div className="relative w-full h-full">
              <video
                src={mediaUrl}
                className="w-full h-full object-cover"
                poster="/placeholder-video.jpg"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Play className="w-10 h-10 text-white" />
              </div>
            </div>
          ) : (
            <Image
              src={mediaUrl}
              alt="Project sample"
              width={400}
              height={192}
              className="w-full h-full object-cover"
            />
          )}
          {featured && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-4">
          <Image
            src={profileImage}
            alt={creatorName}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{creatorName}</h3>
            <p className="text-sm text-gray-600">{creatorRole}</p>
          </div>
        </div>

        {/* Project Info */}
        <h4 className="font-medium text-gray-900 mb-2">{projectTitle}</h4>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{projectDescription}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">+{earningsGrowth.toFixed(0)}%</div>
            <div className="text-xs text-gray-600">Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">+{clientGrowth.toFixed(0)}%</div>
            <div className="text-xs text-gray-600">Clients</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{afterStats.rating}</div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
        </div>

        {/* Testimonial */}
        <blockquote className="text-sm text-gray-700 italic mb-4">
          "{testimonial}"
        </blockquote>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-1 text-gray-500 text-xs">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}