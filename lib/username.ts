/**
 * Extract username from email with collision resistance
 * This should match the updated database function that includes domain part
 */
export function extractUsernameFromEmail(email: string): string {
  const [localPart, domain] = email.toLowerCase().split('@')
  
  // Clean the local part (before @)
  const cleanLocalPart = localPart.replace(/[^a-zA-Z0-9]/g, '-')
  
  // Extract domain identifier (first part of domain)
  const domainPart = domain.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-')
  
  // Combine local part with domain identifier for uniqueness
  // jacobrees@me.com -> jacobrees-me
  // jacobrees@gmail.com -> jacobrees-gmail
  return `${cleanLocalPart}-${domainPart}`
}

/**
 * Convert username back to readable display name
 * jacobrees-gmail -> Jacob Rees (Gmail)
 */
export function formatUsernameForDisplay(username: string): string {
  const parts = username.split('-')
  if (parts.length < 2) return username
  
  const domainPart = parts.pop() || ''
  const namePart = parts.join(' ')
  
  // Capitalize first letter of each word
  const formattedName = namePart
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  const formattedDomain = domainPart.charAt(0).toUpperCase() + domainPart.slice(1)
  
  return `${formattedName} (${formattedDomain})`
}