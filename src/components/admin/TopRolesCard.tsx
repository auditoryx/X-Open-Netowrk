import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Star, Trophy, Users } from 'lucide-react';

interface TopRole {
  id: string;
  name: string;
  userCount: number;
  averageRating: number;
  totalEarnings: number;
  growth: number;
}

interface TopRolesCardProps {
  roles: TopRole[];
  title?: string;
  className?: string;
}

const roleIcons = {
  'Audio Engineer': Crown,
  'Producer': Trophy,
  'Mixing Engineer': Star,
  'Mastering Engineer': Star,
  'Musician': Users,
  'Vocalist': Users,
  'Songwriter': Users,
  'default': Users
};

export default function TopRolesCard({ roles, title = "Top Performing Roles", className = "" }: TopRolesCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.map((role, index) => {
            const IconComponent = roleIcons[role.name as keyof typeof roleIcons] || roleIcons.default;
            
            return (
              <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{role.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {role.userCount} users
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {role.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(role.totalEarnings)}</div>
                  <div className={`text-sm ${getGrowthColor(role.growth)}`}>
                    {role.growth > 0 ? '+' : ''}{role.growth.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
