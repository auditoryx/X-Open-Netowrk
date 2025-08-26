import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createCollabPackage, CreateCollabPackageData } from '@/lib/firestore/createCollabPackage';
import { getUserProfile } from '@/lib/firestore/getUserProfile';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  Users, 
  DollarSign, 
  Clock, 
  MapPin, 
  Tag, 
  Music, 
  Headphones, 
  Mic, 
  Video, 
  Building,
  Search,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { CollabPackage } from '@/lib/types/CollabPackage';
import toast from 'react-hot-toast';

interface CreateCollabPackageFormProps {
  onPackageCreated?: (packageId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateCollabPackageData>;
}

interface UserSearchResult {
  uid: string;
  name: string;
  profileImage?: string;
  verified: boolean;
  role?: string;
}

const PACKAGE_TYPES: { value: CollabPackage['packageType']; label: string; description: string }[] = [
  { value: 'studio_session', label: 'Studio Session', description: 'Recording, mixing, mastering in a professional studio' },
  { value: 'live_performance', label: 'Live Performance', description: 'Concerts, gigs, live events' },
  { value: 'video_production', label: 'Video Production', description: 'Music videos, promotional content, live streams' },
  { value: 'custom', label: 'Custom', description: 'Other collaborative projects' }
];

const ROLE_ICONS = {
  artist: Music,
  producer: Headphones,
  engineer: Mic,
  videographer: Video,
  studio: Building
};

const COMMON_TAGS = [
  'hip-hop', 'pop', 'rock', 'jazz', 'electronic', 'r&b', 'country', 'indie',
  'mixing', 'mastering', 'recording', 'songwriting', 'vocals', 'instruments',
  'live', 'studio', 'remote', 'professional', 'beginner-friendly', 'experienced'
];

const COMMON_GENRES = [
  'Hip-Hop', 'Pop', 'Rock', 'Jazz', 'Electronic', 'R&B', 'Country', 'Indie',
  'Alternative', 'Classical', 'Blues', 'Reggae', 'Folk', 'Metal', 'Funk'
];

export function CreateCollabPackageForm({ 
  onPackageCreated, 
  onCancel, 
  initialData 
}: CreateCollabPackageFormProps) {
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [packageType, setPackageType] = useState<CollabPackage['packageType']>(
    initialData?.packageType || 'studio_session'
  );
  const [totalPrice, setTotalPrice] = useState(initialData?.totalPrice || 0);
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.durationMinutes || 120
  );
  const [isPublic, setIsPublic] = useState(initialData?.isPublic !== false);
  
  // Role assignments
  const [roles, setRoles] = useState({
    artistUid: initialData?.roles?.artistUid || '',
    producerUid: initialData?.roles?.producerUid || '',
    engineerUid: initialData?.roles?.engineerUid || '',
    videographerUid: initialData?.roles?.videographerUid || '',
    studioUid: initialData?.roles?.studioUid || ''
  });
  
  // Price breakdown
  const [priceBreakdown, setPriceBreakdown] = useState({
    artist: initialData?.priceBreakdown?.artist || 0,
    producer: initialData?.priceBreakdown?.producer || 0,
    engineer: initialData?.priceBreakdown?.engineer || 0,
    videographer: initialData?.priceBreakdown?.videographer || 0,
    studio: initialData?.priceBreakdown?.studio || 0
  });
  
  // Tags and metadata
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [genre, setGenre] = useState<string[]>(initialData?.genre || []);
  const [locations, setLocations] = useState<string[]>(initialData?.availableLocations || []);
  const [locationInput, setLocationInput] = useState('');
  const [equipment, setEquipment] = useState<string[]>(initialData?.equipment || []);
  const [equipmentInput, setEquipmentInput] = useState('');
  
