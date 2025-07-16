/**
 * Test Page for Ranking System Components
 * Development testing interface for leaderboards and ranking
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/Button";
import { Badge } from '@/components/ui/badge';
import Leaderboard from '@/components/rankings/Leaderboard';
import LeaderboardWidget, { UserRankingWidget } from '@/components/rankings/LeaderboardWidget';
import { seedTestData, cleanupTestData } from '@/lib/utils/rankingDataSeeder';
import { Trophy, Users, TrendingUp, Shield, Star, Database, Trash2 } from 'lucide-react';

export default function RankingTestPage() {
  return (
    <div className="p-6 text-white space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ranking System Test Page</h1>
          <p className="text-gray-400">
            Testing leaderboard components and ranking functionality
          </p>
        </div>
        
        <Badge variant="outline" className="text-blue-500 border-blue-500">
          <Trophy className="w-4 h-4 mr-1" />
          Phase 4A Development
        </Badge>
      </div>

      {/* User Ranking Widget Test */}
      <section>
        <h2 className="text-xl font-bold mb-4">User Ranking Widget</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserRankingWidget showDetails={true} />
          <UserRankingWidget showDetails={false} />
        </div>
      </section>

      {/* Leaderboard Widgets Test */}
      <section>
        <h2 className="text-xl font-bold mb-4">Leaderboard Widgets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LeaderboardWidget 
            category="global"
            maxEntries={5}
            showHeader={true}
          />
          <LeaderboardWidget 
            category="weekly"
            maxEntries={5}
            showHeader={true}
          />
          <LeaderboardWidget 
            category="verified"
            maxEntries={5}
            showHeader={true}
          />
          <LeaderboardWidget 
            category="new"
            maxEntries={5}
            showHeader={true}
          />
        </div>
      </section>

      {/* Full Leaderboard Test */}
      <section>
        <h2 className="text-xl font-bold mb-4">Full Leaderboard Component</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Leaderboard 
              className="bg-neutral-800 border-neutral-700"
              showUserRanking={true}
              showTabs={true}
              limit={20}
            />
          </div>
          
          <div className="space-y-6">
            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-sm">Component Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Leaderboard Service</span>
                  <Badge variant="secondary" className="text-xs">✅ Ready</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Ranking Algorithm</span>
                  <Badge variant="secondary" className="text-xs">✅ Implemented</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">UI Components</span>
                  <Badge variant="secondary" className="text-xs">✅ Complete</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Real-time Updates</span>
                  <Badge variant="outline" className="text-xs">🔄 Testing</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-sm">Ranking Factors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">XP Score</span>
                  <span className="font-medium">40%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Performance</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Verification</span>
                  <span className="font-medium">15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tier Status</span>
                  <span className="font-medium">10%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Engagement</span>
                  <span className="font-medium">5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recency</span>
                  <span className="font-medium">5%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-sm">Test Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Refresh Components
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-green-400 border-green-600"
                  onClick={seedTestData}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Seed Test Data
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-red-400 border-red-600"
                  onClick={cleanupTestData}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cleanup Test Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Component Variations Test */}
      <section>
        <h2 className="text-xl font-bold mb-4">Component Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Compact vs Full */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-sm">Compact Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Leaderboard 
                showUserRanking={false}
                showTabs={false}
                limit={5}
                compact={true}
              />
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-sm">Full Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Leaderboard 
                showUserRanking={false}
                showTabs={false}
                limit={5}
                compact={false}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Development Notes */}
      <section>
        <Card className="bg-blue-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-sm text-blue-400">Development Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-blue-300">
              <strong>Phase 4A Status:</strong> Ranking algorithm and UI components implemented
            </p>
            <p className="text-blue-300">
              <strong>Next Steps:</strong> Test with real data, integrate with explore page
            </p>
            <p className="text-blue-300">
              <strong>Components:</strong> All ranking components are responsive and accessible
            </p>
            <p className="text-blue-300">
              <strong>Performance:</strong> Leaderboards update every 5 minutes, ranking scores calculated on-demand
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
