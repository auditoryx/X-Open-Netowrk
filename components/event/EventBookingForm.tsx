import { useState } from 'react';
import { createEventTeamBooking } from '@/lib/firestore/createEventTeamBooking';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { searchCreatorsByRole, CreatorSearchResult } from '@/lib/firestore/searchCreators';
import EventBasicInfo from './EventBasicInfo';
import RoleSelection from './RoleSelection';
import CreatorSelection from './CreatorSelection';

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
        // Add role and fetch creators
        fetchCreatorsForRole(role);
        return [...prev, role];
      }
    });
  };

  const handleCreatorSelect = (role: string, creatorId: string) => {
    setSelectedCreators(prev => ({
      ...prev,
      [role]: creatorId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create an event booking');
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error('Please select at least one role for your event');
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
        <EventBasicInfo formData={formData} onInputChange={handleInputChange} />
        
        <RoleSelection 
          selectedRoles={selectedRoles} 
          onRoleToggle={handleRoleToggle} 
        />

        <CreatorSelection
          selectedRoles={selectedRoles}
          selectedCreators={selectedCreators}
          availableCreators={availableCreators}
          isLoadingCreators={isLoadingCreators}
          onCreatorSelect={handleCreatorSelect}
          onRetrySearch={fetchCreatorsForRole}
        />

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