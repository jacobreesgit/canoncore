'use client'

import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { ContentItemWithChildren } from '@/types/database'
import { ContentTreeItem } from './content-tree-item'
import { BulkDeleteModal } from './bulk-delete-modal'
import { BulkMoveModal } from './bulk-move-modal'
import { useReorderContentItems } from '@/hooks/use-content-items'
import { useContentListManagement, ListManagementItem } from '@/hooks/use-list-management'
import { ActionButton } from './ui/action-button'

interface ContentTreeProps {
  items: ContentItemWithChildren[]
  universeId: string
  universeSlug: string
  username: string
}

export function ContentTree({ items, universeId, universeSlug, username }: ContentTreeProps) {
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false)
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
    <div>
      {/* Bulk Operations Controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
                onClick={listManagement.selectionActions?.exitSelectionMode}
                variant="info"
                size="sm"
              >
                Cancel Selection
              </ActionButton>
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
            </>
          )}
        </div>
        
        {listManagement.selection?.isSelectionMode && listManagement.selection?.hasSelection && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {listManagement.selection.selectedCount} selected
            </span>
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
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={listManagement.dragDrop?.handleDragEnd}
      >
        <div className="space-y-2">
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
        </div>
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
    </div>
  )
}