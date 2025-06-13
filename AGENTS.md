# Instructions for Codex Agents

This repository contains a Next.js application with a Node.js backend and Firebase functions. The following guidelines explain how to set up the project, run it locally, execute tests, and build for production. These instructions apply to the entire repository.

## Directories
- API Routes: `src/app/api`
- Components: `src/components`
- Utilities: `src/lib`
- Pages: `src/app/*`

## Setup
1. Ensure **Node.js 22.x** is installed. `pnpm` may be used as a fallback for package management.
2. Install dependencies from the project root:
   ```bash
   npm install
   ```
3. The backend Express API located in `backend/` has its own dependencies. Install them once using:
   ```bash
   cd backend && npm install
   cd ..
   ```
4. Copy `.env.example` to `.env` for the Next.js app. Duplicate the same file to `backend/.env` and set the variables required by the backend as documented in the respective `README.md` files. If variables are missing, stub them with placeholder values.
5. For documentation diagrams, install Mermaid CLI globally so `mmdc` is available. Use `npm` for consistency:
   ```bash
   npm install -g @mermaid-js/mermaid-cli
   ```

## Environment / Tooling
- Use Node.js **22.x**. If unavailable, `pnpm` can be used as a drop-in replacement for `npm` commands.
- Reference `.env.example` to ensure required variables exist and stub missing keys with placeholders.

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

## Git Workflow
- Create a new branch for each change using the pattern `codex/<slug>`.
- Open a pull request when work is ready for review.

## Commit Messages
- Prefix commit summaries with Conventional Commit types such as `feat:`, `fix:` or `chore:`.

## Testing
- Unit tests are written with Jest/ts-jest under the `__tests__/` directory.
- Run all tests from the repository root in CI mode so Jest exits cleanly:
  ```bash
  npm test -- --runInBand --ci
  ```
- For Firestore integration tests, execute them inside the emulator:
  ```bash
  firebase emulators:exec "npm test -- --runInBand --ci"
  ```
- Codex should execute these commands after code changes that affect functionality or tests.

## Production Build
- Build and start the Next.js app:
  ```bash
  npm run build
  npm start
  ```
- If any `NEXT_PUBLIC_*` environment variables are missing, skip `npm run build` and print a warning instead of failing.

## Additional Scripts
- Optional scripts for seeding Firestore data exist under `scripts/`. Run them from the repository root using Node or `ts-node`.

## Notes for Codex
- Always install dependencies if `package.json` changes.
- Restore packages using:
  ```bash
  npm ci --prefer-offline
  ```
- If `npm install` modifies `package-lock.json`, commit the updated lockfile.
- After modifying code, run `npm test -- --runInBand --ci` and ensure it passes.
- If an ESLint configuration exists, also run:
  ```bash
  npm run lint
  ```

## Gamification Development
- Execute streak reset cron locally (only if `process.env.EMULATOR_ENV === "true"`):
  ```bash
  firebase emulators:exec 'node cron/streakReset.js'
  ```
- Run gamification tests:
  ```bash
  pnpm test gamification
  ```

## Security
- Never commit files matching `.env*`, `.firebase/*` or `serviceAccount*.json`.
- If `git secrets` is installed, run `git secrets --scan` before committing.

## CI Hooks
- GitHub Actions will fail the build if `npm test` or `npm run build` fail.
- See `.github/workflows/main.yml` for the workflow definition.
