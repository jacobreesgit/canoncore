'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ContentItemWithChildren } from '@/types/database'
import { CreateContentModal } from './create-content-modal'
import { EditContentModal } from './edit-content-modal'
import { DeleteContentModal } from './delete-content-modal'
import { useAllContentTypes } from '@/hooks/use-custom-content-types'
import { useContentVersionCount } from '@/hooks/use-content-versions'
import { IconButton, EditIcon, DeleteIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon, DragHandleIcon } from './ui/icon-button'
import { VersionBadge, TypeBadge } from './ui'

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
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAddChild, setShowAddChild] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: allContentTypes } = useAllContentTypes(universeId)
  const { data: versionCount = 0 } = useContentVersionCount(item.id)
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

  const contentUrl = `/universes/${universeSlug}/content/${item.slug}`

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
              : 'hover:bg-blue-50'
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
              <DragHandleIcon />
            </div>
          )}

        {hasChildren && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering selection
              handleChevronClick(e)
            }}
            className="w-4 h-4 flex items-center justify-center"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
          </IconButton>
        )}
        {!hasChildren && <div className="w-4" />}
        
        <span className="text-lg">{getItemIcon(item.item_type)}</span>
        
        {!bulkSelection?.isSelectionMode ? (
          <Link 
            href={contentUrl}
            className="flex-1 min-w-0 block"
            title="Click to view content page (right-click for new tab)"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{item.title}</span>
              <TypeBadge type={getItemTypeName(item.item_type)} />
              <VersionBadge count={versionCount} />
            </div>
            {item.description && (
              <div className="text-sm text-gray-600 truncate mt-1">
                {item.description}
              </div>
            )}
          </Link>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{item.title}</span>
              <TypeBadge type={getItemTypeName(item.item_type)} />
              <VersionBadge count={versionCount} />
            </div>
            {item.description && (
              <div className="text-sm text-gray-600 truncate mt-1">
                {item.description}
              </div>
            )}
          </div>
        )}

        {/* Action buttons - hide in selection mode */}
        {!bulkSelection?.isSelectionMode && (
          <div className="flex items-center gap-1">
            <IconButton
              onClick={(e) => handleButtonClick(e, () => setShowEditModal(true))}
              variant="primary"
              aria-label={`Edit ${getItemTypeName(item.item_type).toLowerCase()}`}
              title={`Edit ${getItemTypeName(item.item_type).toLowerCase()}`}
            >
              <EditIcon className="w-3 h-3" />
            </IconButton>
            <IconButton
              onClick={(e) => handleButtonClick(e, () => setShowDeleteModal(true))}
              variant="danger"
              aria-label={`Delete ${getItemTypeName(item.item_type).toLowerCase()}`}
              title={`Delete ${getItemTypeName(item.item_type).toLowerCase()}`}
            >
              <DeleteIcon className="w-3 h-3" />
            </IconButton>
            <IconButton
              onClick={(e) => handleButtonClick(e, () => setShowAddChild(true))}
              variant="success"
              className="text-xs px-2 py-1"
              aria-label="Add child item"
            >
              <span className="flex items-center gap-1">
                <PlusIcon className="w-3 h-3" />
                <span>Add Child</span>
              </span>
            </IconButton>
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