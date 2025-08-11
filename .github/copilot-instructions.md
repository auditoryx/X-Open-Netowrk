# AuditoryX Creator Collaboration Platform

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap, Build, and Test the Repository
```bash
# 1. Copy environment configuration
cp .env.example .env.local

# 2. Install main dependencies (NEVER CANCEL: takes 8+ minutes)
npm install
# Set timeout to 600+ seconds. This is normal and expected.

# 3. Install backend dependencies
cd backend && npm install && cd ..
# Takes ~5 seconds

# 4. Install Firebase Functions dependencies
cd functions && npm install && cd ..
# Takes ~12 seconds

# 5. Build the application (NEVER CANCEL: takes 2+ minutes) 
npm run build
# Set timeout to 300+ seconds. Build succeeds despite linting warnings.

# 6. Run development server
npm run dev
# Ready in ~2.5 seconds at http://localhost:3000
```

### Testing Commands
```bash
# Run Jest tests (NEVER CANCEL: set timeout to 180+ seconds)
npm test -- --runInBand --ci
# WARNING: Tests currently fail due to configuration issues. This is a known limitation.

# Run Vitest tests (Alternative test runner)
npm run test:vitest
# WARNING: Also fails due to environment configuration issues.

# Type checking (NEVER CANCEL: takes 60+ seconds)
npm run type-check
# Set timeout to 120+ seconds. Currently fails with ~3000+ TypeScript errors.

# Linting (takes ~10 seconds)
npm run lint
# WARNING: Currently fails with ESLint configuration errors and many warnings.
```

### Important Warnings
- **NEVER CANCEL npm install** - Takes 8+ minutes, this is normal
- **NEVER CANCEL npm run build** - Takes 2+ minutes, this is normal  
- **NEVER CANCEL npm run type-check** - Takes 60+ seconds, this is normal
- **DO NOT rely on automated tests** - Current test infrastructure has configuration issues

## Validation

### Manual Validation Requirements
Since automated testing is currently broken, ALWAYS manually validate changes by:

1. **Build Validation**: Ensure `npm run build` completes successfully
2. **Development Server**: Start with `npm run dev` and verify it loads at http://localhost:3000
3. **Manual UI Testing**: Navigate through key user flows manually
4. **Environment Setup**: Verify environment variables are properly configured

### Critical User Scenarios to Test Manually
After making changes, ALWAYS test these scenarios:
- **Homepage Loading**: Verify http://localhost:3000 loads without console errors
- **User Authentication**: Test login/signup flows if auth-related changes made
- **Booking Flow**: Test booking creation and management if booking-related changes made
- **Profile Management**: Test user profile editing if profile-related changes made
- **Search Functionality**: Test creator search if search-related changes made

### Backend Server Validation
```bash
# Start backend server (WARNING: Currently fails with RedisStore issues)
cd backend && node server.js
# Known Issue: RedisStore constructor error - backend server currently non-functional
```

## Configuration Issues and Workarounds

### Node.js Version Discrepancy
- **.nvmrc specifies**: 18.18.0
- **CI workflow uses**: 22.x  
- **Recommendation**: Use Node.js 18.x for local development to match .nvmrc

### Package Manager Inconsistency
- **CI uses**: pnpm
- **Local development**: npm
- **Recommendation**: Use npm for local development as specified in AGENTS.md

### Known Broken Components
1. **Jest Tests**: Configuration errors with missing modules and SCHEMA_FIELDS initialization
2. **ESLint**: Configuration issues with Next.js plugin detection
3. **TypeScript**: 3000+ compilation errors across the codebase
4. **Backend Server**: RedisStore constructor issues
5. **Playwright E2E**: Browser download failures
6. **Firebase Emulator**: Installation takes extremely long

### Working Components
1. **Next.js Build**: Succeeds despite warnings
2. **Development Server**: Starts and runs properly
3. **Dependencies Installation**: Works but takes significant time
4. **Manual UI Testing**: Application loads and basic functionality works

## Repository Structure

