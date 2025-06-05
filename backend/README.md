# Backend

## Firebase Admin Environment Variables

The Firebase Admin SDK is configured using environment variables. Define the following variables in your environment or in an `.env` file:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@example.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv..."
```

`firebaseAdminServer/index.ts` reads these variables when initializing `firebase-admin`.
