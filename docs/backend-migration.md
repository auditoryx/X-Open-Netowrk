# Backend Migration Plan

## Overview
This document outlines the migration plan for consolidating the Express backend into Firebase Cloud Functions and Next.js API routes.

## Current State
- Express backend running on port 5000
- MongoDB connection for service data
- Basic authentication middleware
- Service and auth routes

## Migration Strategy

### Phase 1: API Routes Migration (COMPLETED)
- [x] Migrate `/api/auth/session` to Next.js API route
- [x] Migrate `/api/auth/verify` to Next.js API route  
- [x] Migrate `/api/services` to Next.js API route
- [x] Migrate `/api/availability` to Next.js API route
- [x] Migrate `/api/artist-services` to Next.js API route
- [x] Migrate `/api/profile/availability` to Next.js API route

### Phase 2: Database Migration (IN PROGRESS)
- [ ] Migrate from MongoDB to Firebase Firestore
- [ ] Update service models to use Firestore
- [ ] Migrate existing data
- [ ] Update authentication to use Firebase Auth

### Phase 3: Function Migration (PENDING)
- [ ] Create Firebase Functions for remaining backend logic
- [ ] Move complex business logic to Firebase Functions
- [ ] Update client-side code to use new endpoints

### Phase 4: Express Backend Removal (PENDING)
- [ ] Remove Express server dependencies
- [ ] Update documentation
- [ ] Remove backend directory
- [ ] Update CI/CD pipeline

## Migration Details

### Services Already Migrated
The following services have been migrated to Next.js API routes:

1. **Authentication Services**
   - POST `/api/auth/session` - Create session token
   - GET `/api/auth/verify` - Verify JWT token

2. **Service Management**
   - GET `/api/services` - Get all services
   - POST `/api/services` - Create new service
   - PUT `/api/services` - Update service
   - DELETE `/api/services` - Delete service

3. **Availability Management**
   - GET `/api/availability` - Get availability
   - POST `/api/availability` - Create availability
   - GET `/api/profile/availability` - Get user availability
   - POST `/api/profile/availability` - Update user availability

4. **Artist Services**
   - GET `/api/artist-services` - Get artist services
   - POST `/api/artist-services` - Create artist service

### Services to Migrate
The following services still need to be migrated:

1. **MongoDB Models**
   - Service model
   - User model
   - Booking model

2. **Authentication Middleware**
   - JWT token validation
   - Role-based access control

3. **Business Logic**
   - Service validation
   - Data transformation
   - Error handling

## Technical Considerations

### Database Migration
- Current: MongoDB with Mongoose
- Target: Firebase Firestore
- Impact: Schema changes, query updates, data migration

### Authentication
- Current: JWT tokens with custom middleware
- Target: Firebase Auth with Next-Auth
- Impact: Token format changes, middleware updates

### Error Handling
- Current: Express error handlers
- Target: Next.js API error handling
- Impact: Error response format consistency

### CORS and Security
- Current: Express CORS middleware
- Target: Next.js built-in CORS handling
- Impact: Security configuration updates

## Migration Timeline

### Week 1
- [x] Complete API route migration
- [x] Update TypeScript types
- [x] Test migrated endpoints

### Week 2
- [ ] Database migration planning
- [ ] Firestore schema design
- [ ] Data migration scripts

### Week 3
- [ ] Firebase Functions implementation
- [ ] Complex business logic migration
- [ ] Integration testing

### Week 4
- [ ] Express backend removal
- [ ] Documentation updates
- [ ] Final testing and deployment

## Testing Strategy

### API Testing
- Unit tests for new Next.js API routes
- Integration tests with Firebase
- End-to-end testing with frontend

### Migration Testing
- Data integrity validation
- Performance comparison
- Security testing

### Rollback Plan
- Keep Express backend available during migration
- Feature flags for gradual rollout
- Quick rollback procedures

## Success Criteria

1. **Functional Parity**
   - All existing API endpoints work
   - Same response formats
   - Same error handling

2. **Performance**
   - Response times maintained or improved
   - Scalability improvements
   - Reduced infrastructure costs

3. **Security**
   - No security regressions
   - Improved authentication
   - Better error handling

4. **Maintainability**
   - Consolidated codebase
   - Improved TypeScript support
   - Better documentation

## Risks and Mitigation

### Risk: Data Loss
- Mitigation: Comprehensive backup before migration
- Mitigation: Gradual migration with validation

### Risk: Downtime
- Mitigation: Blue-green deployment strategy
- Mitigation: Feature flags for rollback

### Risk: Performance Issues
- Mitigation: Performance testing before migration
- Mitigation: Monitoring and alerting

### Risk: Security Vulnerabilities
- Mitigation: Security review of new code
- Mitigation: Penetration testing

## Conclusion

The migration to Firebase Cloud Functions and Next.js API routes will:
- Simplify the architecture
- Improve maintainability
- Reduce operational complexity
- Enhance security
- Enable better scalability

The phased approach ensures minimal disruption while achieving the consolidation goals.