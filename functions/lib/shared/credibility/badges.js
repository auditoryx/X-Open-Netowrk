"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORE_BADGE_DEFINITIONS = exports.CORE_BADGE_IDS = void 0;
exports.CORE_BADGE_IDS = {
    FIRST_BOOKING: 'first-booking',
    MILESTONE_10_BOOKINGS: 'milestone-10-bookings',
    MILESTONE_50_BOOKINGS: 'milestone-50-bookings',
    MILESTONE_100_BOOKINGS: 'milestone-100-bookings',
    FIVE_STAR_STREAK: 'five-star-streak',
    FAST_RESPONDER: 'fast-responder',
    HIGH_COMPLETION_RATE: 'high-completion-rate',
    CLIENT_FAVORITE: 'client-favorite',
    RISING_TALENT: 'rising-talent',
    TRENDING_NOW: 'trending-now',
    NEW_THIS_WEEK: 'new-this-week',
    VERIFIED_PRO: 'verified-pro',
    SIGNATURE_ARTIST: 'signature-artist',
    PLATFORM_PIONEER: 'platform-pioneer',
    COMMUNITY_LEADER: 'community-leader'
};
exports.CORE_BADGE_DEFINITIONS = [
    {
        id: exports.CORE_BADGE_IDS.FIRST_BOOKING,
        name: 'First Booking',
        description: 'Completed your first booking on AuditoryX',
        type: 'achievement',
        scoreImpact: 10
    },
    {
        id: exports.CORE_BADGE_IDS.MILESTONE_10_BOOKINGS,
        name: '10 Bookings',
        description: 'Completed 10 bookings on AuditoryX',
        type: 'achievement',
        scoreImpact: 25
    },
    {
        id: exports.CORE_BADGE_IDS.MILESTONE_50_BOOKINGS,
        name: '50 Bookings',
        description: 'Completed 50 bookings on AuditoryX',
        type: 'achievement',
        scoreImpact: 50
    },
    {
        id: exports.CORE_BADGE_IDS.MILESTONE_100_BOOKINGS,
        name: '100 Bookings',
        description: 'Completed 100 bookings on AuditoryX',
        type: 'achievement',
        scoreImpact: 100
    },
    {
        id: exports.CORE_BADGE_IDS.FIVE_STAR_STREAK,
        name: '5-Star Streak',
        description: 'Received 5 consecutive 5-star reviews',
        type: 'performance',
        scoreImpact: 30
    },
    {
        id: exports.CORE_BADGE_IDS.FAST_RESPONDER,
        name: 'Fast Responder',
        description: 'Averages under 2 hours response time',
        type: 'performance',
        scoreImpact: 20
    },
    {
        id: exports.CORE_BADGE_IDS.HIGH_COMPLETION_RATE,
        name: 'High Completion Rate',
        description: 'Maintains 95%+ booking completion rate',
        type: 'performance',
        scoreImpact: 25
    },
    {
        id: exports.CORE_BADGE_IDS.CLIENT_FAVORITE,
        name: 'Client Favorite',
        description: 'High repeat client rate - clients love working with you',
        type: 'performance',
        scoreImpact: 35
    },
    {
        id: exports.CORE_BADGE_IDS.RISING_TALENT,
        name: 'Rising Talent',
        description: 'Rapidly growing in bookings and ratings',
        type: 'dynamic',
        scoreImpact: 40
    },
    {
        id: exports.CORE_BADGE_IDS.TRENDING_NOW,
        name: 'Trending Now',
        description: 'High booking activity this week',
        type: 'dynamic',
        scoreImpact: 25
    },
    {
        id: exports.CORE_BADGE_IDS.NEW_THIS_WEEK,
        name: 'New This Week',
        description: 'Recently joined AuditoryX',
        type: 'dynamic',
        scoreImpact: 15
    },
    {
        id: exports.CORE_BADGE_IDS.VERIFIED_PRO,
        name: 'Verified Pro',
        description: 'Verified professional with outstanding track record',
        type: 'achievement',
        scoreImpact: 75
    },
    {
        id: exports.CORE_BADGE_IDS.SIGNATURE_ARTIST,
        name: 'Signature Artist',
        description: 'Top-tier talent recognized by AuditoryX',
        type: 'achievement',
        scoreImpact: 100
    },
    {
        id: exports.CORE_BADGE_IDS.PLATFORM_PIONEER,
        name: 'Platform Pioneer',
        description: 'Early adopter who helped shape AuditoryX',
        type: 'achievement',
        scoreImpact: 50
    },
    {
        id: exports.CORE_BADGE_IDS.COMMUNITY_LEADER,
        name: 'Community Leader',
        description: 'Exceptional contributor to the AuditoryX community',
        type: 'achievement',
        scoreImpact: 60
    }
];
