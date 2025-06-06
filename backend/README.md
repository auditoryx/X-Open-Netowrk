# Backend

This directory contains the Express based API that powers the application.

## Setup

1. Install dependencies for the root project and for the backend:

   ```bash
   npm install         # from the repository root
   cd backend && npm install
   ```

2. Copy `.env.example` from the project root and create a `.env` file inside `backend/`.
   Fill in the variables described below.

3. Start the server with:

   ```bash
   node server.js
   ```

## Environment Variables

The API requires both MongoDB and Firebase credentials. Define the following in `backend/.env`:

```
MONGO_URI=mongodb://localhost:27017/auditoryx
PORT=5000
JWT_SECRET=your-jwt-secret
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@example.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv..."
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

`firebaseAdminServer/index.ts` reads these variables when initializing `firebase-admin`.

## Running Tests

Jest is configured at the repository root. Execute all tests (including the backend tests) with:

```bash
npm test
```

## Seeding Data

Example data can be written to Firestore using the scripts in the `scripts/` folder.
Run them from the project root:

```bash
node scripts/seedProfiles.mjs
node scripts/seedServices.mjs

# optional helpers
npx ts-node scripts/addTestUser.ts
npx ts-node scripts/addTestBooking.ts
```

