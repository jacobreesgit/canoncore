import { useMemo, useState, useCallback } from 'react'

export interface SortableItem {
  id: string
  [key: string]: any
}

export type SortDirection = 'asc' | 'desc'
export type SortKey<T> = keyof T | ((item: T) => any)

export interface SortConfig<T extends SortableItem> {
  key: SortKey<T>
  direction: SortDirection
  label?: string
}

export interface FilterConfig<T extends SortableItem> {
  key: string
  predicate: (item: T, value: any) => boolean
  value: any
  label?: string
}

export interface SearchConfig<T extends SortableItem> {
  keys: (keyof T | ((item: T) => string))[]
  caseSensitive?: boolean
  exactMatch?: boolean
}

export interface ListOperationsConfig<T extends SortableItem> {
  items: T[]
  initialSort?: SortConfig<T>
  initialFilters?: FilterConfig<T>[]
  searchConfig?: SearchConfig<T>
  flattenItems?: (items: T[]) => T[]
}

export interface ListOperationsState<T extends SortableItem> {
  processedItems: T[]
  sortConfig: SortConfig<T> | null
  filters: FilterConfig<T>[]
  searchQuery: string
  totalCount: number
  filteredCount: number
}

export interface ListOperationsActions<T extends SortableItem> {
  setSortConfig: (config: SortConfig<T> | null) => void
  addFilter: (filter: FilterConfig<T>) => void
  removeFilter: (key: string) => void
  updateFilter: (key: string, value: any) => void
  clearFilters: () => void
  setSearchQuery: (query: string) => void
  clearSearch: () => void
  reset: () => void
}

// Default flatten function for hierarchical items
function defaultFlattenItems<T extends SortableItem>(items: T[]): T[] {
  const result: T[] = []
  
  function traverse(items: T[]) {
    items.forEach(item => {
      result.push(item)
      if ('children' in item && Array.isArray((item as any).children)) {
        traverse((item as any).children)
      }
    })
  }
  
  traverse(items)
  return result
}

