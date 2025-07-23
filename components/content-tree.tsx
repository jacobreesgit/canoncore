'use client'

import { useState } from 'react'
import { ContentItemWithChildren } from '@/types/database'
import { ContentTreeItem } from './content-tree-item'

interface ContentTreeProps {
  items: ContentItemWithChildren[]
  universeId: string
}

export function ContentTree({ items, universeId }: ContentTreeProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ContentTreeItem
          key={item.id}
          item={item}
          universeId={universeId}
          level={0}
        />
      ))}
    </div>
  )
}