### Key Directories
- **Frontend**: `src/app/` (Next.js App Router), `pages/` (Pages Router)
- **Components**: `src/components/`, `components/`
- **Backend**: `backend/` (Express server with Redis rate limiting)
- **Firebase Functions**: `functions/`
- **Tests**: `__tests__/`, `src/**/__tests__/`, `tests/`
- **Scripts**: `scripts/` (automation and setup scripts)

### Important Files
- **Environment**: `.env.example` (template), `.env.local` (your config)
- **Configuration**: `package.json`, `next.config.js`, `firebase.json`
- **Testing**: `jest.config.cjs`, `vitest.config.ts`, `playwright.config.ts`
- **Linting**: `.eslintrc.js`, `eslint.config.mjs`

## Common Commands and Expected Times

### Installation (NEVER CANCEL)
```bash
npm install                    # 8+ minutes (set timeout: 600+ seconds)
cd backend && npm install      # 5 seconds  
cd functions && npm install    # 12 seconds
```

### Development
```bash
npm run dev                    # 2.5 seconds startup
npm run build                  # 2+ minutes (set timeout: 300+ seconds)
npm start                      # Start production server
```

### Quality Assurance
```bash
npm run lint                   # 10 seconds (currently fails)
npm run type-check             # 60+ seconds (set timeout: 120+ seconds, currently fails)
npm test -- --runInBand --ci  # 15+ seconds (currently fails)
```

### Cleanup
```bash
npm run clean                  # Remove .next directory
rm -rf node_modules            # Clean dependencies (if needed)
```

## Development Guidelines

### Before Making Changes
1. **Run `npm run build`** to ensure current state is buildable
2. **Start dev server** with `npm run dev` to verify baseline functionality
3. **Test manual scenarios** relevant to your changes

### After Making Changes  
1. **ALWAYS run `npm run build`** to verify changes don't break the build
2. **Test in browser** by running `npm run dev` and manually exercising your changes
3. **Run `npm run lint`** (ignore failures, but check for new issues)
4. **Manual validation** of affected user flows

### Code Style
- Use Tailwind CSS classes for styling
- Favor Zod for validation schemas
- Use TypeScript interfaces for type definitions
- Follow existing code patterns and file organization

## Environment Variables

### Required Setup
```bash
# Copy template and edit with your credentials
cp .env.example .env.local
```

### Critical Variables (stub with placeholders if missing)
- Firebase: `NEXT_PUBLIC_FIREBASE_*` variables
- Stripe: `STRIPE_*` and `NEXT_PUBLIC_STRIPE_*` variables  
- Authentication: `NEXTAUTH_*` variables
- Email: `SENDGRID_*` or `SMTP_*` variables

## Deployment

### Production Build
```bash
npm run build                  # NEVER CANCEL: 2+ minutes
npm start                     # Start production server
```

### Firebase Deployment (if configured)
```bash
# Install Firebase CLI (WARNING: takes very long)
npm install -g firebase-tools

# Deploy (after successful build)
firebase deploy
```

## Troubleshooting

### Build Failures
- **Check Node.js version**: Should be 18.x per .nvmrc
- **Clear cache**: `npm run clean` then rebuild
- **Environment variables**: Verify all required variables are set

### Development Server Issues
- **Port conflicts**: Ensure port 3000 is available
- **Environment**: Check `.env.local` is properly configured
- **Clear cache**: Remove `.next` directory and restart

### Known Limitations
- **Tests are broken**: Ignore test failures, use manual validation
- **Linting fails**: Build still succeeds despite linting errors
- **TypeScript errors**: Application runs despite type errors
- **Backend server**: Currently non-functional due to dependency issues

## Performance Expectations

- **Initial npm install**: 8+ minutes (normal)
- **Subsequent builds**: 2+ minutes (normal)
- **Development server**: 2-3 seconds startup (normal)
- **Type checking**: 60+ seconds (normal)
- **Hot reload**: Near-instant in development

Remember: This is a complex Next.js application with Firebase backend, Stripe payments, and extensive gamification features. Build times and setup complexity are expected.