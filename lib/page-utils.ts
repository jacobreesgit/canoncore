import { ContentItemWithChildren } from '@/types/database'

/**
 * Business logic utilities for page components
 */

/**
 * Find a content item with its children from a hierarchical tree
 */
export function findItemWithChildren(
  items: ContentItemWithChildren[], 
  targetId: string
): ContentItemWithChildren | null {
  for (const item of items) {
    if (item.id === targetId) return item
    if (item.children) {
      const found = findItemWithChildren(item.children, targetId)
      if (found) return found
    }
  }
  return null
}

/**
 * Get display name for organisation type (custom or built-in)
 */
export function getOrganisationTypeName(
  itemType: string, 
  allOrganisationTypes?: Array<{ id: string; name: string } | { readonly id: string; readonly name: string }>
): string {
  // First, check if it's a custom type
  const customType = allOrganisationTypes?.find(type => type.id === itemType)
  if (customType) {
    return customType.name
  }
  
  // Fallback to built-in type names
  return itemType.charAt(0).toUpperCase() + itemType.slice(1).replace('_', ' ')
}

/**
 * Build hierarchical context string for nested content
 */
export function buildHierarchyContext(
  currentItem: ContentItemWithChildren,
  contentItems: ContentItemWithChildren[],
  universeName: string
): string {
  if (!contentItems || !currentItem) return universeName
  
  const buildPath = (
    items: ContentItemWithChildren[], 
    targetId: string, 
    path: string[] = []
  ): string[] | null => {
    for (const item of items) {
      if (item.id === targetId) {
        return path
      }
      if (item.children) {
        const found = buildPath(item.children, targetId, [...path, item.title])
        if (found) return found
      }
    }
    return null
  }
  
  const parentPath = buildPath(contentItems, currentItem.id)
  if (parentPath && parentPath.length > 0) {
    return `${parentPath.join(' in ')} in ${universeName}`
  }
  
  return universeName
}

/**
 * Count all nested children in a content tree
 */
export function countAllChildren(items: ContentItemWithChildren[]): number {
  let count = 0
  for (const item of items) {
    count++
    if (item.children && item.children.length > 0) {
      count += countAllChildren(item.children)
    }
  }
  return count
}

/**
 * Generate user initials from name or email
 */
export function getUserInitials(user?: { user_metadata?: { full_name?: string }; email?: string; full_name?: string } | null): string {
  if (!user) return 'U'
  
  // Handle both auth user structure (user_metadata.full_name) and profile structure (full_name)
  const fullName = user.user_metadata?.full_name || (user as any).full_name
  const name = fullName || user.email || 'U'
  
  return name
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}