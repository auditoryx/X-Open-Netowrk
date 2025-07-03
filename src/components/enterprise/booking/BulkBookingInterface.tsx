'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Users, MapPin, DollarSign, Plus, X, 
  Search, Filter, CheckCircle, AlertTriangle, Zap, 
  ArrowRight, Save, Send, Calendar as CalendarIcon
} from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  stageName?: string;
  skills: string[];
  hourlyRate: number;
  availability: any;
  rating: number;
  avatar?: string;
  isAvailable: boolean;
}

interface BookingSlot {
  id: string;
  artistId: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  type: string;
  requirements?: string;
  notes?: string;
  budget?: number;
}

interface BulkBookingSession {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  bookings: BookingSlot[];
  totalBudget: number;
  status: 'draft' | 'pending' | 'confirmed' | 'scheduled';
}

const BOOKING_TYPES = [
  'Recording Session',
  'Mixing',
  'Mastering',
  'Production',
  'Consultation',
  'Performance',
  'Workshop',
  'Voice Over',
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function BulkBookingInterface() {
  const [session, setSession] = useState<BulkBookingSession>({
    id: '',
    title: '',
    description: '',
    bookings: [],
    totalBudget: 0,
    status: 'draft',
  });

  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for artists
  useEffect(() => {
    const mockArtists: Artist[] = [
      {
        id: '1',
        name: 'Marcus Johnson',
        stageName: 'M-Jay',
        skills: ['Hip Hop', 'R&B', 'Recording'],
        hourlyRate: 150,
        rating: 4.9,
        isAvailable: true,
        availability: {},
      },
      {
        id: '2',
        name: 'Sarah Williams',
        stageName: 'Savy',
        skills: ['Pop', 'Vocal Coaching', 'Songwriting'],
        hourlyRate: 120,
        rating: 4.8,
        isAvailable: true,
        availability: {},
      },
      {
        id: '3',
        name: 'David Chen',
        skills: ['Electronic', 'Mixing', 'Mastering'],
        hourlyRate: 200,
        rating: 4.7,
        isAvailable: false,
        availability: {},
      },
      {
        id: '4',
        name: 'Lisa Rodriguez',
        stageName: 'LiRo',
        skills: ['Latin', 'Guitar', 'Production'],
        hourlyRate: 100,
        rating: 4.6,
        isAvailable: true,
        availability: {},
      },
    ];

    setArtists(mockArtists);
    setFilteredArtists(mockArtists);
  }, []);

  useEffect(() => {
    let filtered = artists;

    if (searchTerm) {
      filtered = filtered.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (skillFilter) {
      filtered = filtered.filter(artist =>
        artist.skills.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()))
      );
    }

    setFilteredArtists(filtered);
  }, [searchTerm, skillFilter, artists]);

  const addBookingSlot = (artist: Artist) => {
    const newBooking: BookingSlot = {
      id: `booking-${Date.now()}`,
      artistId: artist.id,
      startDate: new Date(selectedDate),
      endDate: new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours default
      duration: 120,
      type: 'Recording Session',
      budget: artist.hourlyRate * 2,
    };

    setSession(prev => ({
      ...prev,
      bookings: [...prev.bookings, newBooking],
      totalBudget: prev.totalBudget + newBooking.budget!,
    }));

    setShowArtistModal(false);
  };

  const removeBookingSlot = (bookingId: string) => {
    const booking = session.bookings.find(b => b.id === bookingId);
    if (booking) {
      setSession(prev => ({
        ...prev,
        bookings: prev.bookings.filter(b => b.id !== bookingId),
        totalBudget: prev.totalBudget - (booking.budget || 0),
      }));
    }
  };

  const updateBookingSlot = (bookingId: string, updates: Partial<BookingSlot>) => {
    setSession(prev => ({
      ...prev,
      bookings: prev.bookings.map(booking => {
        if (booking.id === bookingId) {
          const updatedBooking = { ...booking, ...updates };
          // Recalculate budget if duration or artist changed
          if (updates.duration || updates.artistId) {
            const artist = artists.find(a => a.id === updatedBooking.artistId);
            if (artist) {
              updatedBooking.budget = artist.hourlyRate * (updatedBooking.duration / 60);
            }
          }
          return updatedBooking;
        }
        return booking;
      }),
    }));

    // Recalculate total budget
    const newTotal = session.bookings.reduce((total, booking) => {
      if (booking.id === bookingId) {
        const artist = artists.find(a => a.id === (updates.artistId || booking.artistId));
        return total + (artist ? artist.hourlyRate * ((updates.duration || booking.duration) / 60) : 0);
      }
      return total + (booking.budget || 0);
    }, 0);

    setSession(prev => ({ ...prev, totalBudget: newTotal }));
  };

  const handleSaveSession = async () => {
    setLoading(true);
    try {
      // API call to save bulk booking session
      console.log('Saving bulk booking session:', session);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Bulk booking session saved successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Error saving session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = async () => {
    setLoading(true);
    try {
      // API call to schedule all bookings
      console.log('Scheduling bulk booking session:', session);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('All bookings scheduled successfully!');
      setSession(prev => ({ ...prev, status: 'scheduled' }));
    } catch (error) {
      console.error('Error scheduling session:', error);
      alert('Error scheduling bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getArtistName = (artistId: string) => {
    const artist = artists.find(a => a.id === artistId);
    return artist ? (artist.stageName || artist.name) : 'Unknown Artist';
  };

  const getConflicts = () => {
    const conflicts: string[] = [];
    const bookingsByTime = new Map<string, BookingSlot[]>();

    session.bookings.forEach(booking => {
      const timeKey = `${booking.startDate.toISOString()}-${booking.endDate.toISOString()}`;
      if (!bookingsByTime.has(timeKey)) {
        bookingsByTime.set(timeKey, []);
      }
      bookingsByTime.get(timeKey)!.push(booking);
    });

    bookingsByTime.forEach((bookings, timeKey) => {
      if (bookings.length > 1) {
        conflicts.push(`Time conflict: ${bookings.length} bookings at ${new Date(timeKey.split('-')[0]).toLocaleString()}`);
      }
    });

    return conflicts;
  };

  const conflicts = getConflicts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Booking Interface</h1>
              <p className="text-gray-600">Schedule multiple sessions efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                session.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                session.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
              <button
                onClick={handleSaveSession}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2 inline" />
                Save Draft
              </button>
              <button
                onClick={handleScheduleSession}
                disabled={loading || session.bookings.length === 0 || conflicts.length > 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2 inline" />
                Schedule All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Session Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={session.title}
                    onChange={(e) => setSession(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter session title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={session.description}
                    onChange={(e) => setSession(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Session description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Session Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bookings:</span>
                  <span className="font-medium">{session.bookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Budget:</span>
                  <span className="font-medium">${session.totalBudget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Duration:</span>
                  <span className="font-medium">
                    {session.bookings.length > 0 
                      ? Math.round(session.bookings.reduce((sum, b) => sum + b.duration, 0) / session.bookings.length) 
                      : 0} min
                  </span>
                </div>
              </div>

              {conflicts.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">Conflicts Detected</span>
                  </div>
                  {conflicts.map((conflict, index) => (
                    <p key={index} className="text-sm text-red-700">{conflict}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Slots */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Booking Slots</h3>
                  <button
                    onClick={() => setShowArtistModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Add Booking
                  </button>
                </div>
              </div>

              <div className="p-6">
                {session.bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No bookings added yet</p>
                    <p className="text-sm text-gray-500">Click "Add Booking" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {session.bookings.map((booking) => {
                      const artist = artists.find(a => a.id === booking.artistId);
                      return (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* Artist */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Artist
                                </label>
                                <select
                                  value={booking.artistId}
                                  onChange={(e) => updateBookingSlot(booking.id, { artistId: e.target.value })}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                  {artists.map(artist => (
                                    <option key={artist.id} value={artist.id}>
                                      {artist.stageName || artist.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Date & Time */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Start Time
                                </label>
                                <input
                                  type="datetime-local"
                                  value={booking.startDate.toISOString().slice(0, 16)}
                                  onChange={(e) => updateBookingSlot(booking.id, { 
                                    startDate: new Date(e.target.value),
                                    endDate: new Date(new Date(e.target.value).getTime() + booking.duration * 60 * 1000)
                                  })}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                              </div>

                              {/* Duration */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Duration (min)
                                </label>
                                <select
                                  value={booking.duration}
                                  onChange={(e) => updateBookingSlot(booking.id, { duration: parseInt(e.target.value) })}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                  <option value={60}>1 hour</option>
                                  <option value={120}>2 hours</option>
                                  <option value={180}>3 hours</option>
                                  <option value={240}>4 hours</option>
                                  <option value={480}>8 hours</option>
                                </select>
                              </div>

                              {/* Type */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Type
                                </label>
                                <select
                                  value={booking.type}
                                  onChange={(e) => updateBookingSlot(booking.id, { type: e.target.value })}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                  {BOOKING_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <button
                              onClick={() => removeBookingSlot(booking.id)}
                              className="ml-4 p-2 text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Additional Details */}
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Requirements
                              </label>
                              <textarea
                                value={booking.requirements || ''}
                                onChange={(e) => updateBookingSlot(booking.id, { requirements: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                rows={2}
                                placeholder="Special requirements..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                              </label>
                              <textarea
                                value={booking.notes || ''}
                                onChange={(e) => updateBookingSlot(booking.id, { notes: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                rows={2}
                                placeholder="Additional notes..."
                              />
                            </div>
                          </div>

                          {/* Budget Display */}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              {artist && (
                                <span>
                                  Rate: ${artist.hourlyRate}/hr • Duration: {booking.duration} min
                                </span>
                              )}
                            </div>
                            <div className="text-lg font-semibold text-green-600">
                              ${booking.budget?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Selection Modal */}
      {showArtistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Select Artist</h3>
                <button
                  onClick={() => setShowArtistModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Search and Filter */}
              <div className="mt-4 flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search artists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <select
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">All Skills</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="R&B">R&B</option>
                    <option value="Pop">Pop</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Recording">Recording</option>
                    <option value="Mixing">Mixing</option>
                    <option value="Mastering">Mastering</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      artist.isAvailable 
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50' 
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                    onClick={() => artist.isAvailable && addBookingSlot(artist)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            {artist.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {artist.stageName || artist.name}
                            </p>
                            <p className="text-sm text-gray-600">${artist.hourlyRate}/hour</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {artist.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                            {artist.skills.length > 3 && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                +{artist.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span className="text-sm text-gray-600">{artist.rating}</span>
                        </div>
                        <div className={`mt-1 text-xs font-medium ${
                          artist.isAvailable ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {artist.isAvailable ? 'Available' : 'Busy'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
