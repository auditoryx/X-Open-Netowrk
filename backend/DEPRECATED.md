# ⚠️ DEPRECATED: Express Backend Server

## Status: DEPRECATED as of January 2025

This Express.js backend server has been **deprecated** and is no longer maintained. All functionality has been migrated to Next.js API routes for production deployment.

## Migration Path

All Express routes have been replaced with equivalent Next.js API routes:

- `POST /api/auth/*` → `/src/app/api/auth/*`
- `GET /api/services/*` → `/src/app/api/services/*`
- All other routes → `/src/app/api/*`

## Deployment Status

- ❌ **No longer deployed to production**
- ❌ **Excluded from CI/CD pipeline**
- ❌ **Not included in Docker builds**

## For Developers

- Use Next.js API routes in `/src/app/api/` for all new backend functionality
- Do not add new features to this Express server
- This directory will be removed in a future release

## Historical Context

This server was used during development phase but has been superseded by:
1. Better integration with Next.js middleware
2. Unified authentication with NextAuth
3. Better TypeScript support
4. Simplified deployment architecture

If you need to reference legacy implementation, check git history before this deprecation.