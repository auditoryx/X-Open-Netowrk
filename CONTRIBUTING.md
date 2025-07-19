# 🤝 Contributing to AuditoryX

Welcome to the AuditoryX contribution guide! We appreciate your interest in improving our creator collaboration platform.

## 🚀 Quick Start

### Development Environment Setup

1. **Prerequisites**
   - Node.js 22.x or higher
   - npm or pnpm package manager
   - Git for version control
   - Firebase CLI for deployment

2. **Clone and Setup**
   ```bash
   git clone https://github.com/auditoryx/X-Open-Netowrk.git
   cd X-Open-Netowrk
   npm install
   cp .env.example .env.local
   ```

3. **Environment Configuration**
   - Edit `.env.local` with your Firebase and Stripe credentials
   - Follow the [MVP Deployment Guide](./MVP_DEPLOYMENT_GUIDE.md) for detailed setup
   - Set up backend dependencies: `cd backend && npm install`

4. **Start Development**
   ```bash
   # Terminal 1: Start Next.js frontend
   npm run dev
   
   # Terminal 2: Start backend API
   node backend/server.js
   ```

   The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
X-Open-Netowrk/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions and services
│   │   ├── firebase/        # Firebase configuration
│   │   ├── services/        # Business logic services
│   │   └── utils/           # Helper functions
│   └── styles/              # Global styles and Tailwind
├── backend/                 # Express.js API server
├── __tests__/               # Test files
├── docs/                    # Documentation
├── public/                  # Static assets
└── scripts/                 # Build and utility scripts
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test -- --runInBand --ci

# Run tests with Firebase emulator
firebase emulators:exec "npm test -- --runInBand --ci"

# Run specific test suites
npm test gamification
npm test booking
npm test auth

# Run with coverage
npm run test:coverage
```

### Writing Tests
- Use Jest for unit tests
- Follow existing test patterns in `__tests__/` directory
- Mock Firebase services for reliable testing
- Test both happy path and error scenarios

Example test structure:
```typescript
describe('BookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create booking successfully', async () => {
    const mockBooking = { /* test data */ };
    const result = await bookingService.createBooking(mockBooking);
    expect(result).toMatchObject(expected);
  });
});
```

## 🎨 Code Style & Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Prefer type safety over `any` types
- Use utility types when appropriate

```typescript
// Good: Well-typed interface
interface BookingRequest {
  creatorId: string;
  serviceType: string;
  budget: {
    amount: number;
    currency: string;
  };
}

// Avoid: Using any
function processBooking(data: any) { /* ... */ }
```

### React Component Standards
- Use functional components with hooks
- Implement proper TypeScript props interfaces
- Follow naming conventions (PascalCase for components)
- Use Tailwind CSS for styling

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ variant, children, onClick, disabled }: ButtonProps) {
  return (
    <button
      className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow consistent `btn` and `input` class patterns
- Implement responsive design with Tailwind breakpoints
- Use CSS modules for component-specific styles when needed

### Data Validation
- Use Zod for runtime type validation
- Validate user inputs on both client and server
- Implement proper error handling

```typescript
import { z } from 'zod';

const BookingSchema = z.object({
  creatorId: z.string().uuid(),
  serviceType: z.string().min(1),
  budget: z.object({
    amount: z.number().positive(),
    currency: z.string().length(3),
  }),
});

type BookingRequest = z.infer<typeof BookingSchema>;
```

## 🔐 Authentication & Security

### Authentication Patterns
- Use `getServerSession` for server-side auth checking
- Implement proper role-based access control
- Validate user permissions on both client and server

```typescript
import { getServerSession } from 'next-auth';

export async function requireAuth(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}
```

### Security Best Practices
- Never commit API keys or secrets
- Use environment variables for configuration
- Implement proper input sanitization
- Follow Firebase security rules patterns

## 🔄 Git Workflow

### Branch Naming
Create feature branches using the pattern: `codex/<slug>`

```bash
git checkout -b codex/booking-flow-improvements
git checkout -b codex/tier-system-updates
git checkout -b codex/fix-payment-bug
```

### Commit Message Format
Use Conventional Commit format:

```
feat: add split payment functionality to booking system
fix: resolve calendar sync issue for verified users
chore: update dependencies and security patches
docs: improve API documentation for booking endpoints
```

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and tests locally
4. Open pull request with descriptive title
5. Request review from team members
6. Address feedback and merge when approved

## 🐛 Bug Reports & Feature Requests

### Bug Report Template
```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14]
- Node version: [e.g., 22.1.0]
```

### Feature Request Template
```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed?

**Proposed Implementation**
Technical approach (if applicable)

**Additional Context**
Screenshots, mockups, or examples
```

## 📚 Development Resources

### Key Documentation
- [README.md](./README.md) - Project overview and setup
- [MVP Deployment Guide](./MVP_DEPLOYMENT_GUIDE.md) - Deployment instructions
- [Security Model](./SECURITY_MODEL.md) - Security implementation
- [Tier System](./TIER_SYSTEM.md) - User tier documentation
- [Booking Flow](./BOOKING_FLOW.md) - Booking system details

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🔧 Development Tools

### Linting & Formatting
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### Build & Deploy
```bash
# Production build
npm run build

# Start production server
npm start

# Deploy to Firebase
npm run deploy:prod
```

## 🏆 Recognition

### Contributors
We recognize contributions through:
- GitHub contributor graphs
- Acknowledgments in release notes
- Community Discord recognition
- Open source portfolio building

### Code Review Standards
- Constructive feedback focused on code improvement
- Timely reviews (within 48 hours)
- Clear explanation of requested changes
- Approval required from at least one team member

## 📞 Getting Help

### Community Support
- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and community chat
- **Documentation**: Check existing docs first

### Contact Information
- **Technical Questions**: Create GitHub issue
- **Security Issues**: security@auditoryx.com
- **General Inquiries**: team@auditoryx.com

## 📋 Checklist for Contributors

Before submitting a pull request:

- [ ] Code follows TypeScript and React best practices
- [ ] Tests are written and passing
- [ ] Linting passes without errors
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventional format
- [ ] Branch name follows `codex/<slug>` pattern
- [ ] No sensitive data (API keys, secrets) committed
- [ ] Performance impact considered
- [ ] Accessibility guidelines followed
- [ ] Mobile responsiveness tested

## 🎯 Contribution Areas

We welcome contributions in:
- 🔧 **Core Features**: Booking system, payments, authentication
- 🎨 **UI/UX**: Component design, accessibility, mobile experience
- 📊 **Analytics**: Performance tracking, user insights
- 🔐 **Security**: Authentication, authorization, data protection
- 📚 **Documentation**: Guides, API docs, tutorials
- 🧪 **Testing**: Unit tests, integration tests, E2E tests
- 🚀 **Performance**: Optimization, caching, loading speed
- 🌐 **Internationalization**: Multi-language support

---

Thank you for contributing to AuditoryX! Together, we're building the future of creator collaboration.

**Last Updated**: January 2025  
**Version**: 1.0