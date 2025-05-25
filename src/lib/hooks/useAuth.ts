import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

export function useAuth(): {
  user: any
  userData: any
  loading: boolean
} {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth must be used within an AuthProvider')

  const { user, userData, loading } = context
  return { user, userData, loading }
}
