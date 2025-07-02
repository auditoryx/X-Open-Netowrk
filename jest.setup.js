require('@testing-library/jest-dom');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '/',
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }) => {
    const React = require('react');
    return React.createElement('a', { href }, children);
  };
});

// Mock auth hook
jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User'
    },
    loading: false,
    userData: {
      uid: 'test-user-id',
      role: 'artist'
    }
  }),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn((q, callback) => {
    callback({ docs: [] });
    return jest.fn(); // unsubscribe function
  }),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getCountFromServer: jest.fn(() => Promise.resolve({ data: () => ({ count: 0 }) })),
}));

// Mock collab package functions
jest.mock('@/lib/firestore/getCollabPackages', () => ({
  getCollabPackages: jest.fn(() => Promise.resolve({ packages: [] })),
}));

jest.mock('@/lib/firestore/createCollabPackage', () => ({
  archiveCollabPackage: jest.fn(() => Promise.resolve()),
}));
