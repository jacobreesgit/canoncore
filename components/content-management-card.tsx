'use client'

import { useState } from 'react'
import { useAllContentTypes } from '@/hooks/use-custom-content-types'
import { useCustomContentTypes, useDeleteCustomContentType } from '@/hooks/use-custom-content-types'
import { useDisabledContentTypes, useDisableContentType, useEnableContentType } from '@/hooks/use-disabled-content-types'
import { CustomContentTypeModal } from './custom-content-type-modal'

interface ContentManagementCardProps {
  universeId: string
}

const BUILT_IN_TYPES = [
  { id: 'collection', name: 'Collection', emoji: '📦' },
  { id: 'serial', name: 'Serial', emoji: '📽️' },
  { id: 'story', name: 'Story', emoji: '📖' },
]

export function ContentManagementCard({ universeId }: ContentManagementCardProps) {
  const [showCreateCustomType, setShowCreateCustomType] = useState(false)
  const [editingType, setEditingType] = useState<any>(null)

  const { data: customTypes = [] } = useCustomContentTypes(universeId)
  const { data: disabledTypes = [] } = useDisabledContentTypes(universeId)
  const deleteCustomTypeMutation = useDeleteCustomContentType()
  const disableTypeMutation = useDisableContentType()
  const enableTypeMutation = useEnableContentType()

  const isTypeDisabled = (typeId: string) => {
    return disabledTypes.some(disabled => disabled.content_type === typeId)
  }

  const handleToggleBuiltInType = async (typeId: string) => {
    const isDisabled = isTypeDisabled(typeId)
    
    try {
      if (isDisabled) {
        await enableTypeMutation.mutateAsync({ universeId, contentType: typeId })
      } else {
        await disableTypeMutation.mutateAsync({ universeId, contentType: typeId })
      }
    } catch (error) {
      console.error('Failed to toggle type:', error)
    }
  }

  const handleDeleteCustomType = async (typeId: string, typeName: string) => {
    if (!confirm(`Are you sure you want to delete the "${typeName}" content type?`)) {
      return
    }

    try {
      await deleteCustomTypeMutation.mutateAsync({ id: typeId, universeId })
    } catch (error) {
      console.error('Failed to delete custom type:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Content Types</h2>
        <button
          onClick={() => setShowCreateCustomType(true)}
          className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
        >
          Add Custom Type
        </button>
      </div>

      {/* Built-in Types */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Built-in Types</h3>
        <div className="space-y-2">
          {BUILT_IN_TYPES.map((type) => {
            const disabled = isTypeDisabled(type.id)
            return (
              <div
                key={type.id}
                className={`flex items-center justify-between p-2 rounded border text-sm ${
                  disabled ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{type.emoji}</span>
                  <span className={disabled ? 'text-red-700' : 'text-green-700'}>
                    {type.name}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleBuiltInType(type.id)}
                  disabled={disableTypeMutation.isPending || enableTypeMutation.isPending}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    disabled
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {disabled ? 'Enable' : 'Disable'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Custom Types */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Custom Types ({customTypes.length})
        </h3>
        {customTypes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No custom types created yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between p-2 rounded border border-blue-200 bg-blue-50 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{type.emoji}</span>
                  <span className="text-blue-700">{type.name}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingType(type)}
                    className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCustomType(type.id, type.name)}
                    disabled={deleteCustomTypeMutation.isPending}
                    className="px-2 py-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateCustomType && (
        <CustomContentTypeModal
          universeId={universeId}
          onClose={() => setShowCreateCustomType(false)}
        />
      )}

      {editingType && (
        <CustomContentTypeModal
          universeId={universeId}
          onClose={() => setEditingType(null)}
          editingType={editingType}
        />
      )}
    </div>
  )
}