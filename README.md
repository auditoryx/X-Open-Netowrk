# AuditoryX Open Network

AuditoryX connects artists and creators around the world. The application uses Firebase for authentication and data storage, Stripe for payments and subscriptions, and Nodemailer/SendGrid for transactional email.

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your credentials.

## Development

Run the development server with
```bash
npm run dev
```
The app will be available on `http://localhost:3000`.

## Production Build

Create a production build and start the server with:
```bash
npm run build
npm start
```

## Firebase Configuration

Create a Firebase project and enable Authentication and Firestore. Add the Firebase keys from your project to the environment variables prefixed with `NEXT_PUBLIC_FIREBASE_`. For server-side admin features, provide `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` from your service account.

## Stripe Configuration

Add your Stripe secret key and webhook secret to `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. The publishable key and other public values should use the `NEXT_PUBLIC_` prefix. Update `STRIPE_CONNECT_REDIRECT_URL` to the URL users are returned to after onboarding.

## Mail Credentials

Email sending uses Nodemailer. Provide the account details in `SMTP_EMAIL` and `SMTP_PASS`. If using SendGrid, set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` as well.

## Environment Variables

See `.env.example` for a full list of variables required by the project.

## Escrow Payments

All payments are placed in escrow when a booking is made. Funds remain held until the work is completed and both parties confirm the outcome. This protects buyers and sellers by ensuring money is only released once the service is delivered.
