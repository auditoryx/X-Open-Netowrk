'use client'

import React from 'react'

type Props = {
  filters: {
    role: string
    verifiedOnly: boolean
  }
  setFilters: (filters: any) => void
}

const FilterPanel = ({ filters, setFilters }: Props) => {
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, role: e.target.value })
  }

  const toggleVerified = () => {
    setFilters({ ...filters, verifiedOnly: !filters.verifiedOnly })
  }

  return (
    <div className="mb-6 p-4 border rounded-lg">
      <h2 className="font-semibold mb-2">Filters</h2>
      <div className="flex flex-col gap-3">
        <select
          value={filters.role}
          onChange={handleRoleChange}
          className="border p-2 rounded"
        >
          <option value="">All Roles</option>
          <option value="artist">Artist</option>
          <option value="producer">Producer</option>
          <option value="studio">Studio</option>
          <option value="videographer">Videographer</option>
          <option value="engineer">Engineer</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filters.verifiedOnly} onChange={toggleVerified} />
          Verified Only
        </label>
      </div>
    </div>
  )
}

export default FilterPanel
