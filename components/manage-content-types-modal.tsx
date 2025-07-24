'use client'

import { useState } from 'react'
import { BUILT_IN_CONTENT_TYPES, useCustomContentTypes } from '@/hooks/use-custom-content-types'
import { useDisableContentType, useEnableContentType, useDisabledContentTypes } from '@/hooks/use-disabled-content-types'
import { CustomContentType } from '@/types/database'
import { CustomContentTypeModal } from './custom-content-type-modal'
import { BaseModal } from './ui'

interface ManageContentTypesModalProps {
  universeId: string
  onClose: () => void
}

export function ManageContentTypesModal({ universeId, onClose }: ManageContentTypesModalProps) {
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false)
  const [editingCustomType, setEditingCustomType] = useState<CustomContentType | undefined>()
  
  const customTypesQuery = useCustomContentTypes(universeId)
  const disabledTypesQuery = useDisabledContentTypes(universeId)
  const disableType = useDisableContentType()
  const enableType = useEnableContentType()
  
  const handleToggleBuiltInType = async (typeId: string) => {
    const isDisabled = disabledTypesQuery.data?.some(dt => dt.content_type === typeId)
    
    try {
      if (isDisabled) {
        await enableType.mutateAsync({ universeId, contentType: typeId })
      } else {
        await disableType.mutateAsync({ universeId, contentType: typeId })
      }
    } catch (error) {
      console.error('Failed to toggle content type:', error)
    }
  }
  
  const handleEditCustomType = (type: CustomContentType) => {
    setEditingCustomType(type)
    setShowCustomTypeModal(true)
  }
  
  const handleCreateCustomType = () => {
    setEditingCustomType(undefined)
    setShowCustomTypeModal(true)
  }
  
  const isLoading = disableType.isPending || enableType.isPending

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Manage Content Types"
      showCloseButton={true}
      size="xl"
    >
      <div className="max-h-[60vh] overflow-y-auto">{/* Added scroll container */}
        
        <div className="space-y-6">
          {/* Built-in Content Types */}
          <div>
            <h3 className="text-lg font-medium mb-3">Built-in Content Types</h3>
            <p className="text-sm text-gray-600 mb-4">
              Toggle built-in content types on/off for this universe. Disabled types won't appear in content creation.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUILT_IN_CONTENT_TYPES.slice().sort((a, b) => a.name.localeCompare(b.name)).map((type) => {
                const isDisabled = disabledTypesQuery.data?.some(dt => dt.content_type === type.id)
                
                return (
                  <div
                    key={type.id}
                    className={`p-3 border rounded-lg flex items-center justify-between transition-colors ${
                      isDisabled 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-green-200 bg-green-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.emoji}</span>
                      <span className={`font-medium ${isDisabled ? 'text-red-700' : 'text-green-700'}`}>
                        {type.name}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleToggleBuiltInType(type.id)}
                      disabled={isLoading}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isDisabled
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      } disabled:bg-gray-400`}
                    >
                      {isDisabled ? 'Enable' : 'Disable'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Custom Content Types */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Custom Content Types</h3>
              <button
                onClick={handleCreateCustomType}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
              >
                + Create Custom Type
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Custom content types created specifically for this universe.
            </p>
            
            {customTypesQuery.data && customTypesQuery.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customTypesQuery.data.slice().sort((a, b) => a.name.localeCompare(b.name)).map((type) => (
                  <div
                    key={type.id}
                    className="p-3 border border-blue-200 bg-blue-50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.emoji}</span>
                      <span className="font-medium text-blue-700">{type.name}</span>
                    </div>
                    
                    <button
                      onClick={() => handleEditCustomType(type)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No custom content types created yet.</p>
                <p className="text-sm">Click "Create Custom Type" to add your own.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
      
      {showCustomTypeModal && (
        <CustomContentTypeModal
          universeId={universeId}
          editingType={editingCustomType}
          onClose={() => {
            setShowCustomTypeModal(false)
            setEditingCustomType(undefined)
          }}
        />
      )}
    </BaseModal>
  )
}