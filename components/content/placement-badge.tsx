import { Badge } from '@/components/ui'

interface PlacementBadgeProps {
  placementCount?: number
}

export function PlacementBadge({ placementCount }: PlacementBadgeProps) {
  // Only show badge if item appears in multiple locations
  if (!placementCount || placementCount <= 1) {
    return null
  }

  return (
    <div title={`This content appears in ${placementCount} locations`}>
      <Badge variant="info">
        {placementCount} locations
      </Badge>
    </div>
  )
}