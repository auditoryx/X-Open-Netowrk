/**
 * Leaderboard Widget
 * Compact leaderboard display for dashboard integration
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Crown, 
  ArrowUpRight,
  TrendingUp,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLeaderboardData } from '@/lib/hooks/useLeaderboardData';
import Link from 'next/link';

interface LeaderboardWidgetProps {
  className?: string;
  showHeader?: boolean;
  maxEntries?: number;
  category?: 'global' | 'weekly' | 'verified' | 'new';
}

export default function LeaderboardWidget({
  className,
  showHeader = true,
  maxEntries = 5,
  category = 'global'
}: LeaderboardWidgetProps) {
  const { leaderboard, loading } = useLeaderboardData(category, maxEntries);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
            {rank}
          </div>
        );
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'weekly':
        return 'This Week';
      case 'verified':
        return 'Verified';
      case 'new':
        return 'Rising Stars';
      default:
        return 'Top Creators';
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'weekly':
        return <TrendingUp className="w-4 h-4" />;
      case 'verified':
        return <Shield className="w-4 h-4" />;
      case 'new':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className={cn("leaderboard-widget", className)}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              {getCategoryIcon()}
              {getCategoryLabel()}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-3">
          {Array.from({ length: maxEntries }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 bg-muted rounded-full" />
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-muted rounded w-20" />
                <div className="h-2 bg-muted rounded w-12" />
              </div>
              <div className="h-3 bg-muted rounded w-8" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("leaderboard-widget", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {getCategoryIcon()}
              {getCategoryLabel()}
            </CardTitle>
            <Link href="/dashboard/leaderboard">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-4">
            <Trophy className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">No rankings yet</p>
          </div>
        ) : (
          leaderboard.slice(0, maxEntries).map((entry) => (
            <div key={entry.userId} className="flex items-center gap-3 group hover:bg-muted/50 rounded-lg p-1 -m-1 transition-colors">
              {/* Rank */}
              <div className="flex items-center gap-1">
                {getRankIcon(entry.rank)}
                {entry.badge && <span className="text-sm">{entry.badge}</span>}
              </div>
              
              {/* Avatar */}
              <Avatar className="w-8 h-8">
                <AvatarImage src={entry.profileImage} alt={entry.displayName} />
                <AvatarFallback className="text-xs">
                  {entry.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium truncate">{entry.displayName}</p>
                  {entry.isVerified && (
                    <Shield className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {entry.totalXP} XP
                </p>
              </div>
              
              {/* Score */}
              <div className="text-right">
                <p className="text-sm font-semibold">{entry.score.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          ))
        )}
        
        {leaderboard.length > 0 && (
          <div className="pt-2 border-t">
            <Link href="/dashboard/leaderboard">
              <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                View Full Leaderboard
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * User Ranking Widget - Shows current user's position
 */
interface UserRankingWidgetProps {
  className?: string;
  showDetails?: boolean;
}

export function UserRankingWidget({ className, showDetails = true }: UserRankingWidgetProps) {
  const { userRanking, loading } = useLeaderboardData();

  if (loading) {
    return (
      <Card className={cn("user-ranking-widget", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-3 bg-muted rounded w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userRanking) {
    return (
      <Card className={cn("user-ranking-widget", className)}>
        <CardContent className="p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Start earning XP to get ranked!</p>
        </CardContent>
      </Card>
    );
  }

  const getPercentile = () => {
    const percentile = Math.round((userRanking.rank / userRanking.totalUsers) * 100);
    return percentile;
  };

  const getRankColor = () => {
    const percentile = getPercentile();
    if (percentile <= 10) return 'text-yellow-600 bg-yellow-50';
    if (percentile <= 25) return 'text-blue-600 bg-blue-50';
    if (percentile <= 50) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <Card className={cn("user-ranking-widget", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
            getRankColor()
          )}>
            #{userRanking.rank}
          </div>
          
          <div className="flex-1">
            <p className="font-semibold">Your Ranking</p>
            {showDetails && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {userRanking.score.toFixed(1)} points
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Top {getPercentile()}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    of {userRanking.totalUsers.toLocaleString()} creators
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
