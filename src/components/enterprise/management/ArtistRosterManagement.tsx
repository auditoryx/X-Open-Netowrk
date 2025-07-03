'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Plus, Edit, Star, CheckCircle, 
  AlertCircle, Clock, DollarSign, TrendingUp, Calendar,
  Mail, Phone, Globe, Instagram, Twitter, Music, 
  Award, Zap, Eye, MoreVertical, Download, Upload,
  UserPlus, Settings, BarChart3
} from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  stageName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  genres: string[];
  skills: string[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  isActive: boolean;
  rating: number;
  totalBookings: number;
  totalEarnings: number;
  hourlyRate: number;
  joinedAt: string;
  lastActive: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    spotify?: string;
    website?: string;
  };
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  recentPerformance: {
    bookingsThisMonth: number;
    earningsThisMonth: number;
    averageResponseTime: number; // in hours
    completionRate: number; // percentage
  };
}

interface ArtistFilters {
  search: string;
  genres: string[];
  skills: string[];
  verificationStatus: string;
  isActive?: boolean;
  minRating: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const GENRES = [
  'Hip Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical',
  'Country', 'Reggae', 'Latin', 'Folk', 'Blues', 'Alternative'
];

const SKILLS = [
  'Recording', 'Mixing', 'Mastering', 'Production', 'Songwriting',
  'Vocal Coaching', 'Instrument Performance', 'Sound Design', 'Composition'
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'totalEarnings', label: 'Earnings' },
  { value: 'totalBookings', label: 'Bookings' },
  { value: 'rating', label: 'Rating' },
  { value: 'joinedAt', label: 'Join Date' },
  { value: 'lastActive', label: 'Last Active' },
];

