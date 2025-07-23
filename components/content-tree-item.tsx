'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContentItemWithChildren } from '@/types/database'
import { CreateContentModal } from './create-content-modal'
import { EditContentModal } from './edit-content-modal'
import { DeleteContentModal } from './delete-content-modal'
import { useAllContentTypes } from '@/hooks/use-custom-content-types'

interface ContentTreeItemProps {
  item: ContentItemWithChildren
  universeId: string
  universeSlug: string
  level: number
}

export function ContentTreeItem({ item, universeId, universeSlug, level }: ContentTreeItemProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAddChild, setShowAddChild] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: allContentTypes } = useAllContentTypes(universeId)
  const hasChildren = item.children && item.children.length > 0
  const paddingLeft = level * 24

  const getItemIcon = (itemType: string) => {
    // First, check if it's a custom type
    const customType = allContentTypes?.find(type => type.id === itemType)
    if (customType) {
      return customType.emoji
    }
    
    // Fallback to built-in types
    switch (itemType) {
      case 'film': return '🎬'
      case 'book': return '📚'
      case 'serial': return '📽️'
      case 'series': return '📺'
      case 'show': return '🎭'
      case 'collection': return '📦'
      case 'character': return '👤'
      case 'location': return '🗺️'
      case 'event': return '⚡'
      case 'documentary': return '🎥'
      case 'short': return '🎞️'
      case 'special': return '⭐'
      case 'audio_drama': return '🎧'
      case 'minisode': return '📱'
      default: return '📄'
    }
  }
  
  const getItemTypeName = (itemType: string) => {
    // First, check if it's a custom type
    const customType = allContentTypes?.find(type => type.id === itemType)
    if (customType) {
      return customType.name
    }
    
    // Fallback to built-in type names
    return itemType.charAt(0).toUpperCase() + itemType.slice(1)
  }

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  const handleContentClick = () => {
    // Navigate to content detail page
    router.push(`/universes/${universeSlug}/content/${item.id}`)
  }

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 p-2 rounded transition-colors hover:bg-gray-50"
        style={{ paddingLeft: `${paddingLeft + 8}px` }}
      >
        {hasChildren && (
          <button
            onClick={handleChevronClick}
            className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        
        <span className="text-lg">{getItemIcon(item.item_type)}</span>
        
        <div 
          className="flex-1 min-w-0 cursor-pointer hover:bg-blue-50 rounded p-1 -m-1 transition-colors"
          onClick={handleContentClick}
          title="Click to view content page"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{item.title}</span>
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              {getItemTypeName(item.item_type)}
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

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => handleButtonClick(e, () => setShowEditModal(true))}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit item"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => handleButtonClick(e, () => setShowDeleteModal(true))}
            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete item"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={(e) => handleButtonClick(e, () => setShowAddChild(true))}
            className="text-xs text-green-600 hover:text-green-700 px-2 py-1 hover:bg-green-50 rounded transition-colors"
          >
            + Add Child
          </button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4">
          {item.children!.map((child) => (
            <ContentTreeItem
              key={child.id}
              item={child}
              universeId={universeId}
              universeSlug={universeSlug}
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

      {showEditModal && (
        <EditContentModal
          item={item}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteContentModal
          item={item}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}