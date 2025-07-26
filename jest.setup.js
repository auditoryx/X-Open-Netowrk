require('@testing-library/jest-dom');

// Add global polyfills for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

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
  return ({ children, href, ...props }) => {
    const React = require('react');
    return React.createElement('a', { href, ...props }, children);
  };
});

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  app: {},
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
    runTransaction: jest.fn(),
  },
  storage: {},
}));

// Mock Firebase services
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  onSnapshot: jest.fn(() => () => {}),
  serverTimestamp: jest.fn(() => new Date()),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn((date) => ({ toDate: () => date })),
  },
  runTransaction: jest.fn((db, callback) => callback({
    get: jest.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
    set: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
  })),
  query: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
  orderBy: jest.fn(() => ({})),
  limit: jest.fn(() => ({})),
  startAfter: jest.fn(() => ({})),
}));

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(() => () => {}),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  signOut: jest.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
}));

// Mock React Hot Toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => require('react').createElement('div', props, children),
    span: ({ children, ...props }) => require('react').createElement('span', props, children),
    button: ({ children, ...props }) => require('react').createElement('button', props, children),
  },
  AnimatePresence: ({ children }) => children,
}));

// Global test setup
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
} else {
  // Mock for Node.js environment
  global.window = {
    matchMedia: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  };
}

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
//       displayName: 'Test User'
//     },
//     loading: false,
//     userData: {
//       uid: 'test-user-id',
//       role: 'artist'
//     }
//   }),
// }));

// Mock Firebase - temporarily disabled
// jest.mock('@/lib/firebase', () => ({
//   db: {},
//   auth: {},
// }));

// Mock Firestore functions - temporarily disabled
// jest.mock('firebase/firestore', () => ({
//   collection: jest.fn(),
//   query: jest.fn(),
//   where: jest.fn(),
//   orderBy: jest.fn(),
//   onSnapshot: jest.fn((q, callback) => {
//     callback({ docs: [] });
//     return jest.fn(); // unsubscribe function
//   }),
//   doc: jest.fn(),
//   updateDoc: jest.fn(),
//   getCountFromServer: jest.fn(() => Promise.resolve({ data: () => ({ count: 0 }) })),
// }));

// Mock collab package functions - temporarily disabled
// jest.mock('@/lib/firestore/getCollabPackages', () => ({
//   getCollabPackages: jest.fn(() => Promise.resolve({ packages: [] })),
// }));

// jest.mock('@/lib/firestore/createCollabPackage', () => ({
//   archiveCollabPackage: jest.fn(() => Promise.resolve()),
// }));
