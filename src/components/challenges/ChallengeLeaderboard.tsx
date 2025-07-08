/**
 * Challenge Leaderboard Component
 * 
 * Displays the leaderboard for a specific challenge with rankings,
 * progress, and user positions.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Star, 
  Crown,
  TrendingUp,
  Users,
  Target,
  Calendar,
  Award,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Challenge, ChallengeLeaderboard, ChallengeParticipation } from '@/lib/services/challengeService';

interface ChallengeLeaderboardProps {
  challenge: Challenge;
  leaderboard: ChallengeLeaderboard;
  userParticipation?: ChallengeParticipation;
  onClose?: () => void;
  className?: string;
}

interface LeaderboardEntry {
  position: number;
  userId: string;
  displayName: string;
  profileImage?: string;
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
  tier: string;
  isVerified: boolean;
  isCurrentUser?: boolean;
}

const ChallengeLeaderboardComponent: React.FC<ChallengeLeaderboardProps> = ({
  challenge,
  leaderboard,
  userParticipation,
  onClose,
  className = ''
}) => {
  const [showAll, setShowAll] = useState(false);
  
  // Convert leaderboard data to enriched entries
  const leaderboardEntries: LeaderboardEntry[] = leaderboard.participants.map(participant => ({
    ...participant,
    targetValue: challenge.targetValue,
    progressPercentage: (participant.currentValue / challenge.targetValue) * 100,
    isCurrentUser: userParticipation?.userId === participant.userId
  }));

  // Get display entries (top 10 or all based on showAll state)
  const displayEntries = showAll ? leaderboardEntries : leaderboardEntries.slice(0, 10);
  
  // Find current user's position if they're not in top 10
  const currentUserEntry = leaderboardEntries.find(entry => entry.isCurrentUser);
  const showUserPosition = currentUserEntry && currentUserEntry.position > 10 && !showAll;

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) {
      return <Badge className="bg-yellow-100 text-yellow-800">Champion</Badge>;
    } else if (position <= 3) {
      return <Badge className="bg-orange-100 text-orange-800">Podium</Badge>;
    } else if (position <= 10) {
      return <Badge className="bg-blue-100 text-blue-800">Top 10</Badge>;
    }
    return null;
  };

  const getRewardForPosition = (position: number) => {
    if (position === 1) return challenge.rewards.winner;
    if (position <= 3) return challenge.rewards.top3;
    if (position <= 10) return challenge.rewards.top10;
    return challenge.rewards.participation;
  };

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toLocaleString();
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const reward = getRewardForPosition(entry.position);
    const isHighlighted = entry.isCurrentUser;
    
    return (
      <div
        key={entry.userId}
        className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
          isHighlighted 
            ? 'bg-blue-50 border-2 border-blue-200' 
            : 'hover:bg-gray-50'
        }`}
      >
        {/* Position */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-200">
          {getPositionIcon(entry.position) || (
            <span className="text-lg font-bold text-gray-700">
              {entry.position}
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="w-10 h-10">
            <AvatarImage src={entry.profileImage} alt={entry.displayName} />
            <AvatarFallback>
              {entry.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 truncate">
                {entry.displayName}
                {isHighlighted && (
                  <span className="text-blue-600 ml-1">(You)</span>
                )}
              </h4>
              {entry.isVerified && (
                <Star className="w-4 h-4 text-blue-500 fill-current" />
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="capitalize">{entry.tier} Tier</span>
              {getPositionBadge(entry.position)}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col items-end gap-2 min-w-0 w-32">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatValue(entry.currentValue)}
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(entry.progressPercentage)}% complete
            </div>
          </div>
          
          <Progress 
            value={entry.progressPercentage} 
            className="w-full h-2"
          />
        </div>

        {/* Reward */}
        <div className="text-right min-w-0 w-20">
          <div className="text-sm font-semibold text-green-600">
            +{reward.xp} XP
          </div>
          {reward.badge && (
            <div className="text-xs text-gray-500">
              + Badge
            </div>
          )}
          {reward.specialBadge && (
            <div className="text-xs text-purple-600">
              + Special
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChallengeHeader = () => (
    <div className="space-y-4 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{challenge.title}</h2>
          <p className="text-gray-600 mt-1">{challenge.description}</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-lg font-semibold">{challenge.participantCount}</div>
            <div className="text-sm text-gray-600">Participants</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Target className="w-5 h-5 text-green-600" />
          <div>
            <div className="text-lg font-semibold">{formatValue(challenge.targetValue)}</div>
            <div className="text-sm text-gray-600">Target</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-5 h-5 text-orange-600" />
          <div>
            <div className="text-lg font-semibold">
              {Math.ceil((challenge.endDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d
            </div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Award className="w-5 h-5 text-purple-600" />
          <div>
            <div className="text-lg font-semibold">{challenge.rewards.winner.xp}</div>
            <div className="text-sm text-gray-600">Winner XP</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Challenge Leaderboard
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderChallengeHeader()}

        {/* Leaderboard */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Rankings</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              Live Updates
            </div>
          </div>

          <div className="space-y-2">
            {displayEntries.map((entry, index) => renderLeaderboardEntry(entry, index))}
          </div>

          {/* User's position if not in top 10 */}
          {showUserPosition && currentUserEntry && (
            <div className="border-t pt-4 mt-4">
              <div className="text-sm text-gray-600 mb-2">Your Position</div>
              {renderLeaderboardEntry(currentUserEntry, currentUserEntry.position - 1)}
            </div>
          )}

          {/* Show more/less toggle */}
          {leaderboardEntries.length > 10 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Top 10
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All ({leaderboardEntries.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {leaderboardEntries.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No participants yet
            </h3>
            <p className="text-gray-600">
              Be the first to join this challenge and claim the top spot!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengeLeaderboardComponent;
