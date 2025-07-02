import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { getAvailableRoles, getAvailableGenres, getAvailableLocations } from '@/lib/firestore/searchCreators';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  className?: string;
}

export interface SearchFilters {
  searchTerm: string;
  role: string;
  tags: string[];
  location: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialFilters, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
  const [selectedRole, setSelectedRole] = useState(initialFilters?.role || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters?.tags || []);
  const [selectedLocation, setSelectedLocation] = useState(initialFilters?.location || '');
  
  // Dropdown data
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  
  // Dropdown states
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  
  // Refs for dropdown management
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Load available options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [roles, genres, locations] = await Promise.all([
          getAvailableRoles(),
          getAvailableGenres(),
          getAvailableLocations()
        ]);
        
        setAvailableRoles(roles);
        setAvailableGenres(genres);
        setAvailableLocations(locations);
      } catch (error) {
        console.error('Error loading search options:', error);
      }
    };
    
    loadOptions();
  }, []);

  // Handle search when filters change
  useEffect(() => {
    const filters: SearchFilters = {
      searchTerm,
      role: selectedRole,
      tags: selectedTags,
      location: selectedLocation
    };
    
    onSearch(filters);
  }, [searchTerm, selectedRole, selectedTags, selectedLocation, onSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target as Node)) {
        setShowTagsDropdown(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedTags([]);
    setSelectedLocation('');
  };

  const hasActiveFilters = searchTerm || selectedRole || selectedTags.length > 0 || selectedLocation;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search creators by name, bio, or skills..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            className={`w-full lg:w-48 px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
              selectedRole ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
          >
            <span className={selectedRole ? 'text-blue-700' : 'text-gray-500'}>
              {selectedRole || 'Select Role'}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </button>
          
          {showRoleDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              <div 
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedRole('');
                  setShowRoleDropdown(false);
                }}
              >
                All Roles
              </div>
              {availableRoles.map(role => (
                <div
                  key={role}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer capitalize"
                  onClick={() => {
                    setSelectedRole(role);
                    setShowRoleDropdown(false);
                  }}
                >
                  {role}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags/Genres Filter */}
        <div className="relative" ref={tagsDropdownRef}>
          <button
            className={`w-full lg:w-48 px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
              selectedTags.length > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => setShowTagsDropdown(!showTagsDropdown)}
          >
            <span className={selectedTags.length > 0 ? 'text-blue-700' : 'text-gray-500'}>
              {selectedTags.length > 0 ? `${selectedTags.length} tags selected` : 'Select Tags'}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </button>
          
          {showTagsDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {availableGenres.map(tag => (
                <div
                  key={tag}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleTagToggle(tag)}
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => {}} // Handled by onClick
                    className="mr-3"
                  />
                  <span className="capitalize">{tag}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Filter */}
        <div className="relative" ref={locationDropdownRef}>
          <button
            className={`w-full lg:w-48 px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
              selectedLocation ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            <span className={selectedLocation ? 'text-blue-700' : 'text-gray-500'}>
              {selectedLocation || 'Select Location'}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </button>
          
          {showLocationDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              <div 
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedLocation('');
                  setShowLocationDropdown(false);
                }}
              >
                All Locations
              </div>
              {availableLocations.map(location => (
                <div
                  key={location}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedLocation(location);
                    setShowLocationDropdown(false);
                  }}
                >
                  {location}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-3 text-gray-500 hover:text-gray-700 flex items-center"
            title="Clear all filters"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedRole && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Role: {selectedRole}
              <button
                onClick={() => setSelectedRole('')}
                className="ml-2 h-4 w-4 text-blue-600 hover:text-blue-800"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {selectedTags.map(tag => (
            <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-2 h-4 w-4 text-green-600 hover:text-green-800"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
          
          {selectedLocation && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Location: {selectedLocation}
              <button
                onClick={() => setSelectedLocation('')}
                className="ml-2 h-4 w-4 text-purple-600 hover:text-purple-800"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
