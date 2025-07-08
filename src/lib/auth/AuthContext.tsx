import React, { createContext, useContext } from 'react';

// Define a minimal user type (customize as needed)
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  // Add more fields as needed
}

// Context value type
interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
}

// Create the context with default values
export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
});

// Context provider (customize logic as needed)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // You can add real auth logic here
  const value: AuthContextValue = { user: null, loading: false };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the context
export const useAuth = () => useContext(AuthContext);
