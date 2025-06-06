# Instructions for Codex Agents

This repository contains a Next.js application with a Node.js backend and Firebase functions. The following guidelines explain how to set up the project, run it locally, execute tests, and build for production. These instructions apply to the entire repository.

## Directories
- API Routes: `src/app/api`
- Components: `src/components`
- Utilities: `src/lib`
- Pages: `src/app/*`

## Setup
1. Ensure **Node.js 18+** is installed.
2. Install dependencies from the project root:
   ```bash
   npm install
   ```
3. The backend Express API located in `backend/` has its own dependencies. Install them once using:
   ```bash
   cd backend && npm install
   cd ..
   ```
4. Copy `.env.example` to `.env` for the Next.js app. Duplicate the same file to `backend/.env` and set the variables required by the backend as documented in the respective `README.md` files.
5. For documentation diagrams, install Mermaid CLI globally so `mmdc` is available. Use `npm` for consistency:
   ```bash
   npm install -g @mermaid-js/mermaid-cli
   ```

## Development
- Start the Next.js development server from the repository root:
  ```bash
  npm run dev
  ```
- In a separate terminal, run the backend API (requires the `.env` in `backend/`):
  ```bash
  node backend/server.js
  ```

## Contribution Guidelines
- Use Tailwind `btn` and `input` classes
- Favor `zod` for validation
- Use `getServerSession` for auth-checking

## Testing
- Unit tests are written with Jest/ts-jest under the `__tests__/` directory.
- Run all tests from the repository root:
  ```bash
  npm test
  ```
- Codex should execute this command after code changes that affect functionality or tests.

## Production Build
- Build and start the Next.js app:
  ```bash
  npm run build
  npm start
  ```

## Additional Scripts
- Optional scripts for seeding Firestore data exist under `scripts/`. Run them from the repository root using Node or `ts-node`.

## Notes for Codex
- Always install dependencies if `package.json` changes.
- After modifying code, run `npm test` and ensure it passes.
- No linting or additional CI steps are required.

## Gamification Development
- Execute streak reset cron locally:
  ```bash
  firebase emulators:exec 'node cron/streakReset.js'
  ```
- Run gamification tests:
  ```bash
  pnpm test gamification
  ```
