/**
 * Challenge Grid Component
 * 
 * Displays a grid of challenges with filtering, sorting, and pagination.
 * Supports different view modes and challenge categories.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Calendar, 
  Trophy, 
  Users, 
  TrendingUp,
  Clock,
  Star,
  Target,
  Award,
  Medal,
  Gift,
  Zap
} from 'lucide-react';
import ChallengeCard from './ChallengeCard';
import { Challenge, ChallengeParticipation, ChallengeType, ChallengeDifficulty } from '@/lib/services/challengeService';

interface ChallengeGridProps {
  challenges: Challenge[];
  userParticipations: ChallengeParticipation[];
  onJoinChallenge?: (challengeId: string) => Promise<void>;
  onViewLeaderboard?: (challengeId: string) => void;
  isLoading?: boolean;
  className?: string;
}

type SortOption = 'newest' | 'ending-soon' | 'popular' | 'rewards' | 'difficulty';
type FilterTab = 'all' | 'active' | 'upcoming' | 'completed' | 'joined';

const sortOptions: Record<SortOption, { label: string; icon: React.ReactNode }> = {
  newest: { label: 'Newest', icon: <Calendar className="w-4 h-4" /> },
  'ending-soon': { label: 'Ending Soon', icon: <Clock className="w-4 h-4" /> },
  popular: { label: 'Most Popular', icon: <Users className="w-4 h-4" /> },
  rewards: { label: 'Best Rewards', icon: <Gift className="w-4 h-4" /> },
  difficulty: { label: 'Difficulty', icon: <Star className="w-4 h-4" /> }
};

const difficultyOrder: Record<ChallengeDifficulty, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4
};

const ChallengeGrid: React.FC<ChallengeGridProps> = ({
  challenges,
  userParticipations,
  onJoinChallenge,
  onViewLeaderboard,
  isLoading = false,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterTab>('all');
  const [typeFilter, setTypeFilter] = useState<ChallengeType | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<ChallengeDifficulty | 'all'>('all');

  // Create participation lookup
  const participationMap = useMemo(() => {
    const map = new Map<string, ChallengeParticipation>();
    userParticipations.forEach(p => map.set(p.challengeId, p));
    return map;
  }, [userParticipations]);

  // Filter and sort challenges
  const filteredAndSortedChallenges = useMemo(() => {
    let filtered = challenges.filter(challenge => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!challenge.title.toLowerCase().includes(query) &&
            !challenge.description.toLowerCase().includes(query) &&
            !challenge.type.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Tab filter
      const participation = participationMap.get(challenge.id);
      switch (filterBy) {
        case 'active':
          return challenge.status === 'active';
        case 'upcoming':
          return challenge.status === 'upcoming';
        case 'completed':
          return challenge.status === 'completed';
        case 'joined':
          return !!participation;
        default:
          return true;
      }
    });

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(c => c.difficulty === difficultyFilter);
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.seconds - a.createdAt.seconds;
        case 'ending-soon':
          if (a.status === 'completed' && b.status === 'completed') return 0;
          if (a.status === 'completed') return 1;
          if (b.status === 'completed') return -1;
          return a.endDate.seconds - b.endDate.seconds;
        case 'popular':
          return b.participantCount - a.participantCount;
        case 'rewards':
          return b.rewards.winner.xp - a.rewards.winner.xp;
        case 'difficulty':
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        default:
          return 0;
      }
    });
  }, [challenges, searchQuery, sortBy, filterBy, typeFilter, difficultyFilter, participationMap]);

  // Stats for different tabs
  const stats = useMemo(() => {
    const activeChallenges = challenges.filter(c => c.status === 'active').length;
    const upcomingChallenges = challenges.filter(c => c.status === 'upcoming').length;
    const completedChallenges = challenges.filter(c => c.status === 'completed').length;
    const joinedChallenges = userParticipations.length;

    return {
      all: challenges.length,
      active: activeChallenges,
      upcoming: upcomingChallenges,
      completed: completedChallenges,
      joined: joinedChallenges
    };
  }, [challenges, userParticipations]);

  const renderEmptyState = () => (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchQuery ? 'No challenges found' : 'No challenges available'}
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          {searchQuery 
            ? 'Try adjusting your search or filters to find more challenges.'
            : 'New challenges will appear here when they become available.'
          }
        </p>
        {searchQuery && (
          <Button
            variant="outline"
            onClick={() => setSearchQuery('')}
            className="mt-4"
          >
            Clear Search
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderFilterControls = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort */}
      <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(sortOptions).map(([value, { label, icon }]) => (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                {icon}
                {label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select value={typeFilter} onValueChange={(value: ChallengeType | 'all') => setTypeFilter(value)}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="project_completion">Projects</SelectItem>
          <SelectItem value="referral_champion">Referrals</SelectItem>
          <SelectItem value="five_star_streak">Quality</SelectItem>
          <SelectItem value="xp_race">XP Race</SelectItem>
          <SelectItem value="response_speed">Speed</SelectItem>
          <SelectItem value="community_builder">Community</SelectItem>
        </SelectContent>
      </Select>

      {/* Difficulty Filter */}
      <Select value={difficultyFilter} onValueChange={(value: ChallengeDifficulty | 'all') => setDifficultyFilter(value)}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="bronze">Bronze</SelectItem>
          <SelectItem value="silver">Silver</SelectItem>
          <SelectItem value="gold">Gold</SelectItem>
          <SelectItem value="platinum">Platinum</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderChallengeStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.upcoming}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.joined}</div>
              <div className="text-sm text-gray-600">Joined</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={className}>
      {/* Challenge Stats */}
      {renderChallengeStats()}

      {/* Tab Navigation */}
      <Tabs value={filterBy} onValueChange={(value: FilterTab) => setFilterBy(value)} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {stats.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            Active
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {stats.active}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            Upcoming
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {stats.upcoming}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="joined" className="flex items-center gap-2">
            Joined
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {stats.joined}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            Completed
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {stats.completed}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filter Controls */}
      {renderFilterControls()}

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedChallenges.length === 0 ? (
          renderEmptyState()
        ) : (
          filteredAndSortedChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              participation={participationMap.get(challenge.id)}
              onJoin={onJoinChallenge}
              onViewLeaderboard={onViewLeaderboard}
              isLoading={isLoading}
            />
          ))
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading challenges...</span>
        </div>
      )}
    </div>
  );
};

export default ChallengeGrid;
