'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { skillsBadgeService, CreatorProfile, ExpertiseBadge, SkillCategory } from '@/lib/services/skillsBadgeService';
import { 
  Star, 
  Award, 
  Clock, 
  DollarSign, 
  MapPin, 
  Globe, 
  Mail, 
  Phone,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  Plus,
  Edit,
  Save,
  X,
  Shield,
  Heart,
  MessageCircle,
  Briefcase,
  Target,
  Zap,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EnhancedProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [badges, setBadges] = useState<ExpertiseBadge[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'availability' | 'pricing'>('overview');

  useEffect(() => {
    if (!user?.uid) return;
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [profileData, badgesData, categoriesData, analyticsData] = await Promise.all([
        skillsBadgeService.getCreatorProfile(user.uid),
        skillsBadgeService.getCreatorBadges(user.uid),
        skillsBadgeService.getAvailableBadges(),
        skillsBadgeService.getBadgeAnalytics(user.uid)
      ]);

      setProfile(profileData);
      setBadges(badgesData);
      setSkillCategories(categoriesData);
      setAnalytics(analyticsData);

      // Create profile if it doesn't exist
      if (!profileData) {
        await skillsBadgeService.createOrUpdateProfile(user.uid, {
          displayName: user.displayName || 'Creator',
          tagline: 'Creative Professional',
          bio: 'Passionate creator ready to bring your vision to life.'
        });
        loadProfileData(); // Reload after creation
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updates: Partial<CreatorProfile>) => {
    if (!user?.uid) return;

    try {
      await skillsBadgeService.updateCreatorProfile(user.uid, updates);
      toast.success('Profile updated successfully');
      setEditMode(false);
      loadProfileData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleUpdateAvailability = async (
    status: 'available' | 'busy' | 'unavailable',
    nextAvailable?: Date
  ) => {
    if (!user?.uid) return;

    try {
      await skillsBadgeService.updateAvailabilityStatus(user.uid, status, nextAvailable);
      toast.success('Availability updated');
      loadProfileData();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleToggleFeaturedBadge = async (badgeId: string) => {
    if (!user?.uid || !profile) return;

    try {
      const currentFeatured = profile.featuredBadges || [];
      let newFeatured;

      if (currentFeatured.includes(badgeId)) {
        newFeatured = currentFeatured.filter(id => id !== badgeId);
      } else {
        if (currentFeatured.length >= 6) {
          toast.error('You can only feature up to 6 badges');
          return;
        }
        newFeatured = [...currentFeatured, badgeId];
      }

      await skillsBadgeService.updateFeaturedBadges(user.uid, newFeatured);
      toast.success('Featured badges updated');
      loadProfileData();
    } catch (error) {
      console.error('Error updating featured badges:', error);
      toast.error('Failed to update featured badges');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Profile</h1>
            <p className="text-gray-600 mt-2">Showcase your skills and build credibility</p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {editMode ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {editMode ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Header Card */}
        <ProfileHeaderCard 
          profile={profile} 
          editMode={editMode} 
          onSave={handleSaveProfile}
        />

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Skill Badges</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalBadges}</p>
                </div>
                <Award className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Skills</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.verifiedBadges}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Endorsements</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.endorsementCount}</p>
                </div>
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Score</p>
                  <p className="text-2xl font-bold text-orange-600">85%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'skills', label: 'Skills & Badges', icon: Award },
                { id: 'availability', label: 'Availability', icon: Calendar },
                { id: 'pricing', label: 'Pricing', icon: DollarSign }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <ProfileOverview profile={profile} badges={badges} analytics={analytics} />
            )}
            {activeTab === 'skills' && (
              <SkillsBadgesTab 
                badges={badges} 
                skillCategories={skillCategories}
                profile={profile}
                onToggleFeatured={handleToggleFeaturedBadge}
              />
            )}
            {activeTab === 'availability' && (
              <AvailabilityTab 
                profile={profile} 
                onUpdateAvailability={handleUpdateAvailability}
                onSave={handleSaveProfile}
              />
            )}
            {activeTab === 'pricing' && (
              <PricingTab profile={profile} onSave={handleSaveProfile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileHeaderCardProps {
  profile: CreatorProfile | null;
  editMode: boolean;
  onSave: (updates: Partial<CreatorProfile>) => void;
}

function ProfileHeaderCard({ profile, editMode, onSave }: ProfileHeaderCardProps) {
  const [editData, setEditData] = useState({
    displayName: profile?.displayName || '',
    tagline: profile?.tagline || '',
    bio: profile?.bio || ''
  });

  useEffect(() => {
    if (profile) {
      setEditData({
        displayName: profile.displayName,
        tagline: profile.tagline,
        bio: profile.bio
      });
    }
  }, [profile]);

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      
      {/* Profile Content */}
      <div className="p-6 relative">
        {/* Avatar */}
        <div className="absolute -top-16 left-6">
          <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            {profile?.avatar ? (
              <Image src={profile.avatar} alt="Avatar" width={96} height={96} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div className="ml-32">
          {editMode ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editData.displayName}
                onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
                className="text-2xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                placeholder="Your display name"
              />
              <input
                type="text"
                value={editData.tagline}
                onChange={(e) => setEditData(prev => ({ ...prev, tagline: e.target.value }))}
                className="text-lg text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                placeholder="Your professional tagline"
              />
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="text-gray-700 bg-transparent border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none w-full p-3"
                placeholder="Tell us about yourself and your expertise..."
              />
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900">{profile?.displayName}</h2>
              <p className="text-lg text-gray-600 mt-1">{profile?.tagline}</p>
              <p className="text-gray-700 mt-3 max-w-2xl">{profile?.bio}</p>
              
              {/* Social Proof */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{profile?.socialProof.averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">({profile?.socialProof.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{profile?.socialProof.totalProjects}</span>
                  <span className="text-gray-500">projects completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{profile?.socialProof.repeatClients}</span>
                  <span className="text-gray-500">repeat clients</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Availability Status */}
        <div className="absolute top-6 right-6">
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
            profile?.availability.status === 'available' 
              ? 'bg-green-100 text-green-800' 
              : profile?.availability.status === 'busy'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              profile?.availability.status === 'available' 
                ? 'bg-green-500' 
                : profile?.availability.status === 'busy'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}></div>
            {profile?.availability.status === 'available' && 'Available'}
            {profile?.availability.status === 'busy' && 'Busy'}
            {profile?.availability.status === 'unavailable' && 'Unavailable'}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileOverview({ profile, badges, analytics }: any) {
  const featuredBadges = badges.filter((badge: ExpertiseBadge) => 
    profile?.featuredBadges?.includes(badge.badge.id)
  );

  return (
    <div className="space-y-6">
      {/* Featured Skills */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Skills</h3>
        {featuredBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredBadges.map((expertiseBadge: ExpertiseBadge) => (
              <div key={expertiseBadge.id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: expertiseBadge.badge.color }}
                  >
                    {expertiseBadge.badge.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{expertiseBadge.badge.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{expertiseBadge.badge.level}</p>
                  </div>
                  {expertiseBadge.badge.verified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{expertiseBadge.badge.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{expertiseBadge.endorsements.length} endorsements</span>
                  <span>{expertiseBadge.clientValidations.length} client validations</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No featured skills yet. Add some skills to showcase your expertise!</p>
        )}
      </div>

      {/* Quick Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-lg font-semibold text-gray-900">{profile?.availability.responseTime}</p>
              </div>
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On-Time Delivery</p>
                <p className="text-lg font-semibold text-gray-900">{profile?.socialProof.onTimeDelivery}%</p>
              </div>
              <Target className="w-6 h-6 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Client Satisfaction</p>
                <p className="text-lg font-semibold text-gray-900">{profile?.socialProof.averageRating.toFixed(1)}/5.0</p>
              </div>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Skill Growth Chart */}
      {analytics?.skillGrowth && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Development</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">Badges earned over time</p>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-end gap-2 h-32">
              {analytics.skillGrowth.map((data: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t w-full"
                    style={{ height: `${(data.badgesEarned / 3) * 100}%` }}
                  ></div>
                  <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillsBadgesTab({ badges, skillCategories, profile, onToggleFeatured }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter((badge: ExpertiseBadge) => badge.badge.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Skills ({badges.length})
        </button>
        {skillCategories.map((category: SkillCategory) => {
          const count = badges.filter((badge: ExpertiseBadge) => badge.badge.category === category.id).length;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((expertiseBadge: ExpertiseBadge) => (
          <SkillBadgeCard 
            key={expertiseBadge.id}
            expertiseBadge={expertiseBadge}
            isFeatured={profile?.featuredBadges?.includes(expertiseBadge.badge.id)}
            onToggleFeatured={() => onToggleFeatured(expertiseBadge.badge.id)}
          />
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No skills in this category yet</h3>
          <p className="text-gray-600">Complete projects to earn skill badges and build your expertise profile</p>
        </div>
      )}
    </div>
  );
}

function SkillBadgeCard({ expertiseBadge, isFeatured, onToggleFeatured }: any) {
  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: expertiseBadge.badge.color }}
          >
            {expertiseBadge.badge.icon}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{expertiseBadge.badge.name}</h4>
            <p className="text-sm text-gray-600 capitalize">{expertiseBadge.badge.level}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {expertiseBadge.badge.verified && (
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600">Verified</span>
            </div>
          )}
          <button
            onClick={onToggleFeatured}
            className={`p-1 rounded ${
              isFeatured 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Star className="w-4 h-4" fill={isFeatured ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{expertiseBadge.badge.description}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Endorsements</span>
          <span className="font-medium">{expertiseBadge.endorsements.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Client Validations</span>
          <span className="font-medium">{expertiseBadge.clientValidations.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Projects Completed</span>
          <span className="font-medium">{expertiseBadge.stats.projectsCompleted}</span>
        </div>
      </div>

      {expertiseBadge.endorsements.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Recent Endorsements:</p>
          <div className="space-y-1">
            {expertiseBadge.endorsements.slice(0, 2).map((endorsement: any, index: number) => (
              <div key={index} className="text-xs text-gray-600">
                <span className="font-medium">{endorsement.userName}</span>
                {endorsement.comment && (
                  <span>: "{endorsement.comment.substring(0, 50)}..."</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AvailabilityTab({ profile, onUpdateAvailability, onSave }: any) {
  const [editData, setEditData] = useState({
    status: profile?.availability.status || 'available',
    timezone: profile?.availability.timezone || 'UTC',
    responseTime: profile?.availability.responseTime || 'within 24 hours',
    workingHours: profile?.availability.workingHours || {
      start: '09:00',
      end: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  });

  const handleSave = () => {
    onSave({ availability: editData });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Availability Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Current Status</h3>
          <div className="space-y-3">
            {[
              { value: 'available', label: 'Available', color: 'green', description: 'Ready to take on new projects' },
              { value: 'busy', label: 'Busy', color: 'yellow', description: 'Limited availability' },
              { value: 'unavailable', label: 'Unavailable', color: 'red', description: 'Not accepting new work' }
            ].map(status => (
              <label key={status.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value={status.value}
                  checked={editData.status === status.value}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="text-blue-600"
                />
                <div className={`w-3 h-3 rounded-full bg-${status.color}-500`}></div>
                <div>
                  <p className="font-medium text-gray-900">{status.label}</p>
                  <p className="text-sm text-gray-600">{status.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Working Hours</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={editData.workingHours.start}
                  onChange={(e) => setEditData(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={editData.workingHours.end}
                  onChange={(e) => setEditData(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
              <div className="grid grid-cols-4 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <label key={day} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.workingHours.days.includes(day)}
                      onChange={(e) => {
                        const newDays = e.target.checked
                          ? [...editData.workingHours.days, day]
                          : editData.workingHours.days.filter(d => d !== day);
                        setEditData(prev => ({
                          ...prev,
                          workingHours: { ...prev.workingHours, days: newDays }
                        }));
                      }}
                      className="text-blue-600"
                    />
                    <span className="text-sm capitalize">{day.substring(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Response Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Response Time</label>
          <select
            value={editData.responseTime}
            onChange={(e) => setEditData(prev => ({ ...prev, responseTime: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="within 1 hour">Within 1 hour</option>
            <option value="within 2 hours">Within 2 hours</option>
            <option value="within 4 hours">Within 4 hours</option>
            <option value="within 24 hours">Within 24 hours</option>
            <option value="within 48 hours">Within 48 hours</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={editData.timezone}
            onChange={(e) => setEditData(prev => ({ ...prev, timezone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Central European Time</option>
            <option value="Asia/Tokyo">Japan Standard Time</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Save Availability Settings
      </button>
    </div>
  );
}

function PricingTab({ profile, onSave }: any) {
  const [editData, setEditData] = useState({
    hourlyRate: profile?.basePricing.hourlyRate || '',
    projectMinimum: profile?.basePricing.projectMinimum || '',
    currency: profile?.basePricing.currency || 'USD',
    negotiable: profile?.basePricing.negotiable ?? true
  });

  const handleSave = () => {
    onSave({ 
      basePricing: {
        ...editData,
        hourlyRate: editData.hourlyRate ? Number(editData.hourlyRate) : undefined,
        projectMinimum: editData.projectMinimum ? Number(editData.projectMinimum) : undefined
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Pricing Calculator</h3>
            <p className="text-sm text-blue-700 mt-1">
              Set your base rates to help clients understand your pricing. You can always negotiate project-specific rates.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={editData.hourlyRate}
              onChange={(e) => setEditData(prev => ({ ...prev, hourlyRate: e.target.value }))}
              placeholder="50"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">Your standard hourly rate for consultation and smaller tasks</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Minimum</label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={editData.projectMinimum}
              onChange={(e) => setEditData(prev => ({ ...prev, projectMinimum: e.target.value }))}
              placeholder="500"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">Minimum budget for project-based work</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={editData.currency}
            onChange={(e) => setEditData(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="negotiable"
            checked={editData.negotiable}
            onChange={(e) => setEditData(prev => ({ ...prev, negotiable: e.target.checked }))}
            className="text-blue-600"
          />
          <label htmlFor="negotiable" className="text-sm font-medium text-gray-700">
            Rates are negotiable
          </label>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Pricing Preview</h3>
        <div className="space-y-2">
          {editData.hourlyRate && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Hourly Rate:</span> {editData.currency} {editData.hourlyRate}/hour
            </p>
          )}
          {editData.projectMinimum && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Project Minimum:</span> {editData.currency} {editData.projectMinimum}
            </p>
          )}
          <p className="text-sm text-gray-700">
            <span className="font-medium">Negotiable:</span> {editData.negotiable ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Save Pricing Settings
      </button>
    </div>
  );
}
