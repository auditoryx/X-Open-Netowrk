/**
 * Challenge Administration Page
 * 
 * Admin interface for managing challenges, viewing analytics,
 * and monitoring challenge system health.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Plus, 
  Settings, 
  BarChart3, 
  Users, 
  Calendar,
  Target,
  Award,
  Zap,
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash
} from 'lucide-react';
import ChallengeService, { 
  Challenge, 
  ChallengeType, 
  ChallengeDifficulty,
  ChallengeAnalytics 
} from '@/lib/services/challengeService';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';

const ChallengeAdministration: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [analytics, setAnalytics] = useState<Map<string, ChallengeAnalytics>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  
  const challengeService = ChallengeService.getInstance();

  // New challenge form state
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'xp_race' as ChallengeType,
    difficulty: 'bronze' as ChallengeDifficulty,
    targetValue: 1000,
    startDate: '',
    endDate: '',
    minimumParticipants: 5
  });

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setIsLoading(true);
      const activeChallenges = await challengeService.getActiveChallenges();
      setChallenges(activeChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async (challengeId: string) => {
    try {
      const analyticsData = await challengeService.generateChallengeAnalytics(challengeId);
      setAnalytics(prev => new Map(prev.set(challengeId, analyticsData)));
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const handleCreateChallenge = async () => {
    if (!newChallenge.title || !newChallenge.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);
      
      const challengeData = {
        ...newChallenge,
        startDate: new Date(newChallenge.startDate),
        endDate: new Date(newChallenge.endDate),
        createdBy: user?.uid || 'admin'
      };

      await challengeService.createChallenge(challengeData);
      
      toast.success('Challenge created successfully');
      setNewChallenge({
        title: '',
        description: '',
        type: 'xp_race',
        difficulty: 'bronze',
        targetValue: 1000,
        startDate: '',
        endDate: '',
        minimumParticipants: 5
      });
      
      await loadChallenges();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Failed to create challenge');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateMonthlyChallenge = async () => {
    try {
      setIsLoading(true);
      const challengeIds = await challengeService.generateMonthlyCharlenges();
      toast.success(`Generated ${challengeIds.length} monthly challenges`);
      await loadChallenges();
    } catch (error) {
      console.error('Error generating monthly challenges:', error);
      toast.error('Failed to generate monthly challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateUpcoming = async () => {
    try {
      await challengeService.activateUpcomingChallenges();
      toast.success('Activated upcoming challenges');
      await loadChallenges();
    } catch (error) {
      console.error('Error activating challenges:', error);
      toast.error('Failed to activate challenges');
    }
  };

  const handleCompleteExpired = async () => {
    try {
      await challengeService.completeExpiredChallenges();
      toast.success('Completed expired challenges');
      await loadChallenges();
    } catch (error) {
      console.error('Error completing challenges:', error);
      toast.error('Failed to complete challenges');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: ChallengeDifficulty) => {
    switch (difficulty) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
    }
  };

  const renderChallengeStats = () => {
    const activeCount = challenges.filter(c => c.status === 'active').length;
    const upcomingCount = challenges.filter(c => c.status === 'upcoming').length;
    const totalParticipants = challenges.reduce((sum, c) => sum + c.participantCount, 0);
    const avgCompletionRate = challenges.length > 0 
      ? challenges.reduce((sum, c) => sum + c.completionRate, 0) / challenges.length 
      : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
                <div className="text-sm text-gray-600">Active Challenges</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{upcomingCount}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalParticipants}</div>
                <div className="text-sm text-gray-600">Total Participants</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(avgCompletionRate)}%
                </div>
                <div className="text-sm text-gray-600">Avg Completion</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCreateChallengeForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Challenge Title</Label>
            <Input
              id="title"
              value={newChallenge.title}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter challenge title"
            />
          </div>
          
          <div>
            <Label htmlFor="type">Challenge Type</Label>
            <Select 
              value={newChallenge.type} 
              onValueChange={(value: ChallengeType) => setNewChallenge(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xp_race">XP Race</SelectItem>
                <SelectItem value="project_completion">Project Completion</SelectItem>
                <SelectItem value="referral_champion">Referral Champion</SelectItem>
                <SelectItem value="five_star_streak">Five Star Streak</SelectItem>
                <SelectItem value="response_speed">Response Speed</SelectItem>
                <SelectItem value="community_builder">Community Builder</SelectItem>
                <SelectItem value="consistency_master">Consistency Master</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={newChallenge.description}
            onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the challenge and how to participate"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select 
              value={newChallenge.difficulty} 
              onValueChange={(value: ChallengeDifficulty) => setNewChallenge(prev => ({ ...prev, difficulty: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="targetValue">Target Value</Label>
            <Input
              id="targetValue"
              type="number"
              value={newChallenge.targetValue}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="minParticipants">Min Participants</Label>
            <Input
              id="minParticipants"
              type="number"
              value={newChallenge.minimumParticipants}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, minimumParticipants: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={newChallenge.startDate}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={newChallenge.endDate}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleCreateChallenge}
            disabled={isCreating}
            className="flex-1"
          >
            {isCreating ? 'Creating...' : 'Create Challenge'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleGenerateMonthlyChallenge}
            disabled={isLoading}
          >
            Generate Monthly
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderChallengeList = () => (
    <div className="space-y-4">
      {challenges.map(challenge => (
        <Card key={challenge.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{challenge.title}</h3>
                  <Badge className={getStatusColor(challenge.status)}>
                    {challenge.status}
                  </Badge>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-3">{challenge.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Participants:</span>
                    <span className="ml-2 font-medium">{challenge.participantCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Target:</span>
                    <span className="ml-2 font-medium">{challenge.targetValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Completion:</span>
                    <span className="ml-2 font-medium">{Math.round(challenge.completionRate)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 font-medium">
                      {challenge.createdAt.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadAnalytics(challenge.id)}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedChallenge(challenge)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSystemControls = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          System Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={handleActivateUpcoming}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Play className="w-4 h-4" />
            Activate Upcoming
          </Button>
          
          <Button 
            onClick={handleCompleteExpired}
            className="flex items-center gap-2"
            variant="outline"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Expired
          </Button>
          
          <Button 
            onClick={loadChallenges}
            className="flex items-center gap-2"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Challenge Administration</h1>
          <p className="text-gray-600 mt-2">Manage challenges and monitor system performance</p>
        </div>
        <Button onClick={loadChallenges} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {renderChallengeStats()}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create Challenge</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderChallengeList()}
        </TabsContent>

        <TabsContent value="create">
          {renderCreateChallengeForm()}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Challenge Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Detailed analytics coming soon. Click the chart icon on individual challenges to view their analytics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          {renderSystemControls()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChallengeAdministration;