export default function ArtistRosterManagement() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [filters, setFilters] = useState<ArtistFilters>({
    search: '',
    genres: [],
    skills: [],
    verificationStatus: '',
    minRating: 0,
    sortBy: 'totalEarnings',
    sortOrder: 'desc',
  });
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  useEffect(() => {
    const mockArtists: Artist[] = [
      {
        id: '1',
        name: 'Marcus Johnson',
        stageName: 'M-Jay',
        email: 'marcus@example.com',
        phone: '+1 555-0123',
        genres: ['Hip Hop', 'R&B'],
        skills: ['Recording', 'Songwriting', 'Production'],
        verificationStatus: 'VERIFIED',
        isActive: true,
        rating: 4.9,
        totalBookings: 28,
        totalEarnings: 15400,
        hourlyRate: 150,
        joinedAt: '2023-06-15',
        lastActive: '2024-01-14',
        socialLinks: {
          instagram: '@mjay_music',
          spotify: 'spotify.com/artist/mjay',
        },
        availability: {
          monday: true, tuesday: true, wednesday: true, thursday: true,
          friday: true, saturday: false, sunday: false
        },
        recentPerformance: {
          bookingsThisMonth: 5,
          earningsThisMonth: 2800,
          averageResponseTime: 2.5,
          completionRate: 96
        }
      },
      {
        id: '2',
        name: 'Sarah Williams',
        stageName: 'Savy',
        email: 'sarah@example.com',
        phone: '+1 555-0234',
        genres: ['Pop', 'R&B'],
        skills: ['Vocal Coaching', 'Songwriting', 'Recording'],
        verificationStatus: 'VERIFIED',
        isActive: true,
        rating: 4.8,
        totalBookings: 22,
        totalEarnings: 12800,
        hourlyRate: 120,
        joinedAt: '2023-08-20',
        lastActive: '2024-01-13',
        socialLinks: {
          instagram: '@savy_vocals',
          website: 'savywilliams.com',
        },
        availability: {
          monday: true, tuesday: true, wednesday: false, thursday: true,
          friday: true, saturday: true, sunday: false
        },
        recentPerformance: {
          bookingsThisMonth: 4,
          earningsThisMonth: 1920,
          averageResponseTime: 1.8,
          completionRate: 100
        }
      },
      {
        id: '3',
        name: 'David Chen',
        email: 'david@example.com',
        genres: ['Electronic', 'Pop'],
        skills: ['Mixing', 'Mastering', 'Sound Design'],
        verificationStatus: 'PENDING',
        isActive: true,
        rating: 4.6,
        totalBookings: 18,
        totalEarnings: 9600,
        hourlyRate: 200,
        joinedAt: '2023-10-05',
        lastActive: '2024-01-12',
        availability: {
          monday: false, tuesday: true, wednesday: true, thursday: true,
          friday: true, saturday: true, sunday: true
        },
        recentPerformance: {
          bookingsThisMonth: 3,
          earningsThisMonth: 1800,
          averageResponseTime: 4.2,
          completionRate: 89
        }
      },
      {
        id: '4',
        name: 'Lisa Rodriguez',
        stageName: 'LiRo',
        email: 'lisa@example.com',
        phone: '+1 555-0456',
        genres: ['Latin', 'Pop'],
        skills: ['Guitar', 'Production', 'Composition'],
        verificationStatus: 'VERIFIED',
        isActive: false,
        rating: 4.7,
        totalBookings: 15,
        totalEarnings: 8200,
        hourlyRate: 100,
        joinedAt: '2023-11-12',
        lastActive: '2024-01-10',
        socialLinks: {
          instagram: '@liro_music',
          twitter: '@liromusic',
        },
        availability: {
          monday: true, tuesday: false, wednesday: true, thursday: false,
          friday: true, saturday: true, sunday: false
        },
        recentPerformance: {
          bookingsThisMonth: 0,
          earningsThisMonth: 0,
          averageResponseTime: 0,
          completionRate: 85
        }
      },
    ];

    setArtists(mockArtists);
    setFilteredArtists(mockArtists);
    setLoading(false);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...artists];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(artist =>
        artist.name.toLowerCase().includes(searchLower) ||
        artist.stageName?.toLowerCase().includes(searchLower) ||
        artist.email.toLowerCase().includes(searchLower) ||
        artist.genres.some(g => g.toLowerCase().includes(searchLower)) ||
        artist.skills.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    // Genre filter
    if (filters.genres.length > 0) {
      filtered = filtered.filter(artist =>
        filters.genres.some(genre => artist.genres.includes(genre))
      );
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(artist =>
        filters.skills.some(skill => artist.skills.includes(skill))
      );
    }

    // Verification status filter
    if (filters.verificationStatus) {
      filtered = filtered.filter(artist =>
        artist.verificationStatus === filters.verificationStatus
      );
    }

    // Active status filter
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(artist => artist.isActive === filters.isActive);
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(artist => artist.rating >= filters.minRating);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof Artist];
      const bValue = b[filters.sortBy as keyof Artist];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredArtists(filtered);
  }, [artists, filters]);

  const toggleArtistSelection = (artistId: string) => {
    setSelectedArtists(prev =>
      prev.includes(artistId)
        ? prev.filter(id => id !== artistId)
        : [...prev, artistId]
    );
  };

  const selectAllArtists = () => {
    setSelectedArtists(filteredArtists.map(a => a.id));
  };

  const clearSelection = () => {
    setSelectedArtists([]);
  };

  const handleBulkAction = async (action: string) => {
    console.log(`Performing ${action} on artists:`, selectedArtists);
    // Implement bulk actions (verify, deactivate, etc.)
  };

  const getVerificationBadge = (status: string) => {
    const badges = {
      VERIFIED: { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'Verified' },
      PENDING: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', text: 'Pending' },
      REJECTED: { icon: AlertCircle, color: 'text-red-600 bg-red-100', text: 'Rejected' },
      SUSPENDED: { icon: AlertCircle, color: 'text-gray-600 bg-gray-100', text: 'Suspended' },
    };

    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getAvailabilityDays = (availability: Artist['availability']) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return days.filter((_, index) => availability[dayKeys[index] as keyof typeof availability]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Artist Roster</h1>
              <p className="text-gray-600">Manage your label's artists and performers</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                <Download className="w-4 h-4 mr-2 inline" />
                Export
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2 inline" />
                Add Artist
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search artists..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <select
                  value={filters.verificationStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, verificationStatus: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Status</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex space-x-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                multiple
                value={filters.genres}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  genres: Array.from(e.target.selectedOptions, option => option.value) 
                }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                {GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              <select
                multiple
                value={filters.skills}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  skills: Array.from(e.target.selectedOptions, option => option.value) 
                }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                {SKILLS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>

              <select
                value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isActive: e.target.value === '' ? undefined : e.target.value === 'active' 
                }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="">All Artists</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedArtists.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-900">
                  {selectedArtists.length} artist{selectedArtists.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('verify')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('message')}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Message
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Artists List/Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {filteredArtists.length} Artist{filteredArtists.length !== 1 ? 's' : ''}
                </h3>
                <button
                  onClick={selectAllArtists}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => e.target.checked ? selectAllArtists() : clearSelection()}
                          checked={selectedArtists.length === filteredArtists.length && filteredArtists.length > 0}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skills & Genres
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Earnings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredArtists.map((artist) => (
                      <tr key={artist.id} className={selectedArtists.includes(artist.id) ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedArtists.includes(artist.id)}
                            onChange={() => toggleArtistSelection(artist.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {artist.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {artist.stageName || artist.name}
                              </div>
                              <div className="text-sm text-gray-500">{artist.email}</div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                {artist.rating} • ${artist.hourlyRate}/hr
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex flex-wrap gap-1 mb-1">
                              {artist.genres.slice(0, 2).map(genre => (
                                <span key={genre} className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                  {genre}
                                </span>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {artist.skills.slice(0, 2).map(skill => (
                                <span key={skill} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div>{artist.totalBookings} bookings</div>
                            <div className="text-gray-500">
                              {artist.recentPerformance.completionRate}% completion
                            </div>
                            <div className="text-gray-500">
                              ~{artist.recentPerformance.averageResponseTime}h response
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {getVerificationBadge(artist.verificationStatus)}
                            <div className={`text-xs ${artist.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {artist.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              ${artist.totalEarnings.toLocaleString()}
                            </div>
                            <div className="text-gray-500">
                              ${artist.recentPerformance.earningsThisMonth} this month
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className={`border rounded-lg p-6 ${
                      selectedArtists.includes(artist.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <input
                        type="checkbox"
                        checked={selectedArtists.includes(artist.id)}
                        onChange={() => toggleArtistSelection(artist.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 mx-4">
                        <div className="flex items-center mb-2">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            {artist.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {artist.stageName || artist.name}
                            </h4>
                            <p className="text-sm text-gray-600">{artist.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Rating:</span>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className="text-sm font-medium">{artist.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Rate:</span>
                            <span className="text-sm font-medium">${artist.hourlyRate}/hr</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Earnings:</span>
                            <span className="text-sm font-medium">${artist.totalEarnings.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Bookings:</span>
                            <span className="text-sm font-medium">{artist.totalBookings}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {artist.genres.slice(0, 3).map(genre => (
                              <span key={genre} className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                {genre}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {artist.skills.slice(0, 3).map(skill => (
                              <span key={skill} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          {getVerificationBadge(artist.verificationStatus)}
                          <span className={`text-xs ${artist.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {artist.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
