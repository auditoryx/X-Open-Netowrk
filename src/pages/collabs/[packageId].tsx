import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/hooks/useAuth';
import { getCollabPackageById } from '@/src/lib/firestore/getCollabPackages';
import { createCollabBooking } from '@/src/lib/firestore/createCollabBooking';
import { CollabPackage, getPackageMembers, formatPackageDuration, formatPackagePrice } from '@/src/lib/types/CollabPackage';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  DollarSign, 
  Star, 
  Eye, 
  Share, 
  Calendar,
  MapPin,
  Tag,
  Music,
  Headphones,
  Mic,
  Video,
  Building,
  CheckCircle,
  MessageSquare,
  Edit,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

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

export default function CollabPackagePage() {
  const router = useRouter();
  const { packageId } = router.query;
  const { user } = useAuth();
  
  const [package_, setPackage] = useState<CollabPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    scheduledAt: '',
    scheduledTime: '',
    location: '',
    venue: '',
    address: '',
    requirements: '',
    clientNotes: ''
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);

  useEffect(() => {
    if (packageId && typeof packageId === 'string') {
      loadPackage(packageId);
    }
  }, [packageId]);

  const loadPackage = async (id: string) => {
    try {
      setLoading(true);
      const packageData = await getCollabPackageById(id);
      if (packageData) {
        setPackage(packageData);
        setError(null);
      } else {
        setError('Package not found');
      }
    } catch (err) {
      console.error('Error loading package:', err);
      setError('Failed to load package');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please log in to book this package');
      return;
    }

    if (!package_) return;

    if (!bookingData.scheduledAt || !bookingData.scheduledTime) {
      toast.error('Please select a date and time');
      return;
    }

    setSubmittingBooking(true);
    try {
      const scheduledDateTime = new Date(`${bookingData.scheduledAt}T${bookingData.scheduledTime}`);
      
      const bookingId = await createCollabBooking({
        collabPackageId: package_.id!,
        scheduledAt: scheduledDateTime,
        location: bookingData.location,
        venue: bookingData.venue,
        address: bookingData.address,
        requirements: bookingData.requirements,
        clientNotes: bookingData.clientNotes
      }, user.uid);

      toast.success('Booking request sent successfully!');
      router.push(`/dashboard/bookings/collab/${bookingId}`);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const isUserMember = package_ && user ? Object.values(package_.roles).includes(user.uid) : false;
  const isPackageCreator = package_ && user ? package_.createdBy === user.uid : false;
  const canEdit = isUserMember || isPackageCreator;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error}
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!package_) {
    return null;
  }

  const members = getPackageMembers(package_);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {package_.title}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                    {PACKAGE_TYPE_LABELS[package_.packageType]}
                  </span>
                  {package_.featured && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-sm flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {canEdit && (
                <Link
                  href={`/collabs/${package_.id}/edit`}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Link>
              )}
              
              <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                <Heart className="w-4 h-4" />
                <span>Save</span>
              </button>
              
              <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Package Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatPackagePrice(package_.totalPrice)}
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <Clock className="w-5 h-5" />
                      <span>{formatPackageDuration(package_.durationMinutes)}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {package_.description}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                {package_.viewCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{package_.viewCount} views</span>
                  </div>
                )}
                {package_.bookingCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{package_.bookingCount} bookings</span>
                  </div>
                )}
                {package_.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span>{package_.rating.toFixed(1)} ({package_.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Team Members
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => {
                  const Icon = ROLE_ICONS[member.role];
                  const memberShare = package_.priceBreakdown?.[member.role] || 0;
                  
                  return (
                    <div
                      key={member.uid}
                      className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="relative">
                        {member.profileImage ? (
                          <img
                            src={member.profileImage}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <Icon className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        {member.verified && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {member.role}
                        </p>
                        {memberShare > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {formatPackagePrice(memberShare)} share
                          </p>
                        )}
                      </div>
                      
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Package Details
              </h2>
              
              <div className="space-y-6">
                {/* Tags */}
                {package_.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <Tag className="w-5 h-5 mr-2" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {package_.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Genres */}
                {package_.genre && package_.genre.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {package_.genre.map(g => (
                        <span
                          key={g}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Locations */}
                {package_.availableLocations && package_.availableLocations.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Available Locations
                    </h3>
                    <div className="space-y-2">
                      {package_.availableLocations.map(location => (
                        <div key={location} className="text-gray-600 dark:text-gray-400">
                          {location}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipment */}
                {package_.equipment && package_.equipment.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Equipment Provided
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {package_.equipment.map(item => (
                        <div key={item} className="text-gray-600 dark:text-gray-400 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Form */}
            {!isUserMember && package_.status === 'active' && package_.isPublic && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Book This Package
                </h3>
                
                {!showBookingForm ? (
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Book Now - {formatPackagePrice(package_.totalPrice)}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={bookingData.scheduledAt}
                          onChange={(e) => setBookingData({ ...bookingData, scheduledAt: e.target.value })}
                          min={format(new Date(), 'yyyy-MM-dd')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Time *
                        </label>
                        <input
                          type="time"
                          value={bookingData.scheduledTime}
                          onChange={(e) => setBookingData({ ...bookingData, scheduledTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location/Venue
                      </label>
                      <input
                        type="text"
                        value={bookingData.venue}
                        onChange={(e) => setBookingData({ ...bookingData, venue: e.target.value })}
                        placeholder="Studio name or venue"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Requirements
                      </label>
                      <textarea
                        value={bookingData.requirements}
                        onChange={(e) => setBookingData({ ...bookingData, requirements: e.target.value })}
                        placeholder="Any specific requirements or notes..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowBookingForm(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBooking}
                        disabled={submittingBooking}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        {submittingBooking ? 'Booking...' : 'Submit Request'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Package Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Package Information
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <span className="text-gray-900 dark:text-white">
                    {package_.createdAt ? format(package_.createdAt.toDate(), 'MMM d, yyyy') : 'Unknown'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`capitalize ${
                    package_.status === 'active' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {package_.status}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Team Size</span>
                  <span className="text-gray-900 dark:text-white">
                    {members.length} members
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Visibility</span>
                  <span className="text-gray-900 dark:text-white">
                    {package_.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Have Questions?
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Get in touch with the team to discuss your project requirements.
              </p>
              
              <button className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
