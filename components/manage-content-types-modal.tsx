'use client'

import { useState } from 'react'
import { BUILT_IN_CONTENT_TYPES, useCustomContentTypes } from '@/hooks/use-custom-content-types'
import { useDisableContentType, useEnableContentType, useDisabledContentTypes } from '@/hooks/use-disabled-content-types'
import { CustomContentType } from '@/types/database'
import { CustomContentTypeModal } from './custom-content-type-modal'
import { BaseModal, VStack, HStack, Grid, GridItem } from './ui'
import { ActionButton } from './ui/action-button'

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
        await disableType.mutateAsync({ 
          universe_id: universeId, 
          content_type: typeId 
        })
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
      <div className="max-h-[60vh] overflow-y-auto">
        <VStack spacing="lg">
          {/* Built-in Content Types */}
          <VStack spacing="md">
            <VStack spacing="sm">
              <h3 className="text-lg font-medium">Built-in Content Types</h3>
              <p className="text-sm text-gray-600">
                Toggle built-in content types on/off for this universe. Disabled types won&apos;t appear in content creation.
              </p>
            </VStack>
            
            <Grid cols={{ base: 1, sm: 2 }} gap="sm">
              {BUILT_IN_CONTENT_TYPES.slice().sort((a, b) => a.name.localeCompare(b.name)).map((type) => {
                const isDisabled = disabledTypesQuery.data?.some(dt => dt.content_type === type.id)
                
                return (
                  <div
                    key={type.id}
                    className={`p-3 border rounded-lg transition-colors ${
                      isDisabled 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-green-200 bg-green-50'
                    }`}
                  >
                    <HStack justify="between" align="center">
                      <span className={`font-medium ${isDisabled ? 'text-red-700' : 'text-green-700'}`}>
                        {type.name}
                      </span>
                      
                      <ActionButton
                        onClick={() => handleToggleBuiltInType(type.id)}
                        disabled={isLoading}
                        variant={isDisabled ? 'danger' : 'success'}
                        size="sm"
                      >
                        {isDisabled ? 'Enable' : 'Disable'}
                      </ActionButton>
                    </HStack>
                  </div>
                )
              })}
            </Grid>
          </VStack>
          
          {/* Custom Content Types */}
          <VStack spacing="md">
            <HStack justify="between" align="center">
              <h3 className="text-lg font-medium">Custom Content Types</h3>
              <ActionButton
                onClick={handleCreateCustomType}
                variant="primary"
                size="sm"
              >
                + Create Custom Type
              </ActionButton>
            </HStack>
            
            <p className="text-sm text-gray-600">
              Custom content types created specifically for this universe.
            </p>
            
            {customTypesQuery.data && customTypesQuery.data.length > 0 ? (
              <Grid cols={{ base: 1, sm: 2 }} gap="sm">
                {customTypesQuery.data.slice().sort((a, b) => a.name.localeCompare(b.name)).map((type) => (
                  <div
                    key={type.id}
                    className="p-3 border border-blue-200 bg-blue-50 rounded-lg"
                  >
                    <HStack justify="between" align="center">
                      <span className="font-medium text-blue-700">{type.name}</span>
                      
                      <ActionButton
                        onClick={() => handleEditCustomType(type)}
                        variant="primary"
                        size="sm"
                      >
                        Edit
                      </ActionButton>
                    </HStack>
                  </div>
                ))}
              </Grid>
            ) : (
              <VStack spacing="sm" align="center" className="py-8 text-gray-500">
                <p>No custom content types created yet.</p>
                <p className="text-sm">Click &quot;Create Custom Type&quot; to add your own.</p>
              </VStack>
            )}
          </VStack>
        </VStack>
        
        <HStack justify="end" className="mt-6">
          <ActionButton
            onClick={onClose}
            variant="secondary"
          >
            Done
          </ActionButton>
        </HStack>
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