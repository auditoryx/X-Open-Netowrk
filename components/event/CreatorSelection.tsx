import React from 'react';
import Image from 'next/image';
import { CreatorSearchResult } from '@/lib/firestore/searchCreators';

interface CreatorSelectionProps {
  selectedRoles: string[];
  selectedCreators: { [role: string]: string };
  availableCreators: { [role: string]: CreatorSearchResult[] };
  isLoadingCreators: { [role: string]: boolean };
  onCreatorSelect: (role: string, creatorId: string) => void;
  onRetrySearch: (role: string) => void;
}

export default function CreatorSelection({
  selectedRoles,
  selectedCreators,
  availableCreators,
  isLoadingCreators,
  onCreatorSelect,
  onRetrySearch
}: CreatorSelectionProps) {
  if (selectedRoles.length === 0) {
    return null;
  }

  return (
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
                      onClick={() => onCreatorSelect(role, '')}
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
                        onClick={() => onCreatorSelect(role, creator.uid)}
                      >
                        <Image
                          src={creator.profileImageUrl || '/default-avatar.png'}
                          alt={creator.displayName || ''}
                          width={32}
                          height={32}
                          className="rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-sm">{creator.displayName}</p>
                          <p className="text-xs text-gray-500">{creator.location || 'Location not specified'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-gray-500">No {role}s available</p>
                  <button 
                    type="button"
                    className="text-blue-500 text-sm hover:underline mt-1"
                    onClick={() => onRetrySearch(role)}
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
  );
}