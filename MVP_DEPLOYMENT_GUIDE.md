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

## Admin Panel Access Configuration

### Setting Up Admin Users
```bash
# Use Firebase Admin to set custom claims
node setUserClaims.ts --email admin@yourdomain.com --role admin --tier signature
```

### Admin Features Verification
- [ ] User verification approval system
- [ ] Tier upgrade management
- [ ] Platform analytics dashboard
- [ ] Dispute resolution interface
- [ ] Content moderation tools

## Common Errors & Troubleshooting

### Firebase Private Key Error
```bash
Error: Failed to parse private key: Error: Invalid PEM formatted message.
```
**Solution**: Ensure `FIREBASE_PRIVATE_KEY` includes proper line breaks:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Content_Here\n-----END PRIVATE KEY-----\n"
```

### Stripe Webhook Verification Failed
```bash
Error: No signatures found matching the expected signature for payload
```
**Solution**: Update webhook endpoint URL in Stripe dashboard to match deployed domain.

### NextAuth Configuration Error
```bash
[next-auth][error][CLIENT_FETCH_ERROR]
```
**Solution**: Verify `NEXTAUTH_URL` matches your deployed domain exactly.

### Calendar API Quota Exceeded
```bash
Error: Quota exceeded for quota metric 'calendar api requests'
```
**Solution**: Enable billing in Google Cloud Console and increase quota limits.

## Success Metrics

Your MVP is working correctly when:
- [ ] Users can sign up and create profiles
- [ ] Booking flow completes end-to-end
- [ ] Payments process and hold in escrow
- [ ] Real-time chat functions properly
- [ ] Calendar sync imports/exports availability
- [ ] Media upload and portfolio display works
- [ ] Admin panel accessible with proper permissions
- [ ] Email notifications sending correctly
- [ ] Mobile experience responsive and functional

## Post-Launch Monitoring

### Essential Monitoring Setup
1. **Error Tracking**: Configure Sentry for real-time error monitoring
2. **Performance**: Set up Firebase Performance Monitoring
3. **Analytics**: Enable Firebase Analytics for user behavior
4. **Uptime**: Configure uptime monitoring (UptimeRobot recommended)

### Key Metrics to Track
- User registration conversion rate
- Booking completion rate
- Payment success rate
- Customer support ticket volume
- Platform performance (page load times)

## Next Steps After MVP Launch

1. **User Feedback Collection**
   - Set up analytics tracking
   - Create feedback forms in app
   - Monitor user behavior patterns
   - Track feature usage statistics

2. **Performance Monitoring**
   - Set up comprehensive error tracking
   - Monitor Firebase usage and costs
   - Track payment processing success rates
   - Monitor API response times

3. **Security Hardening**
   - Regular security audits
   - Update dependencies
   - Monitor for suspicious activity
   - Implement additional rate limiting

4. **Feature Iteration**
   - Address user feedback
   - Optimize based on usage patterns
   - Plan Phase 2 feature roadmap
   - Scale infrastructure as needed

---

**🎉 Congratulations! Your AuditoryX MVP is ready for launch.**

For detailed technical implementation, see:
- [Security Model](./SECURITY_MODEL.md) - Security implementation details
- [Tier System](./TIER_SYSTEM.md) - User tier and verification system
- [Booking Flow](./BOOKING_FLOW.md) - Complete booking system documentation
- [Contributing Guide](./CONTRIBUTING.md) - Development guidelines