# X-Open-Network Local Development Setup Guide

## Prerequisites

Before setting up the X-Open-Network platform locally, ensure you have the following installed:

### Required Software

1. **Node.js 22.x** (Check with `node --version`)
   - Download from: https://nodejs.org/
   - Or use nvm: `nvm install 22 && nvm use 22`

2. **npm** (comes with Node.js)
   - Alternative: **pnpm** can be used as a drop-in replacement

3. **Git**
   - Download from: https://git-scm.com/

4. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

### Optional but Recommended

5. **Mermaid CLI** (for documentation diagrams)
   ```bash
   npm install -g @mermaid-js/mermaid-cli
   ```

6. **Code Editor**
   - VS Code with recommended extensions:
     - TypeScript and JavaScript Language Features
     - ESLint
     - Prettier
     - Firebase Explorer
     - Tailwind CSS IntelliSense

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/auditoryx/X-Open-Netowrk.git
cd X-Open-Netowrk
```

### 2. Install Dependencies

```bash
# Install main dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install Firebase functions dependencies
cd functions && npm install && cd ..
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Copy backend environment template  
cp .env.example backend/.env
```

Edit both `.env` files and set the required variables (see [Environment Variables](#environment-variables) section below).

### 4. Firebase Setup

```bash
# Login to Firebase
firebase login

# Select your Firebase project
firebase use your-project-id

# Initialize Firebase emulators (if not already done)
firebase init emulators
```

### 5. Start Development Environment

```bash
# Start Firebase emulators in one terminal
firebase emulators:start

# Start Next.js development server in another terminal
npm run dev

# Start backend API server in a third terminal
node backend/server.js
```

Your application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Firebase UI: http://localhost:4000

## Detailed Setup

### Environment Variables

#### Frontend Environment (`.env`)

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# SendGrid Configuration (for emails)
SENDGRID_API_KEY=SG.your_sendgrid_api_key

# Upstash Redis (for caching)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Development flags
NODE_ENV=development
EMULATOR_ENV=true
```

#### Backend Environment (`backend/.env`)

```bash
# Firebase Admin SDK
FIREBASE_ADMIN_SDK_KEY_PATH=path/to/serviceAccountKey.json

# Database
DATABASE_URL=your_database_url_if_using_postgres

# JWT Configuration (should match frontend)
JWT_SECRET=your_jwt_secret_here

# API Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
SENDGRID_API_KEY=SG.your_sendgrid_api_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Firebase Configuration

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Create a new project
   - Enable Authentication, Firestore, Functions, and Storage

2. **Download Service Account Key**
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Save as `serviceAccountKey.json` in a secure location
   - Update the path in `backend/.env`

3. **Configure Firebase Services**
   ```bash
   # Set up Firestore security rules
   firebase deploy --only firestore:rules
   
   # Set up Storage security rules
   firebase deploy --only storage
   ```

### Database Setup

#### Firestore Collections

The application uses the following Firestore collections:

```
/users/{userId}
/services/{serviceId}
/bookings/{bookingId}
/messages/{messageId}
/availability/{availabilityId}
/userAvailability/{userId}
/artistServices/{serviceId}
/reviews/{reviewId}
/notifications/{notificationId}
```

#### Initial Data Seeding

```bash
# Seed initial data (optional)
npm run seed:services

# Or use the Firebase console to add test data
```

### Development Workflow

#### Daily Development

1. **Start Development Environment**
   ```bash
   # Terminal 1: Firebase emulators
   firebase emulators:start
   
   # Terminal 2: Next.js frontend
   npm run dev
   
   # Terminal 3: Backend API (if needed)
   node backend/server.js
   ```

2. **Make Changes**
   - Edit code in your preferred editor
   - Changes will hot-reload automatically
   - Check browser developer console for errors

3. **Test Changes**
   ```bash
   # Run unit tests
   npm test
   
   # Run type checking
   npm run type-check
   
   # Run linting
   npm run lint
   ```

#### Before Committing

```bash
# Run all checks
npm run lint
npm run type-check
npm run test -- --runInBand --ci
npm run build

# If all pass, commit your changes
git add .
git commit -m "feat: your commit message"
```

### Testing

#### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- filename.test.ts
```

#### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode
npm run test:e2e:headed
```

#### Firebase Emulator Tests

```bash
# Run tests inside Firebase emulator
firebase emulators:exec "npm test -- --runInBand --ci"
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server locally
npm start

# Test production build
npm run build && npm start
```

### Troubleshooting

#### Common Issues

1. **Node.js Version Mismatch**
   ```bash
   # Check current version
   node --version
   
   # Use correct version
   nvm use 22
   ```

2. **Firebase Emulator Issues**
   ```bash
   # Kill existing emulators
   firebase emulators:stop
   
   # Clear emulator data
   firebase emulators:start --clear
   ```

3. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Or use different port
   PORT=3001 npm run dev
   ```

4. **Environment Variables Not Loading**
   - Check file names (`.env` not `.env.txt`)
   - Restart development server
   - Check for syntax errors in `.env` files

#### Debug Commands

```bash
# Check Firebase project status
firebase projects:list

# Check current project
firebase use

# View Firebase function logs
firebase functions:log

# Check environment variables
npm run env:check

# Test API endpoints
curl http://localhost:3000/api/health
```

### Development Tools

#### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "toba.vsfire",
    "ms-playwright.playwright"
  ]
}
```

#### Useful Scripts

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run clean         # Clean build artifacts

# Testing
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:e2e      # Run E2E tests
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run type-check    # Run TypeScript checks

# Firebase
npm run deploy:dev    # Deploy to development
npm run deploy:prod   # Deploy to production

# Utilities
npm run gen:types     # Generate TypeScript types
npm run audit:security # Security audit
```

### Development Best Practices

#### Code Style

1. **Use TypeScript** - All new code should be TypeScript
2. **Follow ESLint rules** - Run `npm run lint` before committing
3. **Use Prettier** - Code formatting is automatic
4. **Write tests** - Add tests for new features

#### Git Workflow

1. **Branch naming**: `feature/your-feature-name`
2. **Commit messages**: Use conventional commits (e.g., `feat:`, `fix:`, `docs:`)
3. **Pull requests**: Create PRs for all changes
4. **Code review**: Wait for review before merging

#### Firebase Development

1. **Use emulators** - Don't develop against production Firebase
2. **Security rules** - Test security rules with emulators
3. **Backup data** - Export emulator data regularly

### Performance Tips

#### Development Performance

1. **Use Fast Refresh** - Next.js hot reloading
2. **Incremental builds** - TypeScript incremental compilation
3. **Selective testing** - Run only relevant tests during development

#### Build Performance

1. **Parallel builds** - Use multiple CPU cores
2. **Caching** - Enable build caching
3. **Tree shaking** - Remove unused code

### Getting Help

#### Documentation

- API docs: `docs/api.md`
- Deployment: `docs/deployment.md`
- Architecture: `docs/architecture/`

#### Support Channels

- GitHub Issues: For bugs and feature requests
- Discord: For development discussions
- Email: dev@x-open-network.com

#### Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Next Steps

After completing the setup:

1. **Explore the codebase** - Start with `src/app/page.tsx`
2. **Run the tests** - Familiarize yourself with the test suite
3. **Make a small change** - Try adding a simple feature
4. **Read the documentation** - Understand the architecture
5. **Join the team** - Participate in code reviews and discussions

Happy coding! 🚀