'use client'

import { useState } from 'react'
import { useUpdateContentItem } from '@/hooks/use-content-items'
import { useAllContentTypes } from '@/hooks/use-custom-content-types'
import { ContentItem } from '@/types/database'
import { ManageContentTypesModal } from './manage-content-types-modal'

interface EditContentModalProps {
  item: ContentItem
  onClose: () => void
}

export function EditContentModal({ item, onClose }: EditContentModalProps) {
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || '')
  const [itemType, setItemType] = useState<string>(item.item_type)
  const [showManageTypesModal, setShowManageTypesModal] = useState(false)
  
  const updateContentItem = useUpdateContentItem()
  const { data: allContentTypes, isLoading: typesLoading } = useAllContentTypes(item.universe_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await updateContentItem.mutateAsync({
        id: item.id,
        title: title.trim(),
        description: description.trim() || undefined,
        item_type: itemType,
      })
      onClose()
    } catch (error) {
      console.error('Failed to update content item:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Content Item</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              placeholder="e.g. Iron Man, Season 1, Chapter 5"
              required
            />
          </div>

          <div>
            <label htmlFor="item-type" className="block text-sm font-medium mb-1">
              Type *
            </label>
            <div className="flex gap-2">
              <select
                id="item-type"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                disabled={typesLoading}
              >
                {allContentTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.emoji} {type.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowManageTypesModal(true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                title="Manage content types"
              >
                ⚙️
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              placeholder="Brief description..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!title.trim() || updateContentItem.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {updateContentItem.isPending ? 'Updating...' : 'Update Item'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      
      {showManageTypesModal && (
        <ManageContentTypesModal
          universeId={item.universe_id}
          onClose={() => {
            setShowManageTypesModal(false)
            // Keep current selection if valid, otherwise reset to first available type
            if (allContentTypes && !allContentTypes.find(type => type.id === itemType)) {
              if (allContentTypes.length > 0) {
                setItemType(allContentTypes[0].id)
              }
            }
          }}
        />
      )}
    </div>
  )
}