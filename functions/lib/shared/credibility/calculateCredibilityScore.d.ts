import { CredibilityFactors, CredibilityConfig, BadgeDefinition } from './types';
export declare function calculateCredibilityScore(factors: CredibilityFactors, config?: CredibilityConfig): number;
export declare function extractCredibilityFactors(profile: any, badges?: BadgeDefinition[], accountCreatedAt?: Date): CredibilityFactors;
