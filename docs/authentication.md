# Authentication Flow Documentation

## Overview
AuditoryX uses NextAuth.js for authentication with multiple providers and role-based access control.

## Authentication Providers

### Supported Providers
- **Google OAuth** - Primary social login
- **Apple ID** - iOS users
- **Line** - Asian market support
- **Kakao** - Korean market support
- **Email/Password** - Direct registration

### Configuration
Authentication is configured in `/lib/authOptions.js` with:
- Provider setup and callbacks
- JWT token handling
- Session management
- Role-based claims

## User Registration Flow

```
1. User clicks "Sign Up"
2. Provider authentication (OAuth or email)
3. User profile creation in Firestore
4. Role assignment (default: 'creator')
5. Onboarding redirect
```

## Role-Based Access Control (RBAC)

### User Roles
- **admin** - Full platform access
- **moderator** - Content moderation
- **creator** - Standard user
- **enterprise** - Business accounts

### Permission Checks
```typescript
// Check user role
const hasAccess = await checkUserRole(userId, 'admin');

// Middleware protection
export default withAuth(handler, { requiredRole: 'admin' });

// Component protection
const ProtectedComponent = withRoleProtection(Component, ['admin', 'moderator']);
```

### Implementation Details

#### 1. NextAuth Configuration (`/lib/authOptions.js`)
```typescript
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Other providers...
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Add custom claims to JWT
      if (user) {
        token.role = user.role || 'creator';
        token.tier = user.tier || 'standard';
      }
      return token;
    },
    
    async session({ session, token }) {
      // Pass role to client session
      session.user.role = token.role;
      session.user.tier = token.tier;
      return session;
    }
  }
};
```

#### 2. Server-Side Protection (`/lib/auth/withAuth.ts`)
```typescript
export function withAuth(handler, options = {}) {
  return async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (options.requiredRole && !hasRole(session.user, options.requiredRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    req.user = session.user;
    return handler(req, res);
  };
}
```

#### 3. Client-Side Protection (`/lib/utils/withRoleProtection.tsx`)
```typescript
export function withRoleProtection<T extends object>(
  Component: React.ComponentType<T>,
  allowedRoles: string[]
) {
  return function ProtectedComponent(props: T) {
    const { data: session, status } = useSession();
    
    if (status === 'loading') return <LoadingSpinner />;
    if (!session) return <LoginPrompt />;
    if (!allowedRoles.includes(session.user.role)) {
      return <AccessDenied />;
    }
    
    return <Component {...props} />;
  };
}
```

## Security Considerations

### 1. JWT Token Security
- Tokens are httpOnly cookies
- Short expiration times (1 hour)
- Refresh token rotation
- Secure transport (HTTPS only)

### 2. Role Validation
- Server-side role checks on all protected routes
- Client-side checks for UX only
- Role changes require re-authentication
- Admin actions logged and audited

### 3. Session Management
- Automatic session refresh
- Logout on role changes
- Device-based session tracking
- Suspicious activity detection

## Troubleshooting

### Common Issues
1. **Role not updating** - Clear session and re-login
2. **Provider errors** - Check OAuth app configuration
3. **Token expiration** - Implement refresh logic
4. **CORS issues** - Verify domain configuration

### Debug Commands
```bash
# Check user roles in Firestore
npm run debug:user-roles

# Validate JWT tokens
npm run debug:tokens

# Test authentication flow
npm run test:auth
```
