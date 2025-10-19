/**
 * Challenge Dashboard Page
 * 
 * Main dashboard for viewing and participating in challenges.
 * Displays active challenges, user progress, and leaderboards.
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/Button";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  Star,
  Award,
  Zap,
  Users,
  Plus,
  RefreshCw
} from 'lucide-react';
import ChallengeGrid from '@/components/challenges/ChallengeGrid';
import ChallengeLeaderboard from '@/components/challenges/ChallengeLeaderboard';
import { useChallengeData } from '@/lib/hooks/useChallengeData';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';

const ChallengeDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    challenges,
    userParticipations,
    leaderboards,
    isLoading,
    isJoining,
    error,
    joinChallenge,
    refreshChallenges,
    getLeaderboard,
    stats
  } = useChallengeData();

  const [selectedLeaderboard, setSelectedLeaderboard] = useState<{
    challengeId: string;
    leaderboard: any;
  } | null>(null);

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      toast.error('Please log in to join challenges');
      return;
    }
    
    await joinChallenge(challengeId);
  };

  const handleViewLeaderboard = async (challengeId: string) => {
    const leaderboard = await getLeaderboard(challengeId);
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (leaderboard && challenge) {
      setSelectedLeaderboard({ challengeId, leaderboard });
    } else {
      toast.error('Unable to load leaderboard');
    }
  };

  const handleRefresh = async () => {
    await refreshChallenges();
    toast.success('Challenges refreshed');
  };

  // Get user's active participations
  const activeParticipations = userParticipations.filter(p => {
    const challenge = challenges.find(c => c.id === p.challengeId);
    return challenge?.status === 'active';
  });

  // Get user's top positions
  const topPositions = userParticipations
    .filter(p => p.position && p.position <= 10)
    .sort((a, b) => a.position - b.position)
    .slice(0, 3);

  const renderWelcomeSection = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome to Challenges! 🏆
          </h1>
          <p className="text-blue-100 text-lg mb-4">
            Compete with fellow creators and earn amazing rewards
          </p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>{stats.activeChallenges} Active Challenges</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>{stats.userActiveChallenges} Joined</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>{stats.totalXPFromChallenges} XP Earned</span>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
            <Trophy className="w-16 h-16 text-yellow-300" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.userActiveChallenges}
              </div>
              <div className="text-sm text-gray-600">Active Challenges</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.userCompletedChallenges}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalXPFromChallenges}
              </div>
              <div className="text-sm text-gray-600">XP Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {topPositions.length > 0 ? `#${topPositions[0].position}` : '-'}
              </div>
              <div className="text-sm text-gray-600">Best Rank</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveParticipations = () => {
    if (activeParticipations.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Active Challenges
            </h3>
            <p className="text-gray-600 mb-4">
              Join a challenge below to start competing and earning rewards!
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeParticipations.map(participation => {
              const challenge = challenges.find(c => c.id === participation.challengeId);
              if (!challenge) return null;

              return (
                <div key={participation.challengeId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Progress: {Math.round(participation.progressPercentage)}%</span>
                      <span>Rank: #{participation.position || '-'}</span>
                      <Badge variant="secondary">
                        {participation.currentValue.toLocaleString()} / {participation.targetValue.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewLeaderboard(challenge.id)}
                  >
                    View Leaderboard
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTopPositions = () => {
    if (topPositions.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Your Best Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPositions.map(participation => {
              const challenge = challenges.find(c => c.id === participation.challengeId);
              if (!challenge) return null;

              const getPositionColor = (position: number) => {
                if (position === 1) return 'text-yellow-600';
                if (position <= 3) return 'text-orange-600';
                return 'text-blue-600';
              };

              const getPositionIcon = (position: number) => {
                if (position === 1) return <Trophy className="w-4 h-4" />;
                if (position <= 3) return <Award className="w-4 h-4" />;
                return <Star className="w-4 h-4" />;
              };

              return (
                <div key={participation.challengeId} className="flex items-center gap-3">
                  <div className={`flex items-center gap-1 ${getPositionColor(participation.position)}`}>
                    {getPositionIcon(participation.position)}
                    <span className="font-bold">#{participation.position}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{challenge.title}</div>
                    <div className="text-sm text-gray-600">
                      {Math.round(participation.progressPercentage)}% completed
                    </div>
                  </div>
                  <Badge variant="secondary">
                    +{participation.rewardsAwarded?.xp || 0} XP
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <TrendingUp className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {renderWelcomeSection()}
      
      {user && (
        <>
          {renderQuickStats()}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {renderActiveParticipations()}
            {renderTopPositions()}
          </div>
        </>
      )}

      <Tabs defaultValue="all-challenges" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="all-challenges">All Challenges</TabsTrigger>
            <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          </TabsList>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <TabsContent value="all-challenges">
          <ChallengeGrid
            challenges={challenges}
            userParticipations={userParticipations}
            onJoinChallenge={handleJoinChallenge}
            onViewLeaderboard={handleViewLeaderboard}
            isLoading={isLoading || isJoining}
          />
        </TabsContent>

        <TabsContent value="leaderboards">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {challenges
              .filter(c => c.participantCount > 0)
              .map(challenge => (
                <Card key={challenge.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Participants</span>
                        <span className="font-medium">{challenge.participantCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Status</span>
                        <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
                          {challenge.status}
                        </Badge>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleViewLeaderboard(challenge.id)}
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        View Leaderboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
          
          {challenges.filter(c => c.participantCount > 0).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Leaderboards Yet
                </h3>
                <p className="text-gray-600">
                  Leaderboards will appear here once challenges have participants.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Leaderboard Modal */}
      {selectedLeaderboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <ChallengeLeaderboard
              challenge={challenges.find(c => c.id === selectedLeaderboard.challengeId)!}
              leaderboard={selectedLeaderboard.leaderboard}
              userParticipation={userParticipations.find(p => p.challengeId === selectedLeaderboard.challengeId)}
              onClose={() => setSelectedLeaderboard(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeDashboard;
