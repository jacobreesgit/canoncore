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
 * Get display name for content type (custom or built-in)
 */
export function getContentTypeName(
  itemType: string, 
  allContentTypes?: Array<{ id: string; name: string } | { readonly id: string; readonly name: string }>
): string {
  // First, check if it's a custom type
  const customType = allContentTypes?.find(type => type.id === itemType)
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
 * Generate user initials from name or email
 */
export function getUserInitials(user: { user_metadata?: { full_name?: string }; email?: string }): string {
  return (user.user_metadata?.full_name || user.email || 'U')
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}