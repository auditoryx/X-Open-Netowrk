/**
 * Leaderboard Component
 * Displays rankings with different categories and user's position
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Star, 
  Crown, 
  TrendingUp, 
  Users, 
  RefreshCw,
  Award,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLeaderboardData } from '@/lib/hooks/useLeaderboardData';
import { LeaderboardEntry } from '@/lib/services/rankingService';

interface LeaderboardProps {
  className?: string;
  showUserRanking?: boolean;
  showTabs?: boolean;
  limit?: number;
  compact?: boolean;
}

export default function Leaderboard({
  className,
  showUserRanking = true,
  showTabs = true,
  limit = 50,
  compact = false
}: LeaderboardProps) {
  const {
    leaderboard,
    userRanking,
    loading,
    error,
    refreshLeaderboard,
    category,
    setCategory
  } = useLeaderboardData('global', limit);

  if (error) {
    return (
      <Card className={cn("leaderboard-error", className)}>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <Trophy className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={refreshLeaderboard}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const LeaderboardContent = ({ entries }: { entries: LeaderboardEntry[] }) => (
    <div className="space-y-3">
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">No rankings available yet</p>
        </div>
      ) : (
        entries.map((entry, index) => (
          <LeaderboardEntryComponent key={entry.userId} entry={entry} compact={compact} />
        ))
      )}
    </div>
  );

  if (showTabs) {
    return (
      <Card className={cn("leaderboard", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshLeaderboard}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* User's Ranking */}
          {showUserRanking && userRanking && (
            <div className="bg-muted rounded-lg p-3 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    #{userRanking.rank}
                  </div>
                  <div>
                    <p className="font-medium">Your Ranking</p>
                    <p className="text-sm text-muted-foreground">
                      {userRanking.score.toFixed(1)} points • Top {Math.round((userRanking.rank / userRanking.totalUsers) * 100)}%
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  You
                </Badge>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <Tabs value={category} onValueChange={(value) => setCategory(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="global" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Global
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="verified" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </TabsTrigger>
              <TabsTrigger value="new" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Rising
              </TabsTrigger>
            </TabsList>

            <TabsContent value={category} className="mt-4">
              {loading ? (
                <LeaderboardSkeleton compact={compact} />
              ) : (
                <LeaderboardContent entries={leaderboard} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Simple leaderboard without tabs
  return (
    <Card className={cn("leaderboard", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Creators
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshLeaderboard}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <LeaderboardSkeleton compact={compact} />
        ) : (
          <LeaderboardContent entries={leaderboard} />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Individual Leaderboard Entry Component
 */
function LeaderboardEntryComponent({ entry, compact = false }: { entry: LeaderboardEntry; compact?: boolean }) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
            {rank}
          </div>
        );
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'signature':
        return 'bg-purple-500/20 text-purple-700 border-purple-200';
      case 'verified':
        return 'bg-blue-500/20 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-200';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          {getRankIcon(entry.rank)}
          {entry.badge && <span className="text-lg">{entry.badge}</span>}
        </div>
        
        <Avatar className="w-8 h-8">
          <AvatarImage src={entry.profileImage} alt={entry.displayName} />
          <AvatarFallback className="text-xs">
            {entry.displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{entry.displayName}</p>
            {entry.isVerified && (
              <Shield className="w-3 h-3 text-blue-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {entry.score.toFixed(1)} pts • {entry.totalXP} XP
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      {/* Rank and Badge */}
      <div className="flex items-center gap-2 min-w-0">
        {getRankIcon(entry.rank)}
        {entry.badge && <span className="text-xl">{entry.badge}</span>}
      </div>
      
      {/* Avatar */}
      <Avatar className="w-12 h-12">
        <AvatarImage src={entry.profileImage} alt={entry.displayName} />
        <AvatarFallback>
          {entry.displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      {/* Creator Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold truncate">{entry.displayName}</p>
          {entry.isVerified && (
            <Shield className="w-4 h-4 text-blue-500" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", getTierColor(entry.tier))}>
            {entry.tier.charAt(0).toUpperCase() + entry.tier.slice(1)}
          </Badge>
          
          {entry.weeklyXP && (
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{entry.weeklyXP} this week
            </Badge>
          )}
        </div>
      </div>
      
      {/* Score */}
      <div className="text-right">
        <p className="font-bold text-lg">{entry.score.toFixed(1)}</p>
        <p className="text-xs text-muted-foreground">{entry.totalXP} XP</p>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton for Leaderboard
 */
function LeaderboardSkeleton({ compact = false }: { compact?: boolean }) {
  const itemCount = compact ? 5 : 10;
  
  return (
    <div className="space-y-3">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "animate-pulse rounded-lg",
            compact ? "p-2 bg-muted/50" : "p-4 border bg-card"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-muted-foreground/20 rounded-full" />
            <div className={cn(
              "bg-muted-foreground/20 rounded-full",
              compact ? "w-8 h-8" : "w-12 h-12"
            )} />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted-foreground/20 rounded w-24" />
              <div className="h-3 bg-muted-foreground/20 rounded w-16" />
            </div>
            <div className="text-right space-y-1">
              <div className="h-5 bg-muted-foreground/20 rounded w-12" />
              <div className="h-3 bg-muted-foreground/20 rounded w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
