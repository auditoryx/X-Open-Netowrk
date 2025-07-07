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
  return ({ children, href, ...props }) => {
    const React = require('react');
    return React.createElement('a', { href, ...props }, children);
  };
});

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
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
