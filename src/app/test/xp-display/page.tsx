'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import XPDisplay from '@/components/gamification/XPDisplay';
import XPProgressBar from '@/components/gamification/XPProgressBar';
import XPWidget from '@/components/gamification/XPWidget';
import { useXPData } from '@/lib/hooks/useXPData';
import { useXPServiceWithNotifications } from '@/lib/services/xpServiceWithNotifications';
import { useXPNotificationContext } from '@/providers/XPNotificationProvider';
import { XP_VALUES } from '@/lib/services/xpService';

export default function XPTestPage() {
  const { user } = useAuth();
  const { userProgress, loading, refreshData } = useXPData();
  const { awardXP } = useXPServiceWithNotifications();
  const { notifyXPGained, notifyDailyCap, notifyTierUp, notifyBadgeEarned } = useXPNotificationContext();
  const [awarding, setAwarding] = useState(false);

  // Test function to award XP
  const testAwardXP = async (event: keyof typeof XP_VALUES, source: string) => {
    if (!user?.uid) return;
    
    setAwarding(true);
    try {
      const result = await awardXP(user.uid, event, {
        notificationSource: source,
        contextId: `test-${Date.now()}`
      });
      
      if (result.success) {
        await refreshData(); // Refresh data to show updated XP
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    } finally {
      setAwarding(false);
    }
  };

  // Test notifications
  const testNotifications = () => {
    notifyXPGained(100, 'test activity');
    setTimeout(() => notifyBadgeEarned('Test Badge'), 1000);
    setTimeout(() => notifyTierUp('Verified'), 2000);
    setTimeout(() => notifyDailyCap(), 3000);
  };

  if (!user) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">XP System Test Page</h1>
        <p>Please log in to test the XP system.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">XP System Test Page</h1>
        <p>Loading XP data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🎮 XP System Test Page</h1>
        <p className="text-gray-400 mb-6">Testing Phase 1B: Basic XP Display Components</p>

        {/* Component Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* XP Widget - Full Featured */}
          <div>
            <h2 className="text-xl font-semibold mb-3">XP Widget (Full)</h2>
            <XPWidget showHistory={true} />
          </div>

          {/* XP Widget - Compact */}
          <div>
            <h2 className="text-xl font-semibold mb-3">XP Widget (Compact)</h2>
            <XPWidget compact={true} />
          </div>
        </div>

        {/* Individual Components */}
        {userProgress && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">XP Display Component</h2>
              <XPDisplay
                totalXP={userProgress.totalXP}
                dailyXP={userProgress.dailyXP}
                dailyCapRemaining={Math.max(0, 300 - userProgress.dailyXP)}
                tier={userProgress.tier}
                className="max-w-md"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-3">XP Progress Bars</h2>
              
              {/* Daily Progress */}
              <div className="max-w-md">
                <h3 className="text-sm font-medium mb-2 text-gray-300">Daily XP Progress</h3>
                <XPProgressBar
                  currentXP={userProgress.dailyXP}
                  targetXP={300}
                  targetLabel="Daily XP Cap"
                  variant="daily"
                  size="md"
                />
              </div>

              {/* Tier Progress */}
              <div className="max-w-md">
                <h3 className="text-sm font-medium mb-2 text-gray-300">Tier Progress</h3>
                <XPProgressBar
                  currentXP={userProgress.totalXP}
                  targetXP={userProgress.tier === 'standard' ? 1000 : 2000}
                  targetLabel={userProgress.tier === 'standard' ? 'Verified Tier' : 'Signature Tier'}
                  variant="tier"
                  size="lg"
                />
              </div>

              {/* Custom Progress Example */}
              <div className="max-w-md">
                <h3 className="text-sm font-medium mb-2 text-gray-300">Custom Goal (500 XP)</h3>
                <XPProgressBar
                  currentXP={userProgress.totalXP}
                  targetXP={500}
                  targetLabel="Personal Goal"
                  variant="default"
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Test Controls */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Award Test XP</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(XP_VALUES).map(([event, xp]) => (
                  <button
                    key={event}
                    onClick={() => testAwardXP(event as keyof typeof XP_VALUES, `test ${event}`)}
                    disabled={awarding}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    {event} (+{xp} XP)
                  </button>
                ))}
              </div>
              {awarding && (
                <p className="text-sm text-yellow-400 mt-2">Awarding XP...</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Test Notifications</h3>
              <button
                onClick={testNotifications}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium transition-colors"
              >
                Trigger Test Notifications
              </button>
              <p className="text-sm text-gray-400 mt-2">
                This will show sample notifications for XP gained, badge earned, tier up, and daily cap reached.
              </p>
            </div>
          </div>
        </div>

        {/* Current State Debug Info */}
        {userProgress && (
          <div className="bg-neutral-900 border border-neutral-600 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Debug Info</h3>
            <pre className="text-xs text-gray-300 overflow-auto">
              {JSON.stringify(userProgress, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
