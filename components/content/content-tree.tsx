'use client'

import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { ContentItemWithChildren } from '@/types/database'
import { ContentTreeItem } from './content-tree-item'
import { CreateContentModal } from './create-content-modal'
import { BulkDeleteModal, BulkMoveModal } from '@/components/modals'
import { useReorderContentItems } from '@/hooks/use-content-items'
import { useContentListManagement, ListManagementItem } from '@/hooks/use-list-management'
import { ActionButton } from '@/components/ui'
import { VStack, HStack } from '@/components/ui'

interface ContentTreeProps {
  items: ContentItemWithChildren[]
  universeId: string
  universeSlug: string
  username: string
  renderSelectionControls?: (selectionActions: any, isSelectionMode: boolean) => React.ReactNode
}

export function ContentTree({ items, universeId, universeSlug, username, renderSelectionControls }: ContentTreeProps) {
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false)
  const [showCreateParentModal, setShowCreateParentModal] = useState(false)
  const reorderMutation = useReorderContentItems()
  
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
      initialViewMode: 'tree',
    }
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  return (
    <VStack spacing="md">
      {/* Custom selection controls render */}
      {renderSelectionControls && renderSelectionControls(
        listManagement.selectionActions,
        listManagement.selection?.isSelectionMode || false
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={listManagement.dragDrop?.handleDragEnd}
      >
        <VStack spacing="sm">
          {items.map((item) => (
            <ContentTreeItem
              key={item.id}
              item={item}
              universeId={universeId}
              universeSlug={universeSlug}
              username={username}
              level={0}
              selection={{
                selectedItems: listManagement.selection?.selectedItems || new Set(),
                isSelectionMode: listManagement.selection?.isSelectionMode || false,
                toggleSelection: listManagement.selectionActions?.toggleSelection || (() => {}),
              }}
            />
          ))}
        </VStack>
      </DndContext>
      
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
    </VStack>
  )
}