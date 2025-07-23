'use client'

import { useState } from 'react'
import { useCreateContentItem } from '@/hooks/use-content-items'
import { ContentItem } from '@/types/database'

interface CreateContentModalProps {
  universeId: string
  parentId?: string
  onClose: () => void
}

const contentTypes: { value: ContentItem['item_type']; label: string; emoji: string }[] = [
  { value: 'film', label: 'Film', emoji: '🎬' },
  { value: 'series', label: 'Series', emoji: '📺' },
  { value: 'season', label: 'Season', emoji: '📀' },
  { value: 'episode', label: 'Episode', emoji: '▶️' },
  { value: 'book', label: 'Book', emoji: '📚' },
  { value: 'character', label: 'Character', emoji: '👤' },
  { value: 'location', label: 'Location', emoji: '🗺️' },
  { value: 'event', label: 'Event', emoji: '⚡' },
  { value: 'documentary', label: 'Documentary', emoji: '🎥' },
  { value: 'short', label: 'Short', emoji: '🎞️' },
  { value: 'special', label: 'Special', emoji: '⭐' },
  { value: 'collection', label: 'Collection', emoji: '📦' },
]

export function CreateContentModal({ universeId, parentId, onClose }: CreateContentModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [itemType, setItemType] = useState<ContentItem['item_type']>('film')
  const createContentItem = useCreateContentItem()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await createContentItem.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        item_type: itemType,
        universe_id: universeId,
        parent_id: parentId,
      })
      onClose()
    } catch (error) {
      console.error('Failed to create content item:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {parentId ? 'Add Child Content' : 'Add Content Item'}
        </h2>
        
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. Iron Man, Season 1, Chapter 5"
              required
            />
          </div>

          <div>
            <label htmlFor="item-type" className="block text-sm font-medium mb-1">
              Type *
            </label>
            <select
              id="item-type"
              value={itemType}
              onChange={(e) => setItemType(e.target.value as ContentItem['item_type'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Brief description..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!title.trim() || createContentItem.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {createContentItem.isPending ? 'Creating...' : 'Create Item'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}