# Gamification System

## Overview
- Users earn XP and rankScore for platform activity
- Tiers: standard, blue, gold (with frozen state)
- TierBadge and ProgressRing components visualize status

## Data Model
- `users` collection: fields for xp, rankScore, tier, tierFrozen
- Firestore rules: client cannot write xp, rankScore, tier, tierFrozen
- Composite index: {tier, rankScore, __name__}

## Features
- XP/rankScore updated by backend
- TierBadge: shows tier and frozen state
- ProgressRing: shows XP visually
- Leaderboards, explore UI, and creator cards use these fields

## Migration
- One-off script seeds missing xp, rankScore, tier

## Testing
- RTL for badges/rings, emulator for backend logic
