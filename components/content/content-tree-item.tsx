'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ContentItemWithChildren } from '@/types/database'
import { CreateContentModal } from './create-content-modal'
import { EditContentModal } from './edit-content-modal'
import { DeleteContentModal } from './delete-content-modal'
import { useAllOrganisationTypes } from '@/hooks/use-custom-organisation-types'
import { useContentVersionCount } from '@/hooks/use-content-versions'
import { IconButton, EditIcon, DeleteIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon, DragHandleIcon, VersionBadge, TypeBadge, HStack, VStack } from '@/components/ui'
import { RelationshipBadge } from './relationship-badge'
import { PlacementBadge } from './placement-badge'

interface ContentTreeItemProps {
  item: ContentItemWithChildren
  universeId: string
  universeSlug: string
  username: string
  level: number
  fromPublic?: boolean
  selection?: {
    selectedItems: Set<string>
    isSelectionMode: boolean
    toggleSelection: (itemId: string) => void
  }
}

export function ContentTreeItem({ item, universeId, universeSlug, username, level, fromPublic, selection }: ContentTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAddChild, setShowAddChild] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: allOrganisationTypes } = useAllOrganisationTypes(universeId)
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

  
  const getItemTypeName = (itemType: string) => {
    // First, check if it's a custom type
    const customType = allOrganisationTypes?.find(type => type.id === itemType)
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

  const contentUrl = `/${username}/${universeSlug}/content/${item.slug}${fromPublic ? '?from=public' : ''}`

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
            selection?.isSelectionMode && selection.selectedItems.has(item.id)
              ? 'bg-blue-50 border-blue-200'
              : 'hover:bg-blue-50'
          } ${selection?.isSelectionMode ? 'cursor-pointer' : ''}`}
          style={{ paddingLeft: `${paddingLeft + 8}px`, ...style }}
          onClick={selection?.isSelectionMode ? () => selection.toggleSelection(item.id) : undefined}
        >
          {/* Selection checkbox - only show in selection mode */}
          {selection?.isSelectionMode && (
            <div className="w-6 h-6 flex items-center justify-center">
              <input
                type="checkbox"
                checked={selection.selectedItems.has(item.id)}
                onChange={() => {}} // Empty handler since parent handles click
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 pointer-events-none"
              />
            </div>
          )}
          
          {/* Drag handle - hide in selection mode */}
          {!selection?.isSelectionMode && (
            <div className="w-6 h-6 flex items-center justify-center">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
                title="Drag to reorder"
              >
                <DragHandleIcon />
              </div>
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
        
        
        {!selection?.isSelectionMode ? (
          <Link 
            href={contentUrl}
            className="flex-1 min-w-0 block"
            title="Click to view content page (right-click for new tab)"
          >
            <VStack spacing="xs">
              <HStack spacing="sm" align="center">
                <span className="font-medium truncate">{item.title}</span>
                <TypeBadge type={getItemTypeName(item.item_type)} />
                <VersionBadge count={versionCount} />
                <RelationshipBadge contentItemId={item.id} />
                <PlacementBadge placementCount={item.placementCount} />
              </HStack>
              {item.description && (
                <div className="text-sm text-gray-600 truncate">
                  {item.description}
                </div>
              )}
            </VStack>
          </Link>
        ) : (
          <div className="flex-1 min-w-0">
            <VStack spacing="xs">
              <HStack spacing="sm" align="center">
                <span className="font-medium truncate">{item.title}</span>
                <TypeBadge type={getItemTypeName(item.item_type)} />
                <VersionBadge count={versionCount} />
                <RelationshipBadge contentItemId={item.id} />
                <PlacementBadge placementCount={item.placementCount} />
              </HStack>
              {item.description && (
                <div className="text-sm text-gray-600 truncate">
                  {item.description}
                </div>
              )}
            </VStack>
          </div>
        )}

        {/* Action buttons - hide in selection mode */}
        {!selection?.isSelectionMode && (
          <HStack spacing="xs">
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
              <HStack spacing="xs" align="center">
                <PlusIcon className="w-3 h-3" />
                <span>Add Child</span>
              </HStack>
            </IconButton>
          </HStack>
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
              username={username}
              level={level + 1}
              fromPublic={fromPublic}
              selection={selection}
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