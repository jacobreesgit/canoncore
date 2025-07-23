'use client'

import { useState } from 'react'
import { ContentItemWithChildren } from '@/types/database'
import { CreateContentModal } from './create-content-modal'

interface ContentTreeItemProps {
  item: ContentItemWithChildren
  universeId: string
  level: number
}

export function ContentTreeItem({ item, universeId, level }: ContentTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAddChild, setShowAddChild] = useState(false)

  const hasChildren = item.children && item.children.length > 0
  const paddingLeft = level * 24

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'film': return '🎬'
      case 'series': return '📺'
      case 'season': return '📀'
      case 'episode': return '▶️'
      case 'book': return '📚'
      case 'character': return '👤'
      case 'location': return '🗺️'
      case 'event': return '⚡'
      case 'documentary': return '🎥'
      case 'short': return '🎞️'
      case 'special': return '⭐'
      case 'collection': return '📦'
      default: return '📄'
    }
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors"
        style={{ paddingLeft: `${paddingLeft + 8}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        
        <span className="text-lg">{getItemIcon(item.item_type)}</span>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{item.title}</span>
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              {item.item_type}
            </span>
            {item.versions && item.versions.length > 0 && (
              <span className="text-xs text-blue-600">
                {item.versions.length} version{item.versions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {item.description && (
            <div className="text-sm text-gray-600 truncate mt-1">
              {item.description}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAddChild(true)}
          className="text-xs text-green-600 hover:text-green-700 px-2 py-1 hover:bg-green-50 rounded transition-colors"
        >
          + Add Child
        </button>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4">
          {item.children!.map((child) => (
            <ContentTreeItem
              key={child.id}
              item={child}
              universeId={universeId}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {showAddChild && (
        <CreateContentModal
          universeId={universeId}
          parentId={item.id}
          onClose={() => setShowAddChild(false)}
        />
      )}
    </div>
  )
}