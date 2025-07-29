'use client';

import React from 'react';
import { InboxIcon, UserIcon, SearchIcon, CalendarIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'inbox' | 'users' | 'search' | 'calendar' | React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

const ICONS = {
  inbox: InboxIcon,
  users: UserIcon,
  search: SearchIcon,
  calendar: CalendarIcon,
};

export default function EmptyStateIllustration({
  icon = 'inbox',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const IconComponent = typeof icon === 'string' ? ICONS[icon] : null;

  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-6">
          {IconComponent ? (
            <IconComponent className="w-16 h-16 mx-auto text-gray-400" />
          ) : (
            icon
          )}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>

        {/* Action */}
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}