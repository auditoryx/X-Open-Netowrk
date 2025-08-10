import type { UserTier } from '@/lib/gamification';
export interface RankInputs {
    tier: UserTier;
    rating: number;
    reviews: number;
    xp: number;
    responseHrs: number;
    proximityKm: number;
}
export declare function calcRankScore(i: RankInputs): number;
