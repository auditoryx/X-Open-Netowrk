import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createSplitBooking } from '@/lib/firestore/createSplitBooking';
import { getUserProfile } from '@/lib/firestore/getUserProfile';
import { Users, Calendar, Clock, DollarSign, Search, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Studio {
  id: string;
  name: string;
  location: string;
  hourlyRate: number;
  description?: string;
}

interface TalentUser {
  uid: string;
  name: string;
  profileImage?: string;
  role: string;
}

interface SplitBookingFormProps {
  studios: Studio[];
  onBookingCreated?: (bookingId: string) => void;
  onCancel?: () => void;
}

export function SplitBookingForm({ studios, onBookingCreated, onCancel }: SplitBookingFormProps) {
  const { user } = useAuth();
  
  // Form state
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(2); // hours
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorUid, setCollaboratorUid] = useState('');
  const [splitRatio, setSplitRatio] = useState(0.5); // 50/50 by default
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  
  // Talent selection
  const [selectedArtist, setSelectedArtist] = useState<TalentUser | null>(null);
  const [selectedProducer, setSelectedProducer] = useState<TalentUser | null>(null);
  const [selectedEngineer, setSelectedEngineer] = useState<TalentUser | null>(null);
  const [talentSearch, setTalentSearch] = useState('');
  const [talentResults, setTalentResults] = useState<TalentUser[]>([]);
  const [showTalentSearch, setShowTalentSearch] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [collaboratorLoading, setCollaboratorLoading] = useState(false);

  const totalCost = selectedStudio ? selectedStudio.hourlyRate * duration : 0;
  const userShare = Math.round(totalCost * splitRatio * 100) / 100;
  const collaboratorShare = Math.round(totalCost * (1 - splitRatio) * 100) / 100;

  // Search for collaborator by email
  const searchCollaborator = async () => {
    if (!collaboratorEmail.trim()) return;
    
    setCollaboratorLoading(true);
    try {
      // In a real implementation, you'd search users by email
      // For now, we'll simulate finding a user
      const profile = await getUserProfile(collaboratorEmail); // This might need a different search function
      if (profile) {
        setCollaboratorUid(profile.uid);
        toast.success(`Found collaborator: ${profile.name || profile.displayName}`);
      } else {
        toast.error('Collaborator not found');
      }
    } catch (error) {
      toast.error('Error searching for collaborator');
    } finally {
      setCollaboratorLoading(false);
    }
  };

  // Search for talent
  const searchTalent = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setTalentResults([]);
      return;
    }

    try {
      // In a real implementation, you'd search for users with specific roles
      // For now, we'll simulate some results
      const mockResults: TalentUser[] = [
        { uid: 'artist1', name: 'Alex Producer', role: 'Producer' },
        { uid: 'engineer1', name: 'Sam Engineer', role: 'Engineer' },
        { uid: 'artist2', name: 'Jordan Artist', role: 'Artist' }
      ].filter(talent => 
        talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setTalentResults(mockResults);
    } catch (error) {
      console.error('Error searching talent:', error);
    }
  };

  // Handle talent selection
  const selectTalent = (talent: TalentUser, role: 'artist' | 'producer' | 'engineer') => {
    switch (role) {
      case 'artist':
        setSelectedArtist(talent);
        break;
      case 'producer':
        setSelectedProducer(talent);
        break;
      case 'engineer':
        setSelectedEngineer(talent);
        break;
    }
    setShowTalentSearch(false);
    setTalentSearch('');
    setTalentResults([]);
  };

  // Submit the booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a booking');
      return;
    }

    if (!selectedStudio) {
      toast.error('Please select a studio');
      return;
    }

    if (!collaboratorUid) {
      toast.error('Please find a valid collaborator');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select date and time');
      return;
    }

    if (collaboratorUid === user.uid) {
      toast.error('Cannot collaborate with yourself');
      return;
    }

    setLoading(true);
    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      const bookingData = {
        studioId: selectedStudio.id,
        clientAUid: user.uid,
        clientBUid: collaboratorUid,
        splitRatio,
        scheduledAt: scheduledDateTime,
        durationMinutes: duration * 60,
        totalCost,
        sessionTitle: sessionTitle || 'Split Studio Session',
        sessionDescription,
        requestedTalent: {
          ...(selectedArtist && { artistId: selectedArtist.uid }),
          ...(selectedProducer && { producerId: selectedProducer.uid }),
          ...(selectedEngineer && { engineerId: selectedEngineer.uid })
        }
      };

      const bookingId = await createSplitBooking(bookingData, user.uid);
      toast.success('Split booking created successfully!');
      
      if (onBookingCreated) {
        onBookingCreated(bookingId);
      }
    } catch (error) {
      console.error('Error creating split booking:', error);
      toast.error('Failed to create split booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Split Studio Booking
          </h2>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Studio Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Studio
          </label>
          <select
            value={selectedStudio?.id || ''}
            onChange={(e) => {
              const studio = studios.find(s => s.id === e.target.value);
              setSelectedStudio(studio || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Choose a studio...</option>
            {studios.map(studio => (
              <option key={studio.id} value={studio.id}>
                {studio.name} - {studio.location} (${studio.hourlyRate}/hr)
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duration (hours)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="1"
            max="12"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Session Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Title
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g., Recording Session, Mix & Master, etc."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Description
            </label>
            <textarea
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              placeholder="Describe what you'll be working on..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Collaborator */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Collaborator Email
          </label>
          <div className="flex space-x-2">
            <input
              type="email"
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
              placeholder="Enter collaborator's email"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <button
              type="button"
              onClick={searchCollaborator}
              disabled={collaboratorLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {collaboratorLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Cost Split */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cost Split
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.1"
              value={splitRatio}
              onChange={(e) => setSplitRatio(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>You: {Math.round(splitRatio * 100)}% (${userShare})</span>
              <span>Collaborator: {Math.round((1 - splitRatio) * 100)}% (${collaboratorShare})</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Total: ${totalCost}
              </span>
            </div>
          </div>
        </div>

        {/* Talent Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Request Talent (Optional)
            </label>
            <button
              type="button"
              onClick={() => setShowTalentSearch(!showTalentSearch)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Talent</span>
            </button>
          </div>

          {/* Selected Talent Display */}
          <div className="space-y-2">
            {selectedArtist && (
              <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                <span className="text-sm">Artist: {selectedArtist.name}</span>
                <button onClick={() => setSelectedArtist(null)} className="text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {selectedProducer && (
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <span className="text-sm">Producer: {selectedProducer.name}</span>
                <button onClick={() => setSelectedProducer(null)} className="text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {selectedEngineer && (
              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <span className="text-sm">Engineer: {selectedEngineer.name}</span>
                <button onClick={() => setSelectedEngineer(null)} className="text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Talent Search */}
          {showTalentSearch && (
            <div className="mt-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <input
                type="text"
                value={talentSearch}
                onChange={(e) => {
                  setTalentSearch(e.target.value);
                  searchTalent(e.target.value);
                }}
                placeholder="Search for artists, producers, engineers..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              
              {talentResults.length > 0 && (
                <div className="mt-2 space-y-2">
                  {talentResults.map(talent => (
                    <div key={talent.uid} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded">
                      <div>
                        <span className="font-medium">{talent.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{talent.role}</span>
                      </div>
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={() => selectTalent(talent, 'artist')}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded"
                        >
                          Artist
                        </button>
                        <button
                          type="button"
                          onClick={() => selectTalent(talent, 'producer')}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                        >
                          Producer
                        </button>
                        <button
                          type="button"
                          onClick={() => selectTalent(talent, 'engineer')}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                        >
                          Engineer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={loading || !selectedStudio || !collaboratorUid}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Booking...</span>
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                <span>Create Split Booking</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
