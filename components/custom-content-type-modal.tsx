'use client'

import { useState } from 'react'
import { useCreateCustomContentType, useUpdateCustomContentType, useDeleteCustomContentType } from '@/hooks/use-custom-content-types'
import { CustomContentType } from '@/types/database'

interface CustomContentTypeModalProps {
  universeId: string
  onClose: () => void
  editingType?: CustomContentType
}

// Common emoji options for content types
const COMMON_EMOJIS = [
  '📄', '📝', '📖', '📚', '📰', '📋', '📊', '📈', '📉', '📌',
  '🎬', '🎥', '🎞️', '📺', '📻', '🎵', '🎶', '🎤', '🎧', '🎮',
  '🏆', '🎯', '🎨', '🖼️', '🎭', '🎪', '🎫', '🎟️', '🎲', '♠️',
  '👤', '👥', '👑', '🏠', '🏢', '🏛️', '🌍', '🌎', '🌏', '📍',
  '⚡', '🔥', '💡', '🔬', '🔭', '🧪', '💎', '🔑', '🗝️', '🎁',
  '📦', '📁', '🗂️', '🗃️', '🗄️', '📂', '🗓️', '📅', '📇', '📈'
]

export function CustomContentTypeModal({ universeId, onClose, editingType }: CustomContentTypeModalProps) {
  const [name, setName] = useState(editingType?.name || '')
  const [emoji, setEmoji] = useState(editingType?.emoji || '📄')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const createType = useCreateCustomContentType()
  const updateType = useUpdateCustomContentType()
  const deleteType = useDeleteCustomContentType()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) return
    
    try {
      if (editingType) {
        await updateType.mutateAsync({
          id: editingType.id,
          name: name.trim(),
          emoji,
        })
      } else {
        await createType.mutateAsync({
          name: name.trim(),
          emoji,
          universeId,
        })
      }
      onClose()
    } catch (error) {
      console.error('Failed to save custom content type:', error)
    }
  }
  
  const handleDelete = async () => {
    if (!editingType) return
    
    if (confirm(`Are you sure you want to delete the "${editingType.name}" content type? This action cannot be undone.`)) {
      try {
        await deleteType.mutateAsync({
          id: editingType.id,
          universeId: editingType.universe_id,
        })
        onClose()
      } catch (error) {
        console.error('Failed to delete custom content type:', error)
      }
    }
  }
  
  const isLoading = createType.isPending || updateType.isPending || deleteType.isPending

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {editingType ? 'Edit Custom Content Type' : 'Create Custom Content Type'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Video Game, Comic Book, Podcast"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emoji
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-2xl hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                {emoji}
              </button>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="📄"
                disabled={isLoading}
              />
            </div>
            
            {showEmojiPicker && (
              <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 max-h-32 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                  {COMMON_EMOJIS.map((emojiOption) => (
                    <button
                      key={emojiOption}
                      type="button"
                      onClick={() => {
                        setEmoji(emojiOption)
                        setShowEmojiPicker(false)
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                      disabled={isLoading}
                    >
                      {emojiOption}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            {editingType && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
              >
                {deleteType.isPending ? 'Deleting...' : 'Delete'}
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {isLoading 
                ? (editingType ? 'Updating...' : 'Creating...') 
                : (editingType ? 'Update Type' : 'Create Type')
              }
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}