  // User search
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchingFor, setSearchingFor] = useState<keyof typeof roles | null>(null);
  const [roleDetails, setRoleDetails] = useState<{[key: string]: UserSearchResult}>({});
  
  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Auto-assign current user if not already assigned
  useEffect(() => {
    if (user && !Object.values(roles).includes(user.uid)) {
      // Try to assign user to their primary role if available
      // This would need to be determined from user profile
      // For now, we'll leave it for manual assignment
    }
  }, [user, roles]);

  // Auto-calculate price breakdown when roles or total price changes
  useEffect(() => {
    const assignedRoles = Object.entries(roles).filter(([_, uid]) => uid);
    if (assignedRoles.length > 0 && totalPrice > 0) {
      const splitAmount = Math.floor((totalPrice / assignedRoles.length) * 100) / 100;
      const newBreakdown = { ...priceBreakdown };
      
      assignedRoles.forEach(([role, _]) => {
        const roleKey = role.replace('Uid', '') as keyof typeof priceBreakdown;
        newBreakdown[roleKey] = splitAmount;
      });
      
      // Clear breakdown for unassigned roles
      Object.keys(priceBreakdown).forEach(role => {
        if (!assignedRoles.some(([r]) => r.replace('Uid', '') === role)) {
          newBreakdown[role as keyof typeof priceBreakdown] = 0;
        }
      });
      
      setPriceBreakdown(newBreakdown);
    }
  }, [roles, totalPrice]);

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // This would be replaced with actual user search
      // For demo, we'll simulate search results
      const mockResults: UserSearchResult[] = [
        {
          uid: 'user-1',
          name: 'Alex Producer',
          profileImage: '/api/placeholder/40/40',
          verified: true,
          role: 'producer'
        },
        {
          uid: 'user-2',
          name: 'Sam Artist',
          profileImage: '/api/placeholder/40/40',
          verified: true,
          role: 'artist'
        },
        {
          uid: 'user-3',
          name: 'Jordan Engineer',
          profileImage: '/api/placeholder/40/40',
          verified: false,
          role: 'engineer'
        }
      ];
      
      const filtered = mockResults.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const assignRole = (role: keyof typeof roles, user: UserSearchResult) => {
    setRoles({ ...roles, [role]: user.uid });
    setRoleDetails({ ...roleDetails, [user.uid]: user });
    setSearchingFor(null);
    setUserSearch('');
    setSearchResults([]);
  };

  const removeRole = (role: keyof typeof roles) => {
    const uid = roles[role];
    setRoles({ ...roles, [role]: '' });
    
    // Remove from role details if not used elsewhere
    if (uid && !Object.values({ ...roles, [role]: '' }).includes(uid)) {
      const newDetails = { ...roleDetails };
      delete newDetails[uid];
      setRoleDetails(newDetails);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput('');
    }
  };

  const removeLocation = (locationToRemove: string) => {
    setLocations(locations.filter(loc => loc !== locationToRemove));
  };

  const addEquipment = () => {
    if (equipmentInput.trim() && !equipment.includes(equipmentInput.trim())) {
      setEquipment([...equipment, equipmentInput.trim()]);
      setEquipmentInput('');
    }
  };

  const removeEquipment = (equipmentToRemove: string) => {
    setEquipment(equipment.filter(eq => eq !== equipmentToRemove));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!title.trim()) {
      newErrors.title = 'Package title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Package description is required';
    }

    if (totalPrice <= 0) {
      newErrors.totalPrice = 'Total price must be greater than 0';
    }

    if (durationMinutes <= 0) {
      newErrors.durationMinutes = 'Duration must be greater than 0';
    }

    const assignedRoles = Object.values(roles).filter(uid => uid);
    if (assignedRoles.length === 0) {
      newErrors.roles = 'At least one team member must be assigned';
    }

    // Verify current user is assigned to a role
    if (user && !assignedRoles.includes(user.uid)) {
      newErrors.roles = 'You must assign yourself to one of the roles';
    }

    // Validate price breakdown
    const breakdownTotal = Object.values(priceBreakdown).reduce((sum, amount) => sum + amount, 0);
    if (Math.abs(breakdownTotal - totalPrice) > 0.01) {
      newErrors.priceBreakdown = 'Price breakdown must equal total price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a collaboration package');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      const packageData: CreateCollabPackageData = {
        title: title.trim(),
        description: description.trim(),
        roles,
        totalPrice,
        priceBreakdown,
        durationMinutes,
        tags,
        media: [], // Media upload would be handled separately
        availableLocations: locations,
        equipment,
        genre,
        packageType,
        isPublic
      };

      const packageId = await createCollabPackage(packageData, user.uid);
      
      toast.success('Collaboration package created successfully!');
      onPackageCreated?.(packageId);
      
    } catch (error) {
      console.error('Error creating collaboration package:', error);
      toast.error('Failed to create collaboration package. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create Collaboration Package
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Build a team package with multiple creators and set your collaborative offering
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Package Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete Hip-Hop Production Team"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your collaboration package offers..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Package Type
            </label>
            <select
              value={packageType}
              onChange={(e) => setPackageType(e.target.value as CollabPackage['packageType'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {PACKAGE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Members
          </h3>
          
          {errors.roles && (
            <div className="flex items-center space-x-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.roles}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(ROLE_ICONS).map(([roleKey, Icon]) => {
              const roleUidKey = `${roleKey}Uid` as keyof typeof roles;
              const assignedUid = roles[roleUidKey];
              const assignedUser = assignedUid ? roleDetails[assignedUid] : null;

              return (
                <div key={roleKey} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {roleKey}
                      </span>
                    </div>
                    {assignedUser && (
                      <button
                        type="button"
                        onClick={() => removeRole(roleUidKey)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {assignedUser ? (
                    <div className="flex items-center space-x-3">
                      {assignedUser.profileImage ? (
                        <Image
                          src={assignedUser.profileImage}
                          alt={assignedUser.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {assignedUser.name}
                        </p>
                        {assignedUser.verified && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSearchingFor(roleUidKey)}
                      className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                      <Plus className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-sm">Add {roleKey}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Search Modal */}
          {searchingFor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Search for {searchingFor.replace('Uid', '')}
                    </h3>
                    <button
                      onClick={() => {
                        setSearchingFor(null);
                        setUserSearch('');
                        setSearchResults([]);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      placeholder="Search by name or username..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="space-y-2">
                        {searchResults.map(user => (
                          <button
                            key={user.uid}
                            type="button"
                            onClick={() => assignRole(searchingFor, user)}
                            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {user.profileImage ? (
                              <Image
                                src={user.profileImage}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                            )}
                            <div className="text-left">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                {user.role && (
                                  <span className="capitalize">{user.role}</span>
                                )}
                                {user.verified && (
                                  <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : userSearch.trim() ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No users found matching "{userSearch}"
                      </p>
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        Start typing to search for users
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pricing & Duration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.totalPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              {errors.totalPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.totalPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  placeholder="120"
                  min="30"
                  step="30"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.durationMinutes ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatDuration(durationMinutes)}
              </p>
              {errors.durationMinutes && (
                <p className="text-red-500 text-sm mt-1">{errors.durationMinutes}</p>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          {Object.values(roles).some(uid => uid) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Revenue Split
              </label>
              <div className="space-y-3">
                {Object.entries(roles).map(([roleKey, uid]) => {
                  if (!uid) return null;
                  
                  const role = roleKey.replace('Uid', '') as keyof typeof priceBreakdown;
                  const user = roleDetails[uid];
                  const Icon = ROLE_ICONS[role];

                  return (
                    <div key={roleKey} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user?.name || 'Unknown User'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 capitalize">
                          ({role})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={priceBreakdown[role]}
                          onChange={(e) => setPriceBreakdown({
                            ...priceBreakdown,
                            [role]: Number(e.target.value)
                          })}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  );
                })}
                
                {errors.priceBreakdown && (
                  <p className="text-red-500 text-sm">{errors.priceBreakdown}</p>
                )}
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total breakdown: ${Object.values(priceBreakdown).reduce((sum, val) => sum + val, 0).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tags and Metadata */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tags & Details
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {COMMON_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (!tags.includes(tag)) {
                      setTags([...tags, tag]);
                    }
                  }}
                  className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Genre
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {COMMON_GENRES.map(g => (
                <label key={g} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={genre.includes(g)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGenre([...genre, g]);
                      } else {
                        setGenre(genre.filter(genre => genre !== g));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Make this package publicly visible
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Package'}
          </button>
        </div>
      </form>
    </div>
  );
}
