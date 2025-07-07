/**
 * Leaderboard Dashboard Page
 * Full leaderboard view with categories and user ranking
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Shield, 
  Star, 
  Award,
  BarChart3,
  Target
} from 'lucide-react';
import Leaderboard from '@/components/rankings/Leaderboard';
import { UserRankingWidget } from '@/components/rankings/LeaderboardWidget';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { userData } = useAuth();

  return (
    <div className="p-6 text-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leaderboards</h1>
          <p className="text-gray-400">
            Compete with top creators and track your progress
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            <Trophy className="w-4 h-4 mr-1" />
            Season 1
          </Badge>
        </div>
      </div>

      {/* User's Current Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UserRankingWidget className="md:col-span-2" showDetails={true} />
        
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Total XP</span>
              <span className="text-sm font-semibold">{userData?.totalXP || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">This Week</span>
              <span className="text-sm font-semibold text-green-400">+{userData?.weeklyXP || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Tier</span>
              <Badge variant="secondary" className="text-xs">
                {userData?.tier || 'New'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-800 border-neutral-700 hover:bg-neutral-750 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Global Rankings</h3>
            <p className="text-xs text-gray-400">All-time top creators</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700 hover:bg-neutral-750 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <h3 className="font-semibold mb-1">Weekly Leaders</h3>
            <p className="text-xs text-gray-400">This week's top performers</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700 hover:bg-neutral-750 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <h3 className="font-semibold mb-1">Verified Elite</h3>
            <p className="text-xs text-gray-400">Top verified creators</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700 hover:bg-neutral-750 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <h3 className="font-semibold mb-1">Rising Stars</h3>
            <p className="text-xs text-gray-400">New talent on the rise</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Leaderboard 
            className="bg-neutral-800 border-neutral-700" 
            showUserRanking={false}
            showTabs={true}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4" />
                Ranking Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Top 10 Finisher</p>
                  <p className="text-xs text-gray-400">Finish in top 10 globally</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded bg-green-500/10 border border-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Rising Star</p>
                  <p className="text-xs text-gray-400">Climb 50+ ranks in a week</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded bg-purple-500/10 border border-purple-500/20">
                <BarChart3 className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Consistency King</p>
                  <p className="text-xs text-gray-400">Top 25% for 4 weeks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Season Info */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Season Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">Season 1</p>
                <p className="text-sm text-gray-400 mb-4">
                  July 2025 - December 2025
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Days Remaining</span>
                    <span className="font-semibold">147</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Participants</span>
                    <span className="font-semibold">2,847</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-700">
                <h4 className="font-medium mb-2">Season Rewards</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-400">#1: Signature Tier + $1000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-400">Top 10: Premium Features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                    <span className="text-gray-400">Top 100: Exclusive Badges</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Boost Your Ranking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/verification">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Get Verified (+25 pts)
                </Button>
              </Link>
              
              <Link href="/dashboard/profile">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Complete Profile
                </Button>
              </Link>
              
              <Link href="/dashboard/bookings">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Earn 5-Star Reviews
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
