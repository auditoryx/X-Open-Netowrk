'use client'

import React, { useEffect, useState } from 'react'
import { getAllCreators } from '@/lib/firestore/getAllCreators'
import DiscoveryGrid from './DiscoveryGrid'
import FilterPanel from './FilterPanel'

const DiscoveryWrapper = () => {
  const [creators, setCreators] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [filters, setFilters] = useState({ role: '', verifiedOnly: false })

  useEffect(() => {
    getAllCreators().then(setCreators)
  }, [])

  useEffect(() => {
    let result = creators

    if (filters.role) {
      result = result.filter((c) => c.role === filters.role)
    }
    if (filters.verifiedOnly) {
      result = result.filter((c) => c.verified === true)
    }

    setFiltered(result)
  }, [filters, creators])

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
      <FilterPanel filters={filters} setFilters={setFilters} />
      <DiscoveryGrid creators={filtered} />
    </div>
  )
}

export default DiscoveryWrapper
