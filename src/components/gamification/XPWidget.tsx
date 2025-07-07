import React, { useState } from 'react';
import { ChevronDown, ChevronUp, History, Target, TrendingUp } from 'lucide-react';
import XPDisplay from './XPDisplay';
import XPProgressBar from './XPProgressBar';
import { useXPData } from '@/lib/hooks/useXPData';
import { formatDistanceToNow } from 'date-fns';

interface XPWidgetProps {
  className?: string;
  showHistory?: boolean;
  compact?: boolean;
}

const XPWidget: React.FC<XPWidgetProps> = ({ 
  className = '', 
  showHistory = false,
  compact = false 
}) => {
  const { userProgress, xpHistory, loading, error, dailyCapRemaining, nextTierProgress } = useXPData();
  const [expanded, setExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  if (loading) {
    return (
      <div className={`bg-neutral-800 border border-neutral-700 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
          <div className="h-8 bg-neutral-700 rounded w-3/4"></div>
          <div className="h-2 bg-neutral-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !userProgress) {
    return (
      <div className={`bg-neutral-800 border border-neutral-700 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-400">
          <p className="text-sm">Unable to load XP data</p>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
      </div>
    );
  }

  const recentXPHistory = xpHistory.slice(0, 5);

  if (compact) {
    return (
      <div className={`bg-neutral-800 border border-neutral-700 rounded-lg p-3 ${className}`}>
        <XPDisplay
          totalXP={userProgress.totalXP}
          dailyXP={userProgress.dailyXP}
          dailyCapRemaining={dailyCapRemaining}
          tier={userProgress.tier}
          showDetails={false}
          className="bg-transparent border-0 p-0"
        />
      </div>
    );
  }

  return (
    <div className={`bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden ${className}`}>
      {/* Main XP Display */}
      <div className="p-4">
        <XPDisplay
          totalXP={userProgress.totalXP}
          dailyXP={userProgress.dailyXP}
          dailyCapRemaining={dailyCapRemaining}
          tier={userProgress.tier}
          className="bg-transparent border-0 p-0"
        />
      </div>

      {/* Tier Progress Section */}
      {nextTierProgress && (
        <div className="px-4 pb-4">
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">
                Progress to {nextTierProgress.nextTier}
              </span>
            </div>
            <XPProgressBar
              currentXP={userProgress.totalXP}
              targetXP={userProgress.totalXP + nextTierProgress.xpNeeded}
              targetLabel={`${nextTierProgress.nextTier} Tier`}
              variant="tier"
              size="sm"
              showNumbers={false}
              className="mt-2"
            />
            <div className="text-xs text-gray-400 mt-1">
              {nextTierProgress.xpNeeded.toLocaleString()} XP needed
            </div>
          </div>
        </div>
      )}

      {/* Expandable sections */}
      <div className="border-t border-neutral-700">
        {/* Recent Activity Toggle */}
        {showHistory && recentXPHistory.length > 0 && (
          <>
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-neutral-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Recent Activity</span>
              </div>
              {historyExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {historyExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {recentXPHistory.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between text-xs bg-neutral-700/30 rounded p-2"
                  >
                    <div>
                      <span className="text-white font-medium">
                        {transaction.event.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <div className="text-gray-400">
                        {formatDistanceToNow(transaction.timestamp.toDate(), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">
                        +{transaction.xpAwarded} XP
                      </div>
                      {transaction.dailyCapReached && (
                        <div className="text-orange-400 text-xs">Cap reached</div>
                      )}
                    </div>
                  </div>
                ))}
                
                {xpHistory.length > 5 && (
                  <div className="text-center pt-2">
                    <span className="text-xs text-gray-400">
                      Showing {recentXPHistory.length} of {xpHistory.length} recent activities
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Stats Summary Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-neutral-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">Statistics</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {expanded && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-700/30 rounded p-2">
                <div className="text-gray-400">Total Earned</div>
                <div className="text-white font-medium">
                  {userProgress.totalXP.toLocaleString()} XP
                </div>
              </div>
              <div className="bg-neutral-700/30 rounded p-2">
                <div className="text-gray-400">Today</div>
                <div className="text-white font-medium">
                  {userProgress.dailyXP} / 300 XP
                </div>
              </div>
              <div className="bg-neutral-700/30 rounded p-2">
                <div className="text-gray-400">Current Tier</div>
                <div className="text-white font-medium capitalize">
                  {userProgress.tier}
                </div>
              </div>
              <div className="bg-neutral-700/30 rounded p-2">
                <div className="text-gray-400">Activities</div>
                <div className="text-white font-medium">
                  {xpHistory.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XPWidget;
