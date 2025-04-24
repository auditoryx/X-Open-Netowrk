'use client'

import { useState } from 'react'
import { assignRole } from '@/lib/assignRole'

export default function AssignRoleForm() {
  const [uid, setUid] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await assignRole(uid, role)
      alert('Role assigned successfully')
    } catch (err) {
      alert('Failed to assign role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="User UID"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Role (artist, producer, etc.)"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        {loading ? 'Assigning...' : 'Assign Role'}
      </button>
    </form>
  )
}
