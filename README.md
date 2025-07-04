# AuditoryX - Creator Collaboration Platform

**AuditoryX** is a comprehensive platform connecting audio creators, engineers, and music professionals for seamless collaboration, booking management, and revenue sharing. Built for the modern creator economy, it enables talent discovery, project management, and secure payment processing.

## 🎯 Project Overview

AuditoryX empowers creators to:
- **Discover & Book Talent**: Find audio engineers, producers, musicians, and other creators
- **Manage Collaborations**: Handle project workflows, split bookings, and team coordination
- **Process Payments**: Secure transactions with revenue splitting via Stripe
- **Build Portfolio**: Showcase work with advanced portfolio management
- **Track Analytics**: Monitor performance with comprehensive analytics
- **Scale Business**: Enterprise-grade features for labels and agencies

## 🚀 Key Features

### Core Platform
- **Advanced Search**: AI-powered creator discovery with smart filtering
- **Booking System**: Flexible booking with split payments and team coordination
- **Real-time Chat**: Integrated messaging for seamless communication
- **Portfolio Management**: Rich media showcase with case studies
- **Revenue Splitting**: Automated payment distribution for collaborations

### Advanced Features
- **PWA Support**: Offline-first mobile experience
- **Admin Dashboard**: Comprehensive platform management
- **Mentorship System**: Connect mentors with mentees
- **Analytics Engine**: Performance tracking and insights
- **Enterprise Solutions**: Bulk booking and artist roster management

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **Next.js 15** - Full-stack React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Data visualization

### Backend & Database
- **Firebase** - Backend-as-a-Service platform
  - **Authentication** - User management and auth
  - **Firestore** - NoSQL database
  - **Storage** - File and media storage
  - **Functions** - Serverless computing
- **Next.js API Routes** - Server-side API endpoints

### Payments & Subscriptions
- **Stripe API** - Payment processing and subscriptions
- **Stripe Connect** - Marketplace payments and revenue splitting

### Development & Testing
- **Jest** - Unit testing framework
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Deployment & Monitoring
- **Firebase Hosting** - Static site hosting
- **Vercel** - Alternative deployment platform
- **Firebase Analytics** - Usage tracking
- **Custom Monitoring** - Performance and error tracking

## 📋 Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Firebase CLI** for deployment
- **Git** for version control

## 🏗 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/auditoryx/X-Open-Netowrk.git
cd X-Open-Netowrk
```

### 2. Install Dependencies

Run the Jest test suite with:
```bash
npm test
```

This will execute all unit tests located in any `__tests__` directories.

## Deploying Firestore Indexes

After modifying `firestore.indexes.json`, deploy the indexes to your Firebase
project:

```bash
firebase deploy --only firestore:indexes
```

Run this command from the repository root so the new composite and single-field
indexes become active.

### Payment Flow

![Stripe Flow](docs/diagrams/stripe-flow.png)

```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Copy the example environment file and configure your variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys and configuration (see Environment Variables section below).

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Firebase Configuration
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Stripe Configuration
```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_CONNECT_REDIRECT_URL=http://localhost:3000/connect/callback
```

### NextAuth Configuration
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Email Configuration
```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Additional Services
```env
# Redis (for caching)
REDIS_URL=redis://localhost:6379

# AI Features
OPENAI_API_KEY=your_openai_key

# Admin Features
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
```

## 🔄 CI/CD Pipeline

AuditoryX uses GitHub Actions for automated testing and deployment.

### Workflow Overview
- **Linting & Type Checking** - ESLint and TypeScript validation
- **Unit Testing** - Jest with coverage reporting
- **End-to-End Testing** - Playwright automated browser tests
- **Security Audits** - Dependency vulnerability scanning
- **Automated Deployment** - Staging and production deployments

### Pipeline Triggers
- **Pull Requests** - Full test suite runs on all PRs
- **Main Branch** - Automatic deployment to production
- **Develop Branch** - Automatic deployment to staging

### Running CI Locally
```bash
# Run the full CI pipeline locally
npm run lint          # Code linting
npm run type-check     # TypeScript validation
npm run test:coverage  # Unit tests with coverage
npm run test:e2e       # End-to-end tests
npm run build          # Production build
```

### Coverage Requirements
- **Minimum 70% code coverage** for all new code
- **90%+ accessibility score** on key user flows
- **Zero high-severity security vulnerabilities**

### Deployment Process
1. Code merged to main/develop
2. Automated tests run
3. Build and security checks pass
4. Automatic deployment to respective environment
5. Post-deployment health checks

## 🛡️ Security & Monitoring

### Error Monitoring
AuditoryX uses **Sentry** for comprehensive error tracking:
- Real-time error reporting
- Performance monitoring
- User session replay
- Custom error boundaries

Access the Sentry dashboard at your configured Sentry project URL.

### Accessibility Compliance
Run accessibility audits on key user flows:
```bash
# Run automated accessibility audit
./scripts/accessibility-audit.sh

# Target: 90%+ accessibility score
# Covers: Homepage, booking flow, dashboard, profile pages
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
# or
yarn test
```

### Watch Mode
```bash
npm run test:watch
# or
yarn test:watch
```

### End-to-End Tests
```bash
npm run test:e2e
# or
yarn test:e2e
```

### Type Checking
```bash
npm run type-check
# or
npx tsc --noEmit
```

### Linting
```bash
npm run lint
# or
yarn lint
```

### Fix Linting Issues
```bash
npm run lint:fix
# or
yarn lint:fix
```

## 🚀 Deployment

### Firebase Deployment (Recommended)

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Build and Deploy**
```bash
npm run build
firebase deploy
```

### Vercel Deployment (Alternative)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

### Environment Variables for Production

Ensure all environment variables are configured in your deployment platform:
- Firebase: Use `firebase functions:config:set`
- Vercel: Add via dashboard or CLI
- Other platforms: Follow platform-specific documentation

## 📁 Project Structure

```
X-Open-Netowrk/
├── components/           # Reusable UI components
├── pages/               # Next.js pages (Pages Router)
├── src/
│   ├── app/            # Next.js app directory (App Router)
│   ├── components/     # Additional components
│   ├── lib/           # Utility functions and services
│   │   ├── firebase/  # Firebase configuration
│   │   ├── services/  # Business logic services
│   │   └── utils/     # Helper functions
│   └── styles/        # Global styles
├── public/            # Static assets
├── __tests__/         # Test files
├── firebase/          # Firebase configuration
├── docs/             # Documentation
└── scripts/          # Build and deployment scripts
```

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run end-to-end tests
- `npm run type-check` - Run TypeScript type checking

## 💰 Escrow Payments

All payments are placed in escrow when a booking is made. Funds remain held until the work is completed and both parties confirm the outcome. This protects buyers and sellers by ensuring money is only released once the service is delivered.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Follow the existing code style
- Update documentation as needed

## 📚 Documentation & Resources

### External Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

### Internal Documentation
- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)
- [Deployment Guide](./docs/deployment.md)
- [Architecture Overview](./docs/architecture.md)

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+ required)
   - Clear cache: `npm run clean` or `rm -rf .next`
   - Verify environment variables

2. **Firebase Connection Issues**
   - Verify Firebase configuration
   - Check network connectivity
   - Ensure Firebase project is active

3. **Stripe Integration Issues**
   - Verify API keys are correct
   - Check webhook configuration
   - Ensure test/production modes match

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with love for the creator community
- Inspired by modern collaboration platforms
- Powered by cutting-edge web technologies

---

**AuditoryX** - Connecting Creators, Amplifying Collaboration

For support, please contact [support@auditoryx.com](mailto:support@auditoryx.com)

