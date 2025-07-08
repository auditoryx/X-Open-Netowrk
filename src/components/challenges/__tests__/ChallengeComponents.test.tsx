/**
 * Challenge Components Tests
 * Comprehensive test suite for challenge UI components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { Timestamp } from 'firebase/firestore';
import ChallengeCard from '../ChallengeCard';
import ChallengeGrid from '../ChallengeGrid';
import ChallengeLeaderboard from '../ChallengeLeaderboard';
import { Challenge, ChallengeParticipation, ChallengeLeaderboard as ChallengeLeaderboardType } from '@/lib/services/challengeService';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value}></div>
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value || defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button data-testid={`tab-${value}`} onClick={onClick}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  )
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data-testid="search-input"
    />
  )
}));

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="avatar-image" />,
  AvatarFallback: ({ children }: any) => <div data-testid="avatar-fallback">{children}</div>
}));

// Mock icons
jest.mock('lucide-react', () => ({
  Trophy: () => <div data-testid="trophy-icon" />,
  Medal: () => <div data-testid="medal-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Target: () => <div data-testid="target-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Award: () => <div data-testid="award-icon" />,
  Gift: () => <div data-testid="gift-icon" />,
  Crown: () => <div data-testid="crown-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />
}));

describe('ChallengeCard', () => {
  const mockChallenge: Challenge = {
    id: 'test-challenge',
    title: 'Test Challenge',
    description: 'A test challenge description',
    type: 'xp_race',
    difficulty: 'gold',
    status: 'active',
    startDate: Timestamp.fromDate(new Date('2024-01-01')),
    endDate: Timestamp.fromDate(new Date('2024-01-31')),
    targetMetric: 'totalXP',
    targetValue: 1000,
    minimumParticipants: 5,
    rewards: {
      winner: { xp: 500, specialBadge: 'champion' },
      top3: { xp: 300, badge: 'top_performer' },
      top10: { xp: 150, badge: 'competitor' },
      participation: { xp: 50 }
    },
    participantCount: 25,
    completionRate: 0,
    averageProgress: 0,
    createdAt: Timestamp.fromDate(new Date('2024-01-01')),
    createdBy: 'system',
    tags: ['monthly'],
    isRecurring: true
  };

  const mockParticipation: ChallengeParticipation = {
    challengeId: 'test-challenge',
    userId: 'test-user',
    currentValue: 500,
    targetValue: 1000,
    progressPercentage: 50,
    position: 5,
    isWinner: false,
    isTop3: false,
    isTop10: true,
    joinedAt: Timestamp.fromDate(new Date('2024-01-01')),
    lastUpdated: Timestamp.fromDate(new Date('2024-01-15')),
    rewardsAwarded: { xp: 0 },
    rewardsDistributed: false
  };

  test('renders challenge card with basic information', () => {
    render(<ChallengeCard challenge={mockChallenge} />);

    expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    expect(screen.getByText('A test challenge description')).toBeInTheDocument();
    expect(screen.getByText('Gold')).toBeInTheDocument();
    expect(screen.getByText('25 participants')).toBeInTheDocument();
    expect(screen.getByText('1,000 totalXP')).toBeInTheDocument();
  });

  test('displays user participation progress when provided', () => {
    render(
      <ChallengeCard 
        challenge={mockChallenge} 
        participation={mockParticipation}
      />
    );

    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    expect(screen.getByText('500 / 1,000')).toBeInTheDocument();
    expect(screen.getByText('50% complete')).toBeInTheDocument();
    expect(screen.getByText('Rank #5')).toBeInTheDocument();
    
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveAttribute('data-value', '50');
  });

  test('shows join button for non-participating users', () => {
    const mockOnJoin = jest.fn();
    
    render(
      <ChallengeCard 
        challenge={mockChallenge} 
        onJoin={mockOnJoin}
      />
    );

    const joinButton = screen.getByText('Join Challenge');
    expect(joinButton).toBeInTheDocument();
    
    fireEvent.click(joinButton);
    expect(mockOnJoin).toHaveBeenCalledWith('test-challenge');
  });

  test('shows leaderboard button when available', () => {
    const mockOnViewLeaderboard = jest.fn();
    
    render(
      <ChallengeCard 
        challenge={mockChallenge} 
        onViewLeaderboard={mockOnViewLeaderboard}
      />
    );

    const leaderboardButton = screen.getByText('Leaderboard');
    expect(leaderboardButton).toBeInTheDocument();
    
    fireEvent.click(leaderboardButton);
    expect(mockOnViewLeaderboard).toHaveBeenCalledWith('test-challenge');
  });

  test('displays position badge for top performers', () => {
    render(
      <ChallengeCard 
        challenge={mockChallenge} 
        participation={mockParticipation}
      />
    );

    expect(screen.getByText('#5')).toBeInTheDocument();
  });

  test('shows different styling for completed challenges', () => {
    const completedChallenge = {
      ...mockChallenge,
      status: 'completed' as const,
      completionRate: 75,
      averageProgress: 68
    };

    render(<ChallengeCard challenge={completedChallenge} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument(); // participants
    expect(screen.getByText('75%')).toBeInTheDocument(); // completion
    expect(screen.getByText('68%')).toBeInTheDocument(); // avg progress
  });

  test('handles loading state correctly', () => {
    render(
      <ChallengeCard 
        challenge={mockChallenge} 
        onJoin={jest.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByText('Joining...')).toBeInTheDocument();
  });
});

describe('ChallengeGrid', () => {
  const mockChallenges: Challenge[] = [
    {
      id: 'challenge-1',
      title: 'Challenge 1',
      description: 'First challenge',
      type: 'xp_race',
      difficulty: 'bronze',
      status: 'active',
      startDate: Timestamp.fromDate(new Date('2024-01-01')),
      endDate: Timestamp.fromDate(new Date('2024-01-31')),
      targetMetric: 'totalXP',
      targetValue: 500,
      minimumParticipants: 5,
      rewards: {
        winner: { xp: 250 },
        top3: { xp: 150 },
        top10: { xp: 75 },
        participation: { xp: 25 }
      },
      participantCount: 10,
      completionRate: 0,
      averageProgress: 0,
      createdAt: Timestamp.fromDate(new Date('2024-01-01')),
      createdBy: 'system',
      tags: [],
      isRecurring: false
    },
    {
      id: 'challenge-2',
      title: 'Challenge 2',
      description: 'Second challenge',
      type: 'project_completion',
      difficulty: 'silver',
      status: 'upcoming',
      startDate: Timestamp.fromDate(new Date('2024-02-01')),
      endDate: Timestamp.fromDate(new Date('2024-02-28')),
      targetMetric: 'projectsCompleted',
      targetValue: 10,
      minimumParticipants: 5,
      rewards: {
        winner: { xp: 400 },
        top3: { xp: 250 },
        top10: { xp: 125 },
        participation: { xp: 40 }
      },
      participantCount: 5,
      completionRate: 0,
      averageProgress: 0,
      createdAt: Timestamp.fromDate(new Date('2024-01-15')),
      createdBy: 'system',
      tags: [],
      isRecurring: false
    }
  ];

  const mockParticipations: ChallengeParticipation[] = [
    {
      challengeId: 'challenge-1',
      userId: 'test-user',
      currentValue: 250,
      targetValue: 500,
      progressPercentage: 50,
      position: 3,
      isWinner: false,
      isTop3: true,
      isTop10: true,
      joinedAt: Timestamp.fromDate(new Date('2024-01-01')),
      lastUpdated: Timestamp.fromDate(new Date('2024-01-15')),
      rewardsAwarded: { xp: 0 },
      rewardsDistributed: false
    }
  ];

  test('renders challenge grid with statistics', () => {
    render(
      <ChallengeGrid 
        challenges={mockChallenges}
        userParticipations={mockParticipations}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // Active challenges
    expect(screen.getByText('1')).toBeInTheDocument(); // Upcoming challenges
    expect(screen.getByText('1')).toBeInTheDocument(); // Joined challenges
  });

  test('displays all challenges by default', () => {
    render(
      <ChallengeGrid 
        challenges={mockChallenges}
        userParticipations={mockParticipations}
      />
    );

    expect(screen.getByText('Challenge 1')).toBeInTheDocument();
    expect(screen.getByText('Challenge 2')).toBeInTheDocument();
  });

  test('filters challenges by search query', async () => {
    render(
      <ChallengeGrid 
        challenges={mockChallenges}
        userParticipations={mockParticipations}
      />
    );

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Challenge 1' } });

    await waitFor(() => {
      expect(screen.getByText('Challenge 1')).toBeInTheDocument();
      expect(screen.queryByText('Challenge 2')).not.toBeInTheDocument();
    });
  });

  test('shows empty state when no challenges match filters', () => {
    render(
      <ChallengeGrid 
        challenges={[]}
        userParticipations={[]}
      />
    );

    expect(screen.getByText('No challenges available')).toBeInTheDocument();
  });

  test('handles join challenge callback', () => {
    const mockOnJoin = jest.fn();
    
    render(
      <ChallengeGrid 
        challenges={mockChallenges}
        userParticipations={[]}
        onJoinChallenge={mockOnJoin}
      />
    );

    // This would trigger on ChallengeCard interactions
    // The actual join button is in ChallengeCard component
  });

  test('displays loading state', () => {
    render(
      <ChallengeGrid 
        challenges={mockChallenges}
        userParticipations={mockParticipations}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading challenges...')).toBeInTheDocument();
  });
});

describe('ChallengeLeaderboard', () => {
  const mockChallenge: Challenge = {
    id: 'test-challenge',
    title: 'Test Challenge',
    description: 'A test challenge',
    type: 'xp_race',
    difficulty: 'gold',
    status: 'active',
    startDate: Timestamp.fromDate(new Date('2024-01-01')),
    endDate: Timestamp.fromDate(new Date('2024-01-31')),
    targetMetric: 'totalXP',
    targetValue: 1000,
    minimumParticipants: 5,
    rewards: {
      winner: { xp: 500, specialBadge: 'champion' },
      top3: { xp: 300, badge: 'top_performer' },
      top10: { xp: 150, badge: 'competitor' },
      participation: { xp: 50 }
    },
    participantCount: 15,
    completionRate: 0,
    averageProgress: 0,
    createdAt: Timestamp.fromDate(new Date('2024-01-01')),
    createdBy: 'system',
    tags: [],
    isRecurring: false
  };

  const mockLeaderboard: ChallengeLeaderboardType = {
    challengeId: 'test-challenge',
    participants: [
      {
        userId: 'user-1',
        displayName: 'User One',
        currentValue: 1000,
        position: 1,
        tier: 'verified',
        isVerified: true
      },
      {
        userId: 'user-2',
        displayName: 'User Two',
        currentValue: 800,
        position: 2,
        tier: 'standard',
        isVerified: false
      },
      {
        userId: 'user-3',
        displayName: 'User Three',
        currentValue: 600,
        position: 3,
        tier: 'standard',
        isVerified: false
      }
    ],
    lastUpdated: Timestamp.fromDate(new Date('2024-01-15'))
  };

  const mockUserParticipation: ChallengeParticipation = {
    challengeId: 'test-challenge',
    userId: 'user-2',
    currentValue: 800,
    targetValue: 1000,
    progressPercentage: 80,
    position: 2,
    isWinner: false,
    isTop3: true,
    isTop10: true,
    joinedAt: Timestamp.fromDate(new Date('2024-01-01')),
    lastUpdated: Timestamp.fromDate(new Date('2024-01-15')),
    rewardsAwarded: { xp: 0 },
    rewardsDistributed: false
  };

  test('renders leaderboard with challenge information', () => {
    render(
      <ChallengeLeaderboard 
        challenge={mockChallenge}
        leaderboard={mockLeaderboard}
      />
    );

    expect(screen.getByText('Challenge Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    expect(screen.getByText('A test challenge')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // participants
    expect(screen.getByText('1k')).toBeInTheDocument(); // target value
  });

  test('displays leaderboard participants correctly', () => {
    render(
      <ChallengeLeaderboard 
        challenge={mockChallenge}
        leaderboard={mockLeaderboard}
      />
    );

    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('User Two')).toBeInTheDocument();
    expect(screen.getByText('User Three')).toBeInTheDocument();
    
    // Check positions
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('highlights current user in leaderboard', () => {
    render(
      <ChallengeLeaderboard 
        challenge={mockChallenge}
        leaderboard={mockLeaderboard}
        userParticipation={mockUserParticipation}
      />
    );

    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  test('shows different badges for different positions', () => {
    render(
      <ChallengeLeaderboard 
        challenge={mockChallenge}
        leaderboard={mockLeaderboard}
      />
    );

    expect(screen.getByText('Champion')).toBeInTheDocument(); // 1st place
    expect(screen.getByText('Podium')).toBeInTheDocument(); // 2nd and 3rd place
  });

  test('displays reward information for each position', () => {
    render(
      <ChallengeLeaderboard 
        challenge={mockChallenge}
        leaderboard={mockLeaderboard}
      />
    );

    expect(screen.getByText('+500 XP')).toBeInTheDocument(); // Winner
    expect(screen.getAllByText('+300 XP')).toHaveLength(2); // Top 3 (2nd and 3rd)
  });

  test('shows progress bars for participants', () => {
    render(
      <ChallengeLeaderboard 
        challenge={mockChallenge}
        leaderboard={mockLeaderboard}
      />
    );

    const progressBars = screen.getAllByTestId('progress');
    expect(progressBars).toHaveLength(3);
    
    // Check progress values
    expect(progressBars[0]).toHaveAttribute('data-value', '100'); // 1000/1000
    expect(progressBars[1]).toHaveAttribute('data-value', '80');  // 800/1000
    expect(progressBars[2]).toHaveAttribute('data-value', '60');  // 600/1000
  });

  test('handles close callback', () => {
    const mockOnClose = jest.fn();
    
    render(
      <ChallengeLeaderboard 
        challenge={mockChallenge}
        leaderboard={mockLeaderboard}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('shows empty state when no participants', () => {
    const emptyLeaderboard = {
      ...mockLeaderboard,
      participants: []
    };

    render(
      <ChallengeLeaderboard 
        challenge={mockChallenge}
        leaderboard={emptyLeaderboard}
      />
    );

    expect(screen.getByText('No participants yet')).toBeInTheDocument();
    expect(screen.getByText('Be the first to join this challenge and claim the top spot!')).toBeInTheDocument();
  });

  test('handles show all/show top 10 toggle', () => {
    const manyParticipants = Array.from({ length: 15 }, (_, i) => ({
      userId: `user-${i + 1}`,
      displayName: `User ${i + 1}`,
      currentValue: 1000 - (i * 50),
      position: i + 1,
      tier: 'standard',
      isVerified: false
    }));

    const largeLeaderboard = {
      ...mockLeaderboard,
      participants: manyParticipants
    };

    render(
      <ChallengeLeaderboard 
        challenge={mockChallenge}
        leaderboard={largeLeaderboard}
      />
    );

    // Should show "Show All" button
    expect(screen.getByText('Show All (15)')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Show All (15)'));
    
    // Should now show "Show Top 10" button
    expect(screen.getByText('Show Top 10')).toBeInTheDocument();
  });
});
