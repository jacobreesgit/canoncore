'use client'

import { CountBadge } from '@/components/ui/base/count-badge'
import { useContentLinkStats } from '@/hooks/use-content-links'

interface RelationshipBadgeProps {
  contentItemId: string
  size?: 'sm' | 'md'
}

export function RelationshipBadge({ contentItemId, size = 'sm' }: RelationshipBadgeProps) {
  const { data: stats } = useContentLinkStats(contentItemId)

  return (
    <CountBadge
      count={stats?.total || 0}
      icon="🔗"
      label="relationships"
      size={size}
      variant="info"
    />
  )
}