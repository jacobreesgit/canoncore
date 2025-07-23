'use client'

import { useState } from 'react'
import { ContentItemWithChildren } from '@/types/database'
import { ContentTreeItem } from './content-tree-item'

interface ContentTreeProps {
  items: ContentItemWithChildren[]
  universeId: string
  universeSlug: string
}

export function ContentTree({ items, universeId, universeSlug }: ContentTreeProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ContentTreeItem
          key={item.id}
          item={item}
          universeId={universeId}
          universeSlug={universeSlug}
          level={0}
        />
      ))}
    </div>
  )
}