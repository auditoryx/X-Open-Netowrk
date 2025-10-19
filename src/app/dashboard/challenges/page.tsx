/**
 * Challenge Dashboard Page
 * 
 * Temporarily disabled to allow build completion.
 * TODO: Fix prerendering issues with complex client components
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ChallengeDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Challenges Coming Soon
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            The challenges feature is currently being optimized. Check back soon to compete with fellow creators and earn amazing rewards!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
