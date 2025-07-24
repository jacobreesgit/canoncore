'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
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
  bulkSelection?: {
    selectedItems: Set<string>
    isSelectionMode: boolean
    toggleSelection: (itemId: string) => void
  }
}

export function ContentTreeItem({ item, universeId, universeSlug, level, bulkSelection }: ContentTreeItemProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAddChild, setShowAddChild] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: allContentTypes } = useAllContentTypes(universeId)
  const hasChildren = item.children && item.children.length > 0
  const paddingLeft = level * 24

  // Draggable functionality
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: item.id,
  })

  // Drop zone for the entire item (to become a child)
  const {
    isOver: isItemDropOver,
    setNodeRef: setItemDropRef,
  } = useDroppable({
    id: item.id,
  })

  // Drop zone for inserting before
  const {
    isOver: isBeforeDropOver,
    setNodeRef: setBeforeDropRef,
  } = useDroppable({
    id: `${item.id}-before-drop-zone`,
  })

  // Drop zone for inserting after
  const {
    isOver: isAfterDropOver,
    setNodeRef: setAfterDropRef,
  } = useDroppable({
    id: `${item.id}-after-drop-zone`,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

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
    // Navigate to content detail page using slug
    router.push(`/universes/${universeSlug}/content/${item.slug}`)
  }

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  return (
    <div>
      {/* Drop zone before item */}
      <div
        ref={setBeforeDropRef}
        className={`h-2 transition-colors ${
          isBeforeDropOver ? 'bg-blue-200 rounded' : ''
        }`}
        style={{ marginLeft: `${paddingLeft + 8}px` }}
      />

      {/* Full-width droppable container */}
      <div
        ref={setItemDropRef}
        className={`w-full ${
          isItemDropOver ? 'bg-green-50 border-2 border-green-300 border-dashed rounded' : ''
        }`}
      >
        <div
          ref={setDragRef}
          className={`flex items-center gap-2 p-2 rounded transition-colors border-2 border-transparent ${
            bulkSelection?.isSelectionMode && bulkSelection.selectedItems.has(item.id)
              ? 'bg-blue-50 border-blue-200'
              : 'hover:bg-gray-50'
          } ${bulkSelection?.isSelectionMode ? 'cursor-pointer' : ''}`}
          style={{ paddingLeft: `${paddingLeft + 8}px`, ...style }}
          onClick={bulkSelection?.isSelectionMode ? () => bulkSelection.toggleSelection(item.id) : undefined}
        >
          {/* Selection checkbox - only show in selection mode */}
          {bulkSelection?.isSelectionMode && (
            <input
              type="checkbox"
              checked={bulkSelection.selectedItems.has(item.id)}
              onChange={() => {}} // Empty handler since parent handles click
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 pointer-events-none"
            />
          )}
          
          {/* Drag handle - hide in selection mode */}
          {!bulkSelection?.isSelectionMode && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
              title="Drag to reorder"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </div>
          )}

        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering selection
              handleChevronClick(e)
            }}
            className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        
        <span className="text-lg">{getItemIcon(item.item_type)}</span>
        
        <div 
          className={`flex-1 min-w-0 rounded p-1 -m-1 transition-colors ${
            !bulkSelection?.isSelectionMode 
              ? 'cursor-pointer hover:bg-blue-50' 
              : ''
          }`}
          onClick={!bulkSelection?.isSelectionMode ? handleContentClick : undefined}
          title={!bulkSelection?.isSelectionMode ? "Click to view content page" : undefined}
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

        {/* Action buttons - hide in selection mode */}
        {!bulkSelection?.isSelectionMode && (
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
        )}
        </div>
      </div>

      {/* Drop zone after item */}
      <div
        ref={setAfterDropRef}
        className={`h-2 transition-colors ${
          isAfterDropOver ? 'bg-blue-200 rounded' : ''
        }`}
        style={{ marginLeft: `${paddingLeft + 8}px` }}
      />

      {isExpanded && hasChildren && (
        <div className="ml-4">
          {item.children!.map((child) => (
            <ContentTreeItem
              key={child.id}
              item={child}
              universeId={universeId}
              universeSlug={universeSlug}
              level={level + 1}
              bulkSelection={bulkSelection}
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