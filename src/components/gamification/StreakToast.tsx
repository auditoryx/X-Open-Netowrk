/**
 * StreakToast Component
 * Shows streak notifications and achievements
 */

'use client';

import React from 'react';

export interface StreakToastProps {
  streakCount?: number;
  message?: string;
}

const StreakToast: React.FC<StreakToastProps> = ({
  streakCount = 0,
  message,
}) => {
  return (
    <div
      style={{
        padding: '1rem',
        background: '#ffe066',
        borderRadius: '8px',
        color: '#333',
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {message || `🔥 Streak: ${streakCount} days! Keep it up!`}
    </div>
  );
};

export default StreakToast;
