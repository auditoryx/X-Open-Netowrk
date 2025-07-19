# Project Architecture

## Overview
- Modular Next.js app with custom UI, hooks, and providers
- Firebase/Firestore backend, React Query for data
- CI/CD via GitHub Actions

## Key Folders
- `src/components/` – UI components
- `src/hooks/` – Custom React hooks
- `src/app/` – App router, pages, layouts
- `backend/` – Node backend, admin scripts
- `scripts/` – Utilities, migrations
- `public/` – Static assets

## Providers
- AuthProvider, LanguageProvider, CartProvider, QueryProvider

## Data
- Firestore: users, services, bookings, reviews, etc.
- Indexes and rules for security and performance

## Testing
- RTL for UI, emulator tests for backend

## CI/CD
- Lint, test, deploy via GitHub Actions
