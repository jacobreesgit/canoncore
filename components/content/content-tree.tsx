'use client'

import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { ContentItemWithChildren } from '@/types/database'
import { ContentTreeItem } from './content-tree-item'
import { CreateContentModal } from './create-content-modal'
import { BulkDeleteModal, BulkMoveModal } from '@/components/modals'
import { useReorderContentItems } from '@/hooks/use-content-items'
import { useContentListManagement, ListManagementItem } from '@/hooks/use-list-management'
import { ActionButton, ViewToggle, VStack, HStack, TypeBadge, VersionBadge, IconButton, EditIcon, DeleteIcon, PlusIcon, HeaderTitle, Checkbox } from '@/components/ui'
import { ErrorBoundary } from '@/components/error'
import { PlacementBadge } from './placement-badge'
import { RelationshipBadge } from './relationship-badge'
import { useAllOrganisationTypes } from '@/hooks/use-custom-organisation-types'
import { useContentVersionCount } from '@/hooks/use-content-versions'
import { EditContentModal } from './edit-content-modal'
import { DeleteContentModal } from './delete-content-modal'
import Link from 'next/link'

// Helper component for version badge in card view
function ContentVersionBadge({ contentItemId }: { contentItemId: string }) {
  const { data: versionCount = 0 } = useContentVersionCount(contentItemId)
  return versionCount > 1 ? <VersionBadge count={versionCount} /> : null
}

