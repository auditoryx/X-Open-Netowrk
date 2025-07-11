/**
 * Badge UI Component Tests
 * Tests for badge display components and interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Timestamp } from 'firebase/firestore';
import BadgeCard from '../BadgeCard';
import BadgeGrid from '../BadgeGrid';
import BadgeProgress from '../BadgeProgress';
import BadgeNotification from '../BadgeNotification';

// Mock data
const mockBadge = {
  badgeId: 'session_starter',
  name: 'Session Starter',
  description: 'Complete your first booking session',
  iconUrl: '/badges/session-starter.svg',
  category: 'milestone' as const,
  rarity: 'common' as const,
  progress: { current: 1, target: 1, percentage: 100 },
  isEarned: true,
  awardedAt: Timestamp.now()
};

const mockBadges = [
  mockBadge,
  {
    badgeId: 'certified_mix',
    name: 'Certified Mix',
    description: 'Receive your first 5-star review',
    iconUrl: '/badges/certified-mix.svg',
    category: 'achievement' as const,
    rarity: 'rare' as const,
    progress: { current: 0, target: 1, percentage: 0 },
    isEarned: false
  },
  {
    badgeId: 'studio_regular',
    name: 'Studio Regular',
    description: 'Complete 10 projects',
    iconUrl: '/badges/studio-regular.svg',
    category: 'milestone' as const,
    rarity: 'epic' as const,
    progress: { current: 7, target: 10, percentage: 70 },
    isEarned: false
  }
];

describe('BadgeCard Component', () => {
  it('renders earned badge correctly', () => {
    render(<BadgeCard {...mockBadge} />);
    
    expect(screen.getByText('Session Starter')).toBeInTheDocument();
    expect(screen.getByText('Complete your first booking session')).toBeInTheDocument();
    expect(screen.getByText('common')).toBeInTheDocument();
    expect(screen.getByText('Earned')).toBeInTheDocument();
  });

  it('renders in-progress badge with progress bar', () => {
    const inProgressBadge = {
      ...mockBadge,
      isEarned: false,
      progress: { current: 7, target: 10, percentage: 70 },
      awardedAt: undefined
    };
    
    render(<BadgeCard {...inProgressBadge} />);
    
    expect(screen.getByText('Session Starter')).toBeInTheDocument();
    expect(screen.getByText('7 / 10')).toBeInTheDocument();
    expect(screen.queryByText('Earned')).not.toBeInTheDocument();
  });

  it('applies correct rarity styling', () => {
    const legendaryBadge = {
      ...mockBadge,
      rarity: 'legendary' as const
    };
    
    const { container } = render(<BadgeCard {...legendaryBadge} />);
    
    expect(container.querySelector('.border-yellow-400')).toBeInTheDocument();
    expect(screen.getByText('legendary')).toBeInTheDocument();
  });

  it('handles different sizes correctly', () => {
    const { rerender } = render(<BadgeCard {...mockBadge} size="small" />);
    expect(screen.getByText('Session Starter')).toBeInTheDocument();
    
    rerender(<BadgeCard {...mockBadge} size="large" />);
    expect(screen.getByText('Session Starter')).toBeInTheDocument();
  });
});

describe('BadgeGrid Component', () => {
  it('renders loading state', () => {
    render(<BadgeGrid badges={[]} loading={true} />);
    
    expect(screen.getByText('Loading badges...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<BadgeGrid badges={[]} error="Failed to load badges" />);
    
    expect(screen.getByText('Failed to load badges')).toBeInTheDocument();
  });

  it('renders badges with stats', () => {
    render(<BadgeGrid badges={mockBadges} />);
    
    expect(screen.getByText('Badges')).toBeInTheDocument();
    expect(screen.getByText('1 of 3 badges earned (33%)')).toBeInTheDocument();
    expect(screen.getByText('Session Starter')).toBeInTheDocument();
    expect(screen.getByText('Certified Mix')).toBeInTheDocument();
    expect(screen.getByText('Studio Regular')).toBeInTheDocument();
  });

  it('filters badges correctly', async () => {
    render(<BadgeGrid badges={mockBadges} showFilters={true} />);
    
    // Test earned filter
    fireEvent.click(screen.getByText('Earned'));
    await waitFor(() => {
      expect(screen.getByText('Session Starter')).toBeInTheDocument();
      expect(screen.queryByText('Certified Mix')).not.toBeInTheDocument();
    });
    
    // Test in-progress filter
    fireEvent.click(screen.getByText('In progress'));
    await waitFor(() => {
      expect(screen.queryByText('Session Starter')).not.toBeInTheDocument();
      expect(screen.getByText('Studio Regular')).toBeInTheDocument();
    });
  });

  it('sorts badges correctly', async () => {
    render(<BadgeGrid badges={mockBadges} showFilters={true} />);
    
    const sortSelect = screen.getByDisplayValue('Sort by Rarity');
    fireEvent.change(sortSelect, { target: { value: SCHEMA_FIELDS.USER.NAME } });
    
    await waitFor(() => {
      const badgeNames = screen.getAllByText(/Session Starter|Certified Mix|Studio Regular/);
      expect(badgeNames[0]).toHaveTextContent('Certified Mix'); // Alphabetical first
    });
  });

  it('searches badges correctly', async () => {
    render(<BadgeGrid badges={mockBadges} showSearch={true} />);
    
    const searchInput = screen.getByPlaceholderText('Search badges...');
    fireEvent.change(searchInput, { target: { value: 'starter' } });
    
    await waitFor(() => {
      expect(screen.getByText('Session Starter')).toBeInTheDocument();
      expect(screen.queryByText('Certified Mix')).not.toBeInTheDocument();
    });
  });
});

describe('BadgeProgress Component', () => {
  it('renders in-progress badges by default', () => {
    render(<BadgeProgress badges={mockBadges} />);
    
    expect(screen.getByText('Badge Progress')).toBeInTheDocument();
    expect(screen.getByText('Studio Regular')).toBeInTheDocument();
    expect(screen.queryByText('Session Starter')).not.toBeInTheDocument(); // Earned, so hidden
  });

  it('renders completed badges when showCompleted is true', () => {
    render(<BadgeProgress badges={mockBadges} showCompleted={true} />);
    
    expect(screen.getByText('Session Starter')).toBeInTheDocument();
    expect(screen.queryByText('Studio Regular')).not.toBeInTheDocument(); // Not earned, so hidden
  });

  it('renders empty state correctly', () => {
    render(<BadgeProgress badges={[]} />);
    
    expect(screen.getByText('No badges earned yet')).toBeInTheDocument();
  });

  it('limits visible badges correctly', () => {
    const manyBadges = Array.from({ length: 10 }, (_, i) => ({
      ...mockBadges[1],
      badgeId: `badge_${i}`,
      name: `Badge ${i}`
    }));
    
    render(<BadgeProgress badges={manyBadges} maxVisible={3} />);
    
    expect(screen.getByText('View all 10 badges →')).toBeInTheDocument();
  });

  it('renders compact view correctly', () => {
    render(<BadgeProgress badges={mockBadges} compact={true} />);
    
    expect(screen.getByText('Studio Regular')).toBeInTheDocument();
    // In compact view, descriptions should be shorter or hidden
  });
});

describe('BadgeNotification Component', () => {
  it('renders notification content', () => {
    const onClose = jest.fn();
    
    render(
      <BadgeNotification
        badgeId="session_starter"
        name="Session Starter"
        description="Complete your first booking session"
        iconUrl="/badges/session-starter.svg"
        rarity="common"
        xpBonus={50}
        isVisible={true}
        onClose={onClose}
      />
    );
    
    expect(screen.getByText('🎉 Badge Earned!')).toBeInTheDocument();
    expect(screen.getByText('Session Starter')).toBeInTheDocument();
    expect(screen.getByText('Complete your first booking session')).toBeInTheDocument();
    expect(screen.getByText('COMMON')).toBeInTheDocument();
    expect(screen.getByText('+50 XP Bonus!')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    
    render(
      <BadgeNotification
        badgeId="session_starter"
        name="Session Starter"
        description="Complete your first booking session"
        iconUrl="/badges/session-starter.svg"
        rarity="common"
        isVisible={true}
        onClose={onClose}
      />
    );
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when not visible', () => {
    const onClose = jest.fn();
    
    render(
      <BadgeNotification
        badgeId="session_starter"
        name="Session Starter"
        description="Complete your first booking session"
        iconUrl="/badges/session-starter.svg"
        rarity="common"
        isVisible={false}
        onClose={onClose}
      />
    );
    
    expect(screen.queryByText('Session Starter')).not.toBeInTheDocument();
  });

  it('applies correct rarity styling', () => {
    const onClose = jest.fn();
    
    const { container } = render(
      <BadgeNotification
        badgeId="verified_pro"
        name="Verified Pro"
        description="Achieve Verified tier status"
        iconUrl="/badges/verified-pro.svg"
        rarity="legendary"
        isVisible={true}
        onClose={onClose}
      />
    );
    
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
    expect(container.querySelector('.from-yellow-500')).toBeInTheDocument();
  });
});
