/**
 * Username utility functions for consistent username generation and handling
 */

/**
 * Generates a username from an email address
 * This should match the universe username generation logic which includes domain:
 * demo@gmail.com -> demo-gmail (more collision-resistant)
 */
export function generateUsernameFromEmail(email: string): string {
  if (!email) return ''
  
  const [localPart, domain] = email.toLowerCase().split('@')
  
  // Clean the local part (before @)
  const cleanLocalPart = localPart.replace(/[^a-zA-Z0-9]/g, '-')
  
  // Extract domain identifier (first part of domain)
  const domainPart = domain.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-')
  
  // Combine local part with domain identifier for uniqueness
  // demo@gmail.com -> demo-gmail
  return `${cleanLocalPart}-${domainPart}`
}

/**
 * Gets the username for the current authenticated user
 * This should be used consistently across the app for navigation and links
 */
export function getCurrentUsername(user: any): string | null {
  if (!user?.email) return null
  return generateUsernameFromEmail(user.email)
}

/**
 * Checks if the current user owns the page at the given pathname
 * Used for highlighting navigation items
 */
export function isCurrentUserPage(pathname: string, user: any): boolean {
  if (!user?.email) return false
  
  const currentUsername = getCurrentUsername(user)
  if (!currentUsername) return false
  
  // Extract username from pathname (first segment)
  const pathUsername = pathname.split('/')[1]
  
  // Check if we're on the current user's page
  return pathUsername === currentUsername
}

/**
 * Gets the profile page URL for the current user
 */
export function getCurrentUserProfileUrl(user: any): string {
  const username = getCurrentUsername(user)
  return username ? `/${username}` : '/'
}