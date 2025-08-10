"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcRankScore = calcRankScore;
const gamification_1 = require("@/constants/gamification");
function calcRankScore(i) {
    const tierPart = gamification_1.TIER_WEIGHT[i.tier] * 50;
    const ratingPart = i.rating * 40;
    const reviewsPart = Math.log10(i.reviews + 1) * 30;
    const xpPart = Math.sqrt(i.xp) * 5;
    const responsePart = (1 / Math.max(i.responseHrs, 1)) * 40;
    const distancePenalty = i.proximityKm * 0.2;
    return (tierPart +
        ratingPart +
        reviewsPart +
        xpPart +
        responsePart -
        distancePenalty);
}
