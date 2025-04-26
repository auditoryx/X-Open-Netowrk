// src/lib/hooks/useAuth.ts
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

export function useAuth(): { user: any } {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
// This hook provides access to the authentication context, allowing components to access user information and authentication state.
// It ensures that the hook is used within the context of an AuthProvider, throwing an error if used outside of it.
// This is important for maintaining the integrity of the authentication flow in the application.
// The hook returns the user object from the context, which can be used in components to display user-specific information or manage authentication state.
// This is important for maintaining the integrity of the authentication flow in the application.
// The hook returns the user object from the context, which can be used in components to display user-specific information or manage authentication state.
// This is important for maintaining the integrity of the authentication flow in the application.
// The hook returns the user object from the context, which can be used in components to display user-specific information or manage authentication state.
// This is important for maintaining the integrity of the authentication flow in the application.