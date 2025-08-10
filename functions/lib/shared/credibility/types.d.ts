export interface CredibilityFactors {
    tier: 'standard' | 'verified' | 'signature';
    axVerifiedCredits: number;
    clientConfirmedCredits: number;
    distinctClients90d: number;
    positiveReviewCount: number;
    completedBookings: number;
    responseRate?: number;
    avgResponseTimeHours?: number;
    lastCompletedAt?: Date;
    activeBadges?: BadgeDefinition[];
    accountAge?: number;
    daysSinceLastBooking?: number;
}
export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    scoreImpact?: number;
    type: 'achievement' | 'performance' | 'dynamic';
    expiresAt?: Date;
}
export interface UserProfile {
    uid: string;
    tier: 'standard' | 'verified' | 'signature';
    createdAt?: any;
    roles?: string[];
    badgeIds?: string[];
    stats?: {
        completedBookings?: number;
        positiveReviewCount?: number;
        responseRate?: number;
        avgResponseTimeHours?: number;
        lastCompletedAt?: any;
        distinctClients90d?: number;
    };
    counts?: {
        axVerifiedCredits?: number;
        clientConfirmedCredits?: number;
    };
    credibilityScore?: number;
}
export interface CredibilityConfig {
    tierWeights: {
        signature: number;
        verified: number;
        standard: number;
    };
    creditMultipliers: {
        axVerified: number;
        clientConfirmed: number;
        selfReported: number;
    };
    distinctClientCaps: {
        maxImpact: number;
        perClientScore: number;
        windowDays: number;
    };
    recencyWindows: {
        veryRecent: number;
        recent: number;
        somewhatRecent: number;
        inactivityThreshold: number;
        heavyPenaltyThreshold: number;
    };
    recencyBoosts: {
        veryRecent: number;
        recent: number;
        somewhatRecent: number;
    };
    inactivityPenalties: {
        moderate: number;
        heavy: number;
    };
    diminishingReturns: {
        threshold: number;
        logScaling: number;
    };
    responseMetrics: {
        excellentResponseRate: number;
        goodResponseRate: number;
        decentResponseRate: number;
        fastResponseTime: number;
        goodResponseTime: number;
        okResponseTime: number;
        bonuses: {
            excellentResponse: number;
            goodResponse: number;
            decentResponse: number;
            fastTime: number;
            goodTime: number;
            okTime: number;
        };
    };
}
