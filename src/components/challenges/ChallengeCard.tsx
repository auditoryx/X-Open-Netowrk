/**
 * Challenge Card Component
 * 
 * Displays individual challenge information with progress tracking,
 * participation options, and visual appeal.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Star, 
  Medal,
  Clock,
  Target,
  TrendingUp,
  Award,
  Gift
} from 'lucide-react';
import { Challenge, ChallengeParticipation, ChallengeDifficulty } from '@/lib/services/challengeService';
import { Timestamp } from 'firebase/firestore';

interface ChallengeCardProps {
  challenge: Challenge;
  participation?: ChallengeParticipation;
  userPosition?: number;
  onJoin?: (challengeId: string) => Promise<void>;
  onViewLeaderboard?: (challengeId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const difficultyConfig: Record<ChallengeDifficulty, {
  color: string;
  icon: React.ReactNode;
  label: string;
}> = {
  bronze: {
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: <Medal className="w-3 h-3" />,
    label: 'Bronze'
  },
  silver: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <Medal className="w-3 h-3" />,
    label: 'Silver'
  },
  gold: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Trophy className="w-3 h-3" />,
    label: 'Gold'
  },
  platinum: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: <Award className="w-3 h-3" />,
    label: 'Platinum'
  }
};

const challengeTypeIcons = {
  project_completion: <Target className="w-4 h-4" />,
  referral_champion: <Users className="w-4 h-4" />,
  five_star_streak: <Star className="w-4 h-4" />,
  xp_race: <TrendingUp className="w-4 h-4" />,
  response_speed: <Clock className="w-4 h-4" />,
  profile_perfection: <Award className="w-4 h-4" />,
  community_builder: <Users className="w-4 h-4" />,
  consistency_master: <Calendar className="w-4 h-4" />
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  participation,
  userPosition,
  onJoin,
  onViewLeaderboard,
  isLoading = false,
  className = ''
}) => {
  const difficulty = difficultyConfig[challenge.difficulty];
  const typeIcon = challengeTypeIcons[challenge.type];
  
  const isParticipating = !!participation;
  const isActive = challenge.status === 'active';
  const isUpcoming = challenge.status === 'upcoming';
  const isCompleted = challenge.status === 'completed';
  
  const progress = participation?.progressPercentage || 0;
  const position = participation?.position || userPosition;
  
  // Calculate time remaining
  const now = new Date();
  const endDate = challenge.endDate.toDate();
  const timeRemaining = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  
  const formatTimeRemaining = () => {
    if (isCompleted) return 'Completed';
    if (isUpcoming) return 'Starting Soon';
    if (daysRemaining <= 0) return 'Ending Soon';
    if (daysRemaining === 1) return '1 day left';
    return `${daysRemaining} days left`;
  };

  const getStatusColor = () => {
    if (isCompleted) return 'text-gray-500';
    if (isUpcoming) return 'text-blue-600';
    if (daysRemaining <= 1) return 'text-red-600';
    if (daysRemaining <= 3) return 'text-orange-600';
    return 'text-green-600';
  };

  const getPositionBadge = () => {
    if (!position) return null;
    
    let badgeColor = 'bg-gray-100 text-gray-800';
    let icon = null;
    
    if (position === 1) {
      badgeColor = 'bg-yellow-100 text-yellow-800';
      icon = <Trophy className="w-3 h-3" />;
    } else if (position <= 3) {
      badgeColor = 'bg-orange-100 text-orange-800';
      icon = <Medal className="w-3 h-3" />;
    } else if (position <= 10) {
      badgeColor = 'bg-blue-100 text-blue-800';
      icon = <Star className="w-3 h-3" />;
    }
    
    return (
      <Badge className={badgeColor} variant="secondary">
        {icon}
        <span className="ml-1">#{position}</span>
      </Badge>
    );
  };

  const renderRewards = () => {
    const { rewards } = challenge;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Gift className="w-4 h-4" />
          <span className="font-medium">Rewards</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-500" />
              <span className="font-medium">1st Place</span>
            </div>
            <div className="text-gray-600">
              {rewards.winner.xp} XP
              {rewards.winner.specialBadge && (
                <span className="block">+ Special Badge</span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Medal className="w-3 h-3 text-orange-500" />
              <span className="font-medium">Top 3</span>
            </div>
            <div className="text-gray-600">
              {rewards.top3.xp} XP
              {rewards.top3.badge && (
                <span className="block">+ Badge</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${
      isParticipating ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
    } ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {typeIcon}
            <CardTitle className="text-lg font-semibold">
              {challenge.title}
            </CardTitle>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={difficulty.color} variant="secondary">
              {difficulty.icon}
              <span className="ml-1">{difficulty.label}</span>
            </Badge>
            {getPositionBadge()}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          {challenge.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{challenge.participantCount} participants</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{challenge.targetValue.toLocaleString()} {challenge.targetMetric}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${getStatusColor()}`}>
            <Clock className="w-4 h-4" />
            <span className="font-medium">{formatTimeRemaining()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        {isParticipating && participation && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Your Progress</span>
              <span className="text-gray-600">
                {participation.currentValue.toLocaleString()} / {participation.targetValue.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{Math.round(progress)}% complete</span>
              {position && (
                <span>Rank #{position}</span>
              )}
            </div>
          </div>
        )}

        {/* Rewards Section */}
        {!isCompleted && renderRewards()}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!isParticipating && (isActive || isUpcoming) && onJoin && (
            <Button
              onClick={() => onJoin(challenge.id)}
              disabled={isLoading}
              className="flex-1"
              variant={isUpcoming ? "outline" : "default"}
            >
              {isLoading ? 'Joining...' : isUpcoming ? 'Pre-Register' : 'Join Challenge'}
            </Button>
          )}
          
          {challenge.participantCount > 0 && onViewLeaderboard && (
            <Button
              onClick={() => onViewLeaderboard(challenge.id)}
              variant="outline"
              className={isParticipating ? 'flex-1' : ''}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
          )}
        </div>

        {/* Challenge Stats */}
        {isCompleted && (
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {challenge.participantCount}
              </div>
              <div className="text-xs text-gray-500">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(challenge.completionRate)}%
              </div>
              <div className="text-xs text-gray-500">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(challenge.averageProgress)}%
              </div>
              <div className="text-xs text-gray-500">Avg Progress</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