// Sort function
function sortItems<T extends SortableItem>(
  items: T[], 
  sortConfig: SortConfig<T>
): T[] {
  if (!sortConfig) return items

  const { key, direction } = sortConfig
  
  return [...items].sort((a, b) => {
    let aValue: any
    let bValue: any
    
    if (typeof key === 'function') {
      aValue = key(a)
      bValue = key(b)
    } else {
      aValue = a[key]
      bValue = b[key]
    }
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return direction === 'asc' ? -1 : 1
    if (bValue == null) return direction === 'asc' ? 1 : -1
    
    // Convert to comparable values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// Filter function
function filterItems<T extends SortableItem>(
  items: T[], 
  filters: FilterConfig<T>[]
): T[] {
  if (filters.length === 0) return items
  
  return items.filter(item => 
    filters.every(filter => filter.predicate(item, filter.value))
  )
}

// Search function
function searchItems<T extends SortableItem>(
  items: T[], 
  query: string, 
  config: SearchConfig<T>
): T[] {
  if (!query.trim()) return items
  
  const { keys, caseSensitive = false, exactMatch = false } = config
  const searchQuery = caseSensitive ? query : query.toLowerCase()
  
  return items.filter(item => 
    keys.some(key => {
      let value: string
      
      if (typeof key === 'function') {
        value = key(item)
      } else {
        value = String(item[key] || '')
      }
      
      if (!caseSensitive) {
        value = value.toLowerCase()
      }
      
      return exactMatch 
        ? value === searchQuery
        : value.includes(searchQuery)
    })
  )
}

export function useListOperations<T extends SortableItem>(
  config: ListOperationsConfig<T>
): ListOperationsState<T> & ListOperationsActions<T> {
  const { 
    items, 
    initialSort, 
    initialFilters = [], 
    searchConfig,
    flattenItems = defaultFlattenItems 
  } = config
  
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialSort || null)
  const [filters, setFilters] = useState<FilterConfig<T>[]>(initialFilters)
  const [searchQuery, setSearchQuery] = useState('')

  // Memoized processed items
  const processedItems = useMemo(() => {
    let result = flattenItems(items)
    
    // Apply search first
    if (searchQuery && searchConfig) {
      result = searchItems(result, searchQuery, searchConfig)
    }
    
    // Apply filters
    result = filterItems(result, filters)
    
    // Apply sorting
    if (sortConfig) {
      result = sortItems(result, sortConfig)
    }
    
    return result
  }, [items, sortConfig, filters, searchQuery, searchConfig, flattenItems])

  // Actions
  const addFilter = useCallback((filter: FilterConfig<T>) => {
    setFilters(prev => {
      const existing = prev.find(f => f.key === filter.key)
      if (existing) {
        return prev.map(f => f.key === filter.key ? filter : f)
      }
      return [...prev, filter]
    })
  }, [])

  const removeFilter = useCallback((key: string) => {
    setFilters(prev => prev.filter(f => f.key !== key))
  }, [])

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => prev.map(f => 
      f.key === key ? { ...f, value } : f
    ))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters([])
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const reset = useCallback(() => {
    setSortConfig(initialSort || null)
    setFilters(initialFilters)
    setSearchQuery('')
  }, [initialSort, initialFilters])

  return {
    // State
    processedItems,
    sortConfig,
    filters,
    searchQuery,
    totalCount: flattenItems(items).length,
    filteredCount: processedItems.length,
    
    // Actions
    setSortConfig,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    setSearchQuery,
    clearSearch,
    reset,
  }
}

// Common sort configurations
export const commonSorts = {
  alphabetical: <T extends SortableItem & { title: string }>(direction: SortDirection = 'asc'): SortConfig<T> => ({
    key: 'title' as keyof T,
    direction,
    label: `Title ${direction === 'asc' ? 'A-Z' : 'Z-A'}`
  }),
  
  dateCreated: <T extends SortableItem & { created_at: string }>(direction: SortDirection = 'desc'): SortConfig<T> => ({
    key: 'created_at' as keyof T,
    direction,
    label: `Date ${direction === 'desc' ? 'Newest' : 'Oldest'}`
  }),
  
  dateUpdated: <T extends SortableItem & { updated_at: string }>(direction: SortDirection = 'desc'): SortConfig<T> => ({
    key: 'updated_at' as keyof T,
    direction,
    label: `Updated ${direction === 'desc' ? 'Recently' : 'Oldest'}`
  }),
  
  orderIndex: <T extends SortableItem & { order_index: number }>(direction: SortDirection = 'asc'): SortConfig<T> => ({
    key: 'order_index' as keyof T,
    direction,
    label: `Order ${direction === 'asc' ? 'First' : 'Last'}`
  }),
}

// Common filter configurations
export const commonFilters = {
  byType: <T extends SortableItem & { item_type?: string; type?: string }>(types: string[]): FilterConfig<T> => ({
    key: 'type',
    predicate: (item, value) => value.length === 0 || value.includes(item.item_type || item.type),
    value: types,
    label: 'Content Type'
  }),
  
  hasDescription: <T extends SortableItem & { description?: string }>(): FilterConfig<T> => ({
    key: 'hasDescription',
    predicate: (item) => Boolean(item.description?.trim()),
    value: true,
    label: 'Has Description'
  }),
  
  dateRange: <T extends SortableItem & { created_at: string }>(startDate?: Date, endDate?: Date): FilterConfig<T> => ({
    key: 'dateRange',
    predicate: (item, { start, end }) => {
      const itemDate = new Date(item.created_at)
      if (start && itemDate < start) return false
      if (end && itemDate > end) return false
      return true
    },
    value: { start: startDate, end: endDate },
    label: 'Date Range'
  }),
}

// Common search configurations
export const commonSearches = {
  titleAndDescription: <T extends SortableItem & { title: string; description?: string }>(): SearchConfig<T> => ({
    keys: ['title', 'description'] as (keyof T)[],
    caseSensitive: false,
    exactMatch: false
  }),
  
  titleOnly: <T extends SortableItem & { title: string }>(): SearchConfig<T> => ({
    keys: ['title'] as (keyof T)[],
    caseSensitive: false,
    exactMatch: false
  }),
}