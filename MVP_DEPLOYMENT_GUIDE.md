# 🚀 AuditoryX MVP Deployment Guide

## Quick Start (5-minute setup)

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

### 2. Required Services Setup

#### Firebase Project
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication with Google provider
3. Enable Firestore Database
4. Enable Realtime Database  
5. Enable Storage
6. Download service account key (for admin operations)

#### Stripe Connect Setup
1. Create Stripe account at https://stripe.com
2. Enable Stripe Connect in dashboard
3. Get API keys from developers section
4. Configure webhook endpoints

#### Google Calendar API
1. Go to Google Cloud Console
2. Enable Calendar API
3. Create OAuth 2.0 credentials
4. Add authorized domains

### 3. Critical Environment Variables

```bash
# Firebase (Required)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe (Required)
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Google OAuth (Required)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
```

### 4. Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run backend API (separate terminal)
cd backend && npm start
```

### 5. Production Deployment

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

#### Option B: Firebase Hosting
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Build and deploy
npm run build
firebase deploy
```

## MVP Feature Verification Checklist

After deployment, verify these critical features work:

### ✅ Authentication Flow
- [ ] Google OAuth signup/login
- [ ] User profile creation
- [ ] Role selection (Producer, Engineer, etc.)

### ✅ Booking System
- [ ] Browse creators on map
- [ ] Create booking request
- [ ] Payment processing with Stripe
- [ ] Escrow holds funds correctly

### ✅ Real-time Features
- [ ] Chat messaging works
- [ ] Typing indicators appear
- [ ] Online/offline status updates
- [ ] Message read receipts

### ✅ Calendar Integration
- [ ] Connect Google Calendar
- [ ] Sync availability from Google
- [ ] Push bookings to Google Calendar
- [ ] Conflict detection works

### ✅ Media & Portfolio
- [ ] Upload images/videos/audio
- [ ] Portfolio gallery displays
- [ ] Media optimization works
- [ ] File size/type validation

## Common Issues & Solutions

### Issue: Firebase Connection Failed
**Solution:** Check FIREBASE_PROJECT_ID and DATABASE_URL are correct

### Issue: Stripe Payments Failing
**Solution:** Verify webhook endpoints are configured in Stripe dashboard

### Issue: Calendar Sync Not Working
**Solution:** Ensure Google Calendar API is enabled and OAuth consent screen is configured

### Issue: Build Errors
**Solution:** Run `npm run type-check` to identify TypeScript issues

## Production Configuration

### Environment Variables for Production
```bash
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com

# Use production Stripe keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Use production Firebase project
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
```

### Security Checklist
- [ ] Use production API keys
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up monitoring (Sentry recommended)
- [ ] Enable rate limiting
- [ ] Regular security audits

### Performance Optimization
- [ ] Enable CDN for media files
- [ ] Configure database indexes
- [ ] Set up Redis caching (optional)
- [ ] Monitor Firebase usage quotas

## Support & Troubleshooting

### Logs & Monitoring
- Check browser console for client-side errors
- Monitor Firebase console for database issues
- Use Stripe dashboard for payment debugging
- Check Vercel/Firebase functions logs

### Key Files for Debugging
- `src/lib/firebase-admin.ts` - Server-side Firebase config
- `src/lib/authOptions.ts` - Authentication configuration
- `src/app/api/stripe/webhook/route.ts` - Payment webhook handling
- `src/lib/google/calendarSync.ts` - Calendar integration

### Database Setup
Run this command to deploy Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

## Success Metrics

Your MVP is working correctly when:
- [ ] Users can sign up and create profiles
- [ ] Booking flow completes end-to-end
- [ ] Payments process and hold in escrow
- [ ] Real-time chat functions properly
- [ ] Calendar sync imports/exports availability
- [ ] Media upload and portfolio display works

## Next Steps After MVP Launch

1. **User Feedback Collection**
   - Set up analytics tracking
   - Create feedback forms
   - Monitor user behavior

2. **Performance Monitoring**
   - Set up Sentry for error tracking
   - Monitor Firebase usage
   - Track conversion rates

3. **Feature Iteration**
   - Address user feedback
   - Optimize based on usage patterns
   - Plan Phase 2 features

---

**🎉 Congratulations! Your AuditoryX MVP is ready for launch.**

For detailed API documentation, see `/docs/api.md`
For component documentation, see `/docs/components.md`