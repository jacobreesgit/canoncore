'use client'

import { useState } from 'react'
import { Card, VStack, SectionHeader, ActionButton, Badge, LoadingPlaceholder } from '@/components/ui'
import { useContentLinks, getRelationshipDisplay, useRelationshipTypes } from '@/hooks/use-content-links'
import { CreateRelationshipModal, EditRelationshipModal } from '@/components/content'
import Link from 'next/link'
import { getOrganisationTypeName } from '@/lib/page-utils'
import type { ContentLinkWithItems } from '@/hooks/use-content-links'

interface RelationshipsCardProps {
  contentItemId: string
  universeId: string
  username: string
  universeSlug: string
  title?: string
}

export function RelationshipsCard({ 
  contentItemId, 
  universeId,
  username,
  universeSlug,
  title = "Relationships" 
}: RelationshipsCardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingLink, setEditingLink] = useState<ContentLinkWithItems | null>(null)
  
  const { data: relationships, isLoading, error } = useContentLinks(contentItemId)
  const { data: relationshipTypes } = useRelationshipTypes(universeId)

  const getRelationshipTypeLabel = (linkType: string) => {
    return relationshipTypes?.find(type => type.value === linkType)?.label || linkType
  }

  if (isLoading) {
    return (
      <Card>
        <VStack spacing="md">
          <SectionHeader title={title} level={3} />
          <LoadingPlaceholder title="Loading relationships..." />
        </VStack>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <VStack spacing="md">
          <SectionHeader title={title} level={3} />
          <p className="text-red-600">Failed to load relationships</p>
        </VStack>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <VStack spacing="md">
          <SectionHeader 
            title={title} 
            level={3}
            actions={
              <ActionButton
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                size="sm"
              >
                Add Relationship
              </ActionButton>
            }
          />
          
          {relationships && relationships.length > 0 ? (
            <>
              <div className="space-y-2">
                {relationships.map((link) => {
                  const display = getRelationshipDisplay(link, contentItemId, relationshipTypes)
                  
                  return (
                    <Link
                      key={link.id}
                      href={`/${username}/${universeSlug}/content/${display.relatedItem.slug}`}
                      className="block p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="secondary">
                              {display.displayLabel}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {display.direction === 'outgoing' ? '→' : '←'}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm">
                            {display.relatedItem.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {getOrganisationTypeName(display.relatedItem.item_type)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-3">No relationships yet</p>
              <ActionButton
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                size="sm"
              >
                Add First Relationship
              </ActionButton>
            </div>
          )}
        </VStack>
      </Card>

      {showCreateModal && (
        <CreateRelationshipModal
          fromItemId={contentItemId}
          universeId={universeId}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingLink && (
        <EditRelationshipModal
          relationship={editingLink}
          onClose={() => setEditingLink(null)}
        />
      )}
    </>
  )
}