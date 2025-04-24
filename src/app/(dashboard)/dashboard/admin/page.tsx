'use client'

import { getServerUser } from '@/lib/getServerUser'
import AssignRoleForm from '@/components/admin/AssignRoleForm'

export default async function AdminPage() {
  const user = await getServerUser()

  if (!user || user.email !== 'zenhrtx@gmail.com') {
    return <p className="p-6">Access Denied.</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Tools</h1>
      <AssignRoleForm />
    </div>
  )
}