// Helper component for content card with full functionality
function ContentCard({ 
  item, 
  universeId, 
  universeSlug, 
  username, 
  allOrganisationTypes,
  selection,
  onEditItem,
  onDeleteItem,
  onAddChild
}: {
  item: ContentItemWithChildren
  universeId: string
  universeSlug: string
  username: string
  allOrganisationTypes: Array<{ id: string; name: string } | { readonly id: string; readonly name: string }> | undefined
  selection?: {
    selectedItems: Set<string>
    isSelectionMode: boolean
    toggleSelection: (itemId: string) => void
  }
  onEditItem: (item: ContentItemWithChildren) => void
  onDeleteItem: (item: ContentItemWithChildren) => void
  onAddChild: (item: ContentItemWithChildren) => void
}) {
  const getItemTypeName = (type: string) => {
    const foundType = allOrganisationTypes?.find(t => t.id === type)
    return foundType?.name || 'Item'
  }

  return (
    <div
      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
        selection?.isSelectionMode && selection.selectedItems.has(item.id)
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300'
      } ${selection?.isSelectionMode ? 'cursor-pointer' : ''}`}
      onClick={selection?.isSelectionMode ? () => selection.toggleSelection(item.id) : undefined}
    >
      <VStack spacing="sm">
        {/* Title with checkbox */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {selection?.isSelectionMode && (
              <Checkbox
                checked={selection.selectedItems.has(item.id)}
                onChange={() => {}}
                size="md"
                className="pointer-events-none"
              />
            )}
            <div className="flex-1 min-w-0">
              {!selection?.isSelectionMode ? (
                <Link 
                  href={`/${username}/${universeSlug}/content/${item.id}`}
                  className="block hover:text-blue-600 transition-colors"
                >
                  <HeaderTitle level={3} className="font-medium text-gray-900 truncate">{item.title}</HeaderTitle>
                </Link>
              ) : (
                <HeaderTitle level={3} className="font-medium text-gray-900 truncate">{item.title}</HeaderTitle>
              )}
            </div>
          </div>
          
          {/* Action buttons - hide in selection mode */}
          {!selection?.isSelectionMode && (
            <HStack spacing="xs">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  onEditItem(item)
                }}
                variant="primary"
                aria-label={`Edit ${getItemTypeName(item.item_type).toLowerCase()}`}
                title={`Edit ${getItemTypeName(item.item_type).toLowerCase()}`}
              >
                <EditIcon className="w-3 h-3" />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteItem(item)
                }}
                variant="danger"
                aria-label={`Delete ${getItemTypeName(item.item_type).toLowerCase()}`}
                title={`Delete ${getItemTypeName(item.item_type).toLowerCase()}`}
              >
                <DeleteIcon className="w-3 h-3" />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  onAddChild(item)
                }}
                variant="success"
                aria-label="Add child item"
                title="Add child item"
              >
                <PlusIcon className="w-3 h-3" />
              </IconButton>
            </HStack>
          )}
        </div>
        
        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        )}
        
        {/* Badges */}
        <HStack spacing="xs" className="flex-wrap">
          <TypeBadge 
            type={getItemTypeName(item.item_type)} 
          />
          {item.placementCount && item.placementCount > 1 && (
            <PlacementBadge placementCount={item.placementCount} />
          )}
          <ContentVersionBadge contentItemId={item.id} />
          <RelationshipBadge contentItemId={item.id} />
        </HStack>
        
        {/* Child count if any */}
        {item.children && item.children.length > 0 && (
          <div className="text-xs text-gray-500">
            {item.children.length} child{item.children.length !== 1 ? 'ren' : ''}
          </div>
        )}
      </VStack>
    </div>
  )
}

interface ContentTreeProps {
  items: ContentItemWithChildren[]
  universeId: string
  universeSlug: string
  username: string
  fromPublic?: boolean
  renderSelectionControls?: (selectionActions: any, isSelectionMode: boolean, viewToggle?: React.ReactNode) => React.ReactNode
  showViewToggle?: boolean
  defaultViewMode?: 'tree' | 'flat'
}

export function ContentTree({ 
  items, 
  universeId, 
  universeSlug, 
  username, 
  fromPublic,
  renderSelectionControls,
  showViewToggle = true,
  defaultViewMode = 'tree'
}: ContentTreeProps) {
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false)
  const [showCreateParentModal, setShowCreateParentModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentItemWithChildren | null>(null)
  const reorderMutation = useReorderContentItems()
  
  // Data for card view
  const { data: allOrganisationTypes } = useAllOrganisationTypes(universeId)
  
  // Modal handlers
  const handleEditItem = (item: ContentItemWithChildren) => {
    setSelectedItem(item)
    setShowEditModal(true)
  }
  
  const handleDeleteItem = (item: ContentItemWithChildren) => {
    setSelectedItem(item)
    setShowDeleteModal(true)
  }
  
  const handleAddChild = (item: ContentItemWithChildren) => {
    setSelectedItem(item)
    setShowAddChildModal(true)
  }
  
  // Convert items to ListManagementItem format
  const managementItems = items.map(item => ({
    ...item,
    order_index: item.order_index,
  } as ListManagementItem))
  
  // Use list management with drag & drop and bulk operations
  const listManagement = useContentListManagement(
    managementItems,
    async (updates) => {
      await reorderMutation.mutateAsync({ universeId, updates })
    },
    {
      enableBulkOperations: true,
      initialViewMode: defaultViewMode,
    }
  )

  // Filter items based on view mode - card mode shows only direct descendants
  const displayItems = listManagement.viewMode === 'card' 
    ? items // Show only top-level items (direct descendants)
    : items // Show full tree structure

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Create view toggle component
  const viewToggle = showViewToggle ? (
    <ViewToggle
      currentView={listManagement.viewMode}
      onViewChange={listManagement.setViewMode}
      availableViews={['tree', 'card']}
    />
  ) : undefined

  return (
    <VStack spacing="md">
      {/* Custom selection controls render */}
      {renderSelectionControls && renderSelectionControls(
        listManagement.selectionActions,
        listManagement.selection?.isSelectionMode || false,
        viewToggle
      )}
      
      {/* Bulk operation buttons when in selection mode with custom render */}
      {renderSelectionControls && listManagement.selection?.isSelectionMode && listManagement.selection?.hasSelection && (
        <div className="w-full flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {listManagement.selection.selectedCount} selected
          </span>
          <div className="flex space-x-2">
            <ActionButton
              onClick={() => setShowCreateParentModal(true)}
              variant="primary"
              size="sm"
            >
              Wrap in Parent
            </ActionButton>
            <ActionButton
              onClick={() => setShowBulkMoveModal(true)}
              variant="success"
              size="sm"
            >
              Move Selected
            </ActionButton>
            <ActionButton
              onClick={() => setShowBulkDeleteModal(true)}
              variant="danger"
              size="sm"
            >
              Delete Selected
            </ActionButton>
          </div>
        </div>
      )}
      
      {/* Bulk Operations Controls - only show if not using custom render */}
      {!renderSelectionControls && (
        <HStack justify="between" align="center">
          <div /> {/* Empty space on left */}
          
          <HStack spacing="sm">
            {!listManagement.selection?.isSelectionMode ? (
              <ActionButton
                onClick={listManagement.selectionActions?.enterSelectionMode}
                variant="primary"
                size="sm"
              >
                Select
              </ActionButton>
            ) : (
              <>
                <ActionButton
                  onClick={listManagement.selectionActions?.selectAll}
                  variant="primary"
                  size="sm"
                >
                  Select All
                </ActionButton>
                <ActionButton
                  onClick={listManagement.selectionActions?.clearSelection}
                  variant="info"
                  size="sm"
                >
                  Clear All
                </ActionButton>
                <ActionButton
                  onClick={listManagement.selectionActions?.exitSelectionMode}
                  variant="info"
                  size="sm"
                >
                  Cancel Selection
                </ActionButton>
              </>
            )}
          </HStack>
        
        {listManagement.selection?.isSelectionMode && listManagement.selection?.hasSelection && (
          <HStack spacing="sm" align="center">
            <span className="text-sm text-gray-600">
              {listManagement.selection.selectedCount} selected
            </span>
            <ActionButton
              onClick={() => setShowCreateParentModal(true)}
              variant="primary"
              size="sm"
            >
              Wrap in Parent
            </ActionButton>
            <ActionButton
              onClick={() => setShowBulkMoveModal(true)}
              variant="success"
              size="sm"
            >
              Move Selected
            </ActionButton>
            <ActionButton
              onClick={() => setShowBulkDeleteModal(true)}
              variant="danger"
              size="sm"
            >
              Delete Selected
            </ActionButton>
          </HStack>
        )}
      </HStack>
      )}

      <ErrorBoundary level="section" isolate>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={listManagement.dragDrop?.handleDragEnd}
        >
          {listManagement.viewMode === 'card' ? (
            // Card layout - show items as cards without tree structure
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayItems.map((item) => (
                <ErrorBoundary key={item.id} level="component" isolate>
                  <ContentCard
                    item={item}
                    universeId={universeId}
                    universeSlug={universeSlug}
                    username={username}
                    allOrganisationTypes={allOrganisationTypes}
                    selection={{
                      selectedItems: listManagement.selection?.selectedItems || new Set(),
                      isSelectionMode: listManagement.selection?.isSelectionMode || false,
                      toggleSelection: listManagement.selectionActions?.toggleSelection || (() => {}),
                    }}
                    onEditItem={handleEditItem}
                    onDeleteItem={handleDeleteItem}
                    onAddChild={handleAddChild}
                  />
                </ErrorBoundary>
              ))}
            </div>
          ) : (
            // Tree layout - traditional hierarchical view
            <VStack spacing="sm">
              {displayItems.map((item) => (
                <ErrorBoundary key={item.id} level="component" isolate>
                  <ContentTreeItem
                    item={item}
                    universeId={universeId}
                    universeSlug={universeSlug}
                    username={username}
                    level={0}
                    fromPublic={fromPublic}
                    selection={{
                      selectedItems: listManagement.selection?.selectedItems || new Set(),
                      isSelectionMode: listManagement.selection?.isSelectionMode || false,
                      toggleSelection: listManagement.selectionActions?.toggleSelection || (() => {}),
                    }}
                  />
                </ErrorBoundary>
              ))}
            </VStack>
          )}
        </DndContext>
      </ErrorBoundary>
      
      {showBulkMoveModal && listManagement.selectionActions && (
        <BulkMoveModal
          selectedItems={listManagement.selectionActions.getSelectedItems() as ContentItemWithChildren[]}
          allItems={items}
          universeId={universeId}
          onClose={() => setShowBulkMoveModal(false)}
          onComplete={() => {
            listManagement.selectionActions?.exitSelectionMode()
            setShowBulkMoveModal(false)
          }}
        />
      )}
      
      {showCreateParentModal && listManagement.selectionActions && (
        <CreateContentModal
          universeId={universeId}
          selectedItemsToWrap={listManagement.selectionActions.getSelectedItems() as ContentItemWithChildren[]}
          onClose={() => {
            listManagement.selectionActions?.exitSelectionMode()
            setShowCreateParentModal(false)
          }}
        />
      )}
      
      {showBulkDeleteModal && listManagement.selectionActions && (
        <BulkDeleteModal
          selectedItems={listManagement.selectionActions.getSelectedItems() as ContentItemWithChildren[]}
          onClose={() => setShowBulkDeleteModal(false)}
          onComplete={() => {
            listManagement.selectionActions?.exitSelectionMode()
            setShowBulkDeleteModal(false)
          }}
        />
      )}
      
      {/* Individual item modals */}
      {showEditModal && selectedItem && (
        <EditContentModal
          item={selectedItem}
          onClose={() => {
            setShowEditModal(false)
            setSelectedItem(null)
          }}
        />
      )}
      
      {showDeleteModal && selectedItem && (
        <DeleteContentModal
          item={selectedItem}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedItem(null)
          }}
          onSuccess={() => {
            setShowDeleteModal(false)
            setSelectedItem(null)
          }}
        />
      )}
      
      {showAddChildModal && selectedItem && (
        <CreateContentModal
          universeId={universeId}
          parentId={selectedItem.id}
          onClose={() => {
            setShowAddChildModal(false)
            setSelectedItem(null)
          }}
        />
      )}
    </VStack>
  )
}