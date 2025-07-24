'use client'

import { useState } from 'react'
import { getAuth } from 'firebase/auth'
import { setUserIntent } from '@/lib/firestore/setUserIntent'

const roles = ['client', 'provider', 'both']

export default function RoleToggle() {
  const [selectedRole, setSelectedRole] = useState('')

  const handleSetRole = async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    await setUserIntent(user.uid, selectedRole as any)
  }

  return (
    <div className="p-4 space-y-2 border rounded">
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="input-base"
      >
        <option value="">Select Role</option>
        {roles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <button
        onClick={handleSetRole}
        className="btn btn-primary w-full"
      >
        Set Role
      </button>
    </div>
  )
}
