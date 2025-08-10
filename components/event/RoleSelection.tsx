import React from 'react';

const AVAILABLE_ROLES = [
  'artist',
  'producer', 
  'engineer',
  'videographer',
  'studio',
  'editor',
  'designer'
];

interface RoleSelectionProps {
  selectedRoles: string[];
  onRoleToggle: (role: string) => void;
}

export default function RoleSelection({ selectedRoles, onRoleToggle }: RoleSelectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Roles Needed</h3>
      <p className="text-sm text-gray-600 mb-4">
        Select all the roles you need for this event. You can choose specific creators for each role later.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {AVAILABLE_ROLES.map(role => (
          <label key={role} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedRoles.includes(role)}
              onChange={() => onRoleToggle(role)}
              className="w-4 h-4"
            />
            <span className="capitalize">{role}</span>
          </label>
        ))}
      </div>
    </div>
  );
}