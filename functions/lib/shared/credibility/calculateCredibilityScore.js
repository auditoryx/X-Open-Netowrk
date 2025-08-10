"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCredibilityScore = calculateCredibilityScore;
exports.extractCredibilityFactors = extractCredibilityFactors;
const DEFAULT_CONFIG = {
    tierWeights: {
        signature: 1000,
        verified: 500,
        standard: 100
    },
    creditMultipliers: {
        axVerified: 3.0,
        clientConfirmed: 2.0,
        selfReported: 1.0
    },
    distinctClientCaps: {
        maxImpact: 100,
        perClientScore: 5,
        windowDays: 90
    },
    recencyWindows: {
        veryRecent: 7,
        recent: 30,
        somewhatRecent: 90,
        inactivityThreshold: 90,
        heavyPenaltyThreshold: 180
    },
    recencyBoosts: {
        veryRecent: 50,
        recent: 25,
        somewhatRecent: 10
    },
    inactivityPenalties: {
        moderate: -50,
        heavy: -100
    },
    diminishingReturns: {
        threshold: 50,
        logScaling: 10
    },
    responseMetrics: {
        excellentResponseRate: 95,
        goodResponseRate: 90,
        decentResponseRate: 80,
        fastResponseTime: 1,
        goodResponseTime: 4,
        okResponseTime: 12,
        bonuses: {
            excellentResponse: 30,
            goodResponse: 20,
            decentResponse: 10,
            fastTime: 25,
            goodTime: 15,
            okTime: 5
        }
    }
};
function applyDiminishingReturns(value, threshold, logScaling) {
    if (value <= threshold) {
        return value;
    }
    return threshold + Math.log(value - threshold + 1) * logScaling;
}
function calculateRecencyBoost(daysSinceLastBooking, config) {
    if (!daysSinceLastBooking || !config)
        return 0;
    if (daysSinceLastBooking <= config.veryRecent)
        return config.veryRecent;
    if (daysSinceLastBooking <= config.recent)
        return config.recent;
    if (daysSinceLastBooking <= config.somewhatRecent)
        return config.somewhatRecent;
    return 0;
}
function calculateInactivityDecay(daysSinceLastBooking, config) {
    if (!daysSinceLastBooking || !config)
        return 0;
    if (daysSinceLastBooking > config.heavyPenaltyThreshold)
        return config.heavy;
    if (daysSinceLastBooking > config.inactivityThreshold)
        return config.moderate;
    return 0;
}
function calculateBadgeImpact(badges) {
    if (!badges || badges.length === 0)
        return 0;
    return badges.reduce((total, badge) => {
        if (badge.expiresAt && badge.expiresAt < new Date()) {
            return total;
        }
        return total + (badge.scoreImpact || 0);
    }, 0);
}
function calculateResponseBonus(responseRate, avgResponseTimeHours, config) {
    if (!config)
        return 0;
    let bonus = 0;
    if (responseRate) {
        if (responseRate >= config.excellentResponseRate)
            bonus += config.bonuses.excellentResponse;
        else if (responseRate >= config.goodResponseRate)
            bonus += config.bonuses.goodResponse;
        else if (responseRate >= config.decentResponseRate)
            bonus += config.bonuses.decentResponse;
    }
    if (avgResponseTimeHours) {
        if (avgResponseTimeHours <= config.fastResponseTime)
            bonus += config.bonuses.fastTime;
        else if (avgResponseTimeHours <= config.goodResponseTime)
            bonus += config.bonuses.goodTime;
        else if (avgResponseTimeHours <= config.okResponseTime)
            bonus += config.bonuses.okTime;
    }
    return bonus;
}
function calculateCredibilityScore(factors, config = DEFAULT_CONFIG) {
    const tierScore = config.tierWeights[factors.tier];
    const axCreditsScore = applyDiminishingReturns(factors.axVerifiedCredits * config.creditMultipliers.axVerified, config.diminishingReturns.threshold, config.diminishingReturns.logScaling);
    const clientCreditsScore = applyDiminishingReturns(factors.clientConfirmedCredits * config.creditMultipliers.clientConfirmed, config.diminishingReturns.threshold, config.diminishingReturns.logScaling);
    const clientDiversityScore = Math.min(factors.distinctClients90d * config.distinctClientCaps.perClientScore, config.distinctClientCaps.maxImpact);
    const reviewScore = Math.min(factors.positiveReviewCount * 3, 150);
    const badgeScore = calculateBadgeImpact(factors.activeBadges);
    const responseScore = calculateResponseBonus(factors.responseRate, factors.avgResponseTimeHours, config.responseMetrics);
    const recencyBoost = calculateRecencyBoost(factors.daysSinceLastBooking, { ...config.recencyWindows, ...config.recencyBoosts });
    const inactivityPenalty = calculateInactivityDecay(factors.daysSinceLastBooking, { ...config.recencyWindows, ...config.inactivityPenalties });
    const totalScore = tierScore +
        axCreditsScore +
        clientCreditsScore +
        clientDiversityScore +
        reviewScore +
        badgeScore +
        responseScore +
        recencyBoost +
        inactivityPenalty;
    return Math.max(totalScore, 0);
}
function extractCredibilityFactors(profile, badges, accountCreatedAt) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const now = new Date();
    const lastCompleted = ((_c = (_b = (_a = profile.stats) === null || _a === void 0 ? void 0 : _a.lastCompletedAt) === null || _b === void 0 ? void 0 : _b.toDate) === null || _c === void 0 ? void 0 : _c.call(_b)) ||
        (((_d = profile.stats) === null || _d === void 0 ? void 0 : _d.lastCompletedAt) ? new Date(profile.stats.lastCompletedAt) : undefined);
    return {
        tier: profile.tier,
        axVerifiedCredits: ((_e = profile.counts) === null || _e === void 0 ? void 0 : _e.axVerifiedCredits) || 0,
        clientConfirmedCredits: ((_f = profile.counts) === null || _f === void 0 ? void 0 : _f.clientConfirmedCredits) || 0,
        distinctClients90d: ((_g = profile.stats) === null || _g === void 0 ? void 0 : _g.distinctClients90d) || 0,
        positiveReviewCount: ((_h = profile.stats) === null || _h === void 0 ? void 0 : _h.positiveReviewCount) || 0,
        completedBookings: ((_j = profile.stats) === null || _j === void 0 ? void 0 : _j.completedBookings) || 0,
        responseRate: (_k = profile.stats) === null || _k === void 0 ? void 0 : _k.responseRate,
        avgResponseTimeHours: (_l = profile.stats) === null || _l === void 0 ? void 0 : _l.avgResponseTimeHours,
        lastCompletedAt: lastCompleted,
        activeBadges: badges,
        accountAge: accountCreatedAt ? Math.floor((now.getTime() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)) : undefined,
        daysSinceLastBooking: lastCompleted ? Math.floor((now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)) : undefined
    };
}
