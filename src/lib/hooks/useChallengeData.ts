/**
 * Challenge Data Hook
 * 
 * React hook for managing challenge data, user participations,
 * and real-time updates.
 */

import { useState, useEffect, useCallback } from 'react';
import ChallengeService, { 
  Challenge, 
  ChallengeParticipation, 
  ChallengeLeaderboard 
} from '@/lib/services/challengeService';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';

interface UseChallengeDataReturn {
  // Data
  challenges: Challenge[];
  userParticipations: ChallengeParticipation[];
  leaderboards: Map<string, ChallengeLeaderboard>;
  
  // Loading states
  isLoading: boolean;
  isJoining: boolean;
  isUpdating: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  joinChallenge: (challengeId: string) => Promise<void>;
  refreshChallenges: () => Promise<void>;
  refreshUserParticipations: () => Promise<void>;
  getLeaderboard: (challengeId: string) => Promise<ChallengeLeaderboard | null>;
  
  // Stats
  stats: {
    activeChallenges: number;
    userActiveChallenges: number;
    userCompletedChallenges: number;
    totalXPFromChallenges: number;
  };
}

export const useChallengeData = (): UseChallengeDataReturn => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userParticipations, setUserParticipations] = useState<ChallengeParticipation[]>([]);
  const [leaderboards, setLeaderboards] = useState<Map<string, ChallengeLeaderboard>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const challengeService = ChallengeService.getInstance();

  // Fetch all challenges
  const refreshChallenges = useCallback(async () => {
    try {
      setError(null);
      const activeChallenges = await challengeService.getActiveChallenges();
      setChallenges(activeChallenges);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch challenges';
      setError(errorMessage);
      console.error('Error fetching challenges:', err);
    }
  }, [challengeService]);

  // Fetch user participations
  const refreshUserParticipations = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setError(null);
      const participations = await challengeService.getUserChallenges(user.uid);
      setUserParticipations(participations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user participations';
      setError(errorMessage);
      console.error('Error fetching user participations:', err);
    }
  }, [challengeService, user?.uid]);

  // Get leaderboard for a specific challenge
  const getLeaderboard = useCallback(async (challengeId: string): Promise<ChallengeLeaderboard | null> => {
    try {
      setError(null);
      
      // Check if we already have this leaderboard cached
      const cachedLeaderboard = leaderboards.get(challengeId);
      if (cachedLeaderboard) {
        // Check if it's less than 5 minutes old
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (cachedLeaderboard.lastUpdated.toDate() > fiveMinutesAgo) {
          return cachedLeaderboard;
        }
      }

      const leaderboard = await challengeService.getChallengeLeaderboard(challengeId);
      if (leaderboard) {
        setLeaderboards(prev => new Map(prev.set(challengeId, leaderboard)));
      }
      return leaderboard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(errorMessage);
      console.error('Error fetching leaderboard:', err);
      return null;
    }
  }, [challengeService, leaderboards]);

  // Join a challenge
  const joinChallenge = useCallback(async (challengeId: string): Promise<void> => {
    if (!user?.uid) {
      toast.error('You must be logged in to join challenges');
      return;
    }

    setIsJoining(true);
    try {
      setError(null);
      await challengeService.joinChallenge(challengeId, user.uid);
      
      // Refresh participations to reflect the new challenge
      await refreshUserParticipations();
      
      // Refresh challenges to update participant count
      await refreshChallenges();
      
      // Show success message
      const challenge = challenges.find(c => c.id === challengeId);
      toast.success(`Successfully joined "${challenge?.title || 'Challenge'}"!`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join challenge';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error joining challenge:', err);
    } finally {
      setIsJoining(false);
    }
  }, [challengeService, user?.uid, refreshUserParticipations, refreshChallenges, challenges]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          refreshChallenges(),
          refreshUserParticipations()
        ]);
      } catch (err) {
        console.error('Error loading initial challenge data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [refreshChallenges, refreshUserParticipations]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isJoining && !isUpdating) {
        Promise.all([
          refreshChallenges(),
          refreshUserParticipations()
        ]).catch(err => {
          console.error('Error during auto-refresh:', err);
        });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isLoading, isJoining, isUpdating, refreshChallenges, refreshUserParticipations]);

  // Calculate stats
  const stats = {
    activeChallenges: challenges.filter(c => c.status === 'active').length,
    userActiveChallenges: userParticipations.filter(p => {
      const challenge = challenges.find(c => c.id === p.challengeId);
      return challenge?.status === 'active';
    }).length,
    userCompletedChallenges: userParticipations.filter(p => {
      const challenge = challenges.find(c => c.id === p.challengeId);
      return challenge?.status === 'completed';
    }).length,
    totalXPFromChallenges: userParticipations.reduce((total, p) => {
      return total + (p.rewardsAwarded?.xp || 0);
    }, 0)
  };

  return {
    // Data
    challenges,
    userParticipations,
    leaderboards,
    
    // Loading states
    isLoading,
    isJoining,
    isUpdating,
    
    // Error state
    error,
    
    // Actions
    joinChallenge,
    refreshChallenges,
    refreshUserParticipations,
    getLeaderboard,
    
    // Stats
    stats
  };
};

// Hook for managing a specific challenge
export const useChallenge = (challengeId: string) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participation, setParticipation] = useState<ChallengeParticipation | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const challengeService = ChallengeService.getInstance();

  useEffect(() => {
    const loadChallengeData = async () => {
      if (!challengeId) return;
      
      setIsLoading(true);
      try {
        setError(null);
        
        // Get challenge details from active challenges
        const activeChallenges = await challengeService.getActiveChallenges();
        const challengeData = activeChallenges.find(c => c.id === challengeId);
        setChallenge(challengeData || null);

        // Get user participation if logged in
        if (user?.uid) {
          const userChallenges = await challengeService.getUserChallenges(user.uid);
          const userParticipation = userChallenges.find(p => p.challengeId === challengeId);
          setParticipation(userParticipation || null);
        }

        // Get leaderboard
        const leaderboardData = await challengeService.getChallengeLeaderboard(challengeId);
        setLeaderboard(leaderboardData);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load challenge data';
        setError(errorMessage);
        console.error('Error loading challenge data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadChallengeData();
  }, [challengeId, user?.uid, challengeService]);

  return {
    challenge,
    participation,
    leaderboard,
    isLoading,
    error
  };
};

export default useChallengeData;
