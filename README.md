# X-Open-Network

This project uses Node and npm for both the frontend and the optional backend server.

## Installation

Run `npm install` in the project root to install the main dependencies. If you plan to use the backend server located in `backend/`, install its dependencies as well:

```bash
cd backend && npm install
```

## Running Tests

Jest tests are defined under the `__tests__` directory. After installing dependencies you can execute all tests with:

```bash
npm test
```

This command runs Jest using the configuration provided in `jest.config.js`.
