import { useState, useEffect } from 'react';
import { createEventTeamBooking } from '@/lib/firestore/createEventTeamBooking';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { searchCreatorsByRole, CreatorSearchResult } from '@/lib/firestore/searchCreators';
import Image from 'next/image';

const AVAILABLE_ROLES = [
  'artist',
  'producer', 
  'engineer',
  'videographer',
  'studio',
  'editor',
  'designer'
];

export default function EventBookingForm() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    totalBudget: '',
  });
  
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<{ [role: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCreators, setAvailableCreators] = useState<{ [role: string]: CreatorSearchResult[] }>({});
  const [isLoadingCreators, setIsLoadingCreators] = useState<{ [role: string]: boolean }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        // Remove role and its selected creator
        const newRoles = prev.filter(r => r !== role);
        const newCreators = { ...selectedCreators };
        delete newCreators[role];
        setSelectedCreators(newCreators);
        return newRoles;
      } else {
        // Add role and fetch creators for this role
        fetchCreatorsForRole(role);
        return [...prev, role];
      }
    });
  };

  const handleCreatorSelect = (role: string, creatorUid: string) => {
    setSelectedCreators(prev => ({
      ...prev,
      [role]: creatorUid
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create an event booking.');
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error('Please select at least one role for your event.');
      return;
    }

    if (!formData.eventDate) {
      toast.error('Please select an event date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventId = await createEventTeamBooking({
        clientUid: user.uid,
        title: formData.title,
        description: formData.description,
        eventDate: new Date(formData.eventDate),
        location: formData.location,
        rolesNeeded: selectedRoles,
        selectedCreators,
        totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : undefined,
      });

      toast.success('Event team booking created successfully!');
      router.push(`/events/${eventId}`);
    } catch (error) {
      console.error('Failed to create event booking:', error);
      toast.error('Failed to create event booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load creators when a role is selected
  const fetchCreatorsForRole = async (role: string) => {
    if (!availableCreators[role]) {
      setIsLoadingCreators(prev => ({ ...prev, [role]: true }));
      try {
        const creators = await searchCreatorsByRole(role, 8);
        setAvailableCreators(prev => ({ ...prev, [role]: creators }));
      } catch (error) {
        console.error(`Error fetching ${role} creators:`, error);
        toast.error(`Failed to load ${role} options`);
      } finally {
        setIsLoadingCreators(prev => ({ ...prev, [role]: false }));
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Event Team Booking</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Event Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            placeholder="e.g., Music Video Shoot, Album Recording Session"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Event Date</label>
          <input
            type="datetime-local"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            placeholder="Studio address or event venue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-3 border rounded-lg"
            placeholder="Describe your event, vision, and requirements..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Total Budget (Optional)</label>
          <input
            type="number"
            name="totalBudget"
            value={formData.totalBudget}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            placeholder="e.g., 5000"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Select Required Roles</label>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_ROLES.map(role => (
              <label key={role} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  className="w-4 h-4"
                />
                <span className="capitalize">{role}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedRoles.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Creator Selection (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Leave blank to let the system recommend creators, or select specific creators for each role.
            </p>
            {selectedRoles.map(role => (
              <div key={role} className="mb-4">
                <label className="block text-sm font-medium mb-2 capitalize">{role}</label>
                {isLoadingCreators[role] ? (
                  <div className="animate-pulse h-12 bg-gray-200 rounded-lg"></div>
                ) : (
                  <>
                    {availableCreators[role] && availableCreators[role].length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500">Select a creator or leave blank for automatic recommendation</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div 
                            className={`p-3 border rounded-lg flex items-center cursor-pointer ${
                              !selectedCreators[role] ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleCreatorSelect(role, '')}
                          >
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9h2v2H9v-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-sm">Auto-Select</p>
                              <p className="text-xs text-gray-500">Let system recommend</p>
                            </div>
                          </div>
                          
                          {availableCreators[role].map(creator => (
                            <div
                              key={creator.uid}
                              className={`p-3 border rounded-lg flex items-center cursor-pointer ${
                                selectedCreators[role] === creator.uid ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => handleCreatorSelect(role, creator.uid)}
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                                {creator.profileImage ? (
                                  <Image 
                                    src={creator.profileImage} 
                                    alt={creator.displayName} 
                                    width={32} 
                                    height={32} 
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                    {creator.displayName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{creator.displayName}</p>
                                <div className="flex items-center">
                                  {creator.verified && (
                                    <span className="mr-1 text-blue-500">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">{creator.tier}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-gray-500">No {role}s available</p>
                        <button 
                          className="text-blue-500 text-sm hover:underline mt-1"
                          onClick={() => fetchCreatorsForRole(role)}
                        >
                          Retry search
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Event...' : 'Create Event Team Booking'}
        </button>
      </form>
    </div>
  );
}
