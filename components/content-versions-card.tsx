'use client'

import { ContentVersionsTab } from './content-versions-tab'

interface ContentVersionsCardProps {
  contentItemId: string
}

export function ContentVersionsCard({ contentItemId }: ContentVersionsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <ContentVersionsTab contentItemId={contentItemId} />
    </div>
  )
}