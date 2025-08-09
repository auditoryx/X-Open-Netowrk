'use client';

import React from 'react';
import { FeatureFlags, EXPLORE_ROLE_TABS, TIER_BADGES } from '@/lib/featureFlags/axBeta';

export default function ExploreTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AX Beta: Explore System Demo</h1>
          <p className="mt-2 text-gray-600">
            Testing the new credibility-based explore system with merit-first exposure
          </p>
        </div>

        {/* Feature Flag Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Flag Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium text-gray-700">EXPOSE_SCORE_V1</div>
              <div className={`text-sm ${FeatureFlags.isEnabled('EXPOSE_SCORE_V1') ? 'text-green-600' : 'text-red-600'}`}>
                {FeatureFlags.isEnabled('EXPOSE_SCORE_V1') ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium text-gray-700">FIRST_SCREEN_MIX</div>
              <div className={`text-sm ${FeatureFlags.isEnabled('FIRST_SCREEN_MIX') ? 'text-green-600' : 'text-red-600'}`}>
                {FeatureFlags.isEnabled('FIRST_SCREEN_MIX') ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium text-gray-700">BYO_LINKS</div>
              <div className={`text-sm ${FeatureFlags.isEnabled('BYO_LINKS') ? 'text-green-600' : 'text-red-600'}`}>
                {FeatureFlags.isEnabled('BYO_LINKS') ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <div className="text-sm font-medium text-blue-700">Current Phase: {FeatureFlags.getCurrentPhase()}</div>
          </div>
        </div>

        {/* Role Tabs Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Explore Role Tabs</h2>
          <div className="flex space-x-4 overflow-x-auto">
            {EXPLORE_ROLE_TABS.map((role) => (
              <button
                key={role.key}
                className="flex-none flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
              >
                <span>{role.icon}</span>
                <span>{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tier Badges Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tier Badges</h2>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(TIER_BADGES).map(([tier, info]) => (
              <div key={tier} className="text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${info.color}`}>
                  {info.icon} {info.label}
                </span>
                <p className="mt-2 text-xs text-gray-500">{info.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* API Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Endpoints</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="font-mono text-sm text-gray-800">GET /api/explore?role=artist&limit=30</div>
              <div className="text-xs text-gray-600 mt-1">Enhanced explore API with credibility-based sorting</div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="font-mono text-sm text-gray-800">POST /api/byo/invite</div>
              <div className="text-xs text-gray-600 mt-1">Create BYO (Bring Your Own) client invite links</div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-green-400 mr-3">✅</div>
            <div>
              <h3 className="text-green-800 font-medium">AX Beta System Ready</h3>
              <p className="text-green-700 text-sm mt-1">
                Credibility scoring, badge system, and merit-first explore are fully implemented and ready for testing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}