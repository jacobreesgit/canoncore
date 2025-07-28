import Link from 'next/link'
import { Universe } from '@/types/database'
import { Card, VStack, HStack, PublicPrivateBadge, Badge, UserAvatar } from '@/components/ui'

interface UniverseCardProps {
  universe: Universe
  hidePublicPrivateBadge?: boolean
  showUserInfo?: {
    user_id: string
    username: string
  }
  selection?: {
    selectedItems: Set<string>
    isSelectionMode: boolean
    toggleSelection: (itemId: string) => void
  }
  showOwnBadge?: boolean
  fromPublic?: boolean
}

export function UniverseCard({ universe, hidePublicPrivateBadge, showUserInfo, selection, showOwnBadge, fromPublic }: UniverseCardProps) {

  return (
    <>
      <Card 
        className={`relative border transition-colors min-h-[200px] flex flex-col ${
          selection?.isSelectionMode && selection.selectedItems.has(universe.id)
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300'
        } ${selection?.isSelectionMode ? 'cursor-pointer' : ''}`}
        onClick={selection?.isSelectionMode ? () => selection.toggleSelection(universe.id) : undefined}
      >
          {!selection?.isSelectionMode ? (
            <Link href={`/${universe.username}/${universe.slug}${fromPublic ? '?from=public' : ''}`} className="block h-full">
              <VStack spacing="md">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold flex-1">{universe.name}</h3>
                  <div className="flex items-center gap-2">
                    {showOwnBadge && (
                      <Badge variant="primary" size="sm">
                        Yours
                      </Badge>
                    )}
                    {!hidePublicPrivateBadge && <PublicPrivateBadge isPublic={universe.is_public} />}
                  </div>
                </div>
                {universe.description && (
                  <p className="text-gray-600 line-clamp-3">
                    {universe.description}
                  </p>
                )}
                {showUserInfo && (
                  <div className="flex items-center space-x-2">
                    <UserAvatar 
                      userId={showUserInfo.user_id}
                      size="sm"
                    />
                    <span className="text-sm text-gray-600">
                      @{showUserInfo.username}
                    </span>
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  Created {new Date(universe.created_at).toLocaleDateString()}
                </div>
              </VStack>
            </Link>
          ) : (
            <div className="h-full flex flex-col">
              <VStack spacing="md" className="flex-1">
                <HStack spacing="sm" align="center">
                  <input
                    type="checkbox"
                    checked={selection.selectedItems.has(universe.id)}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 pointer-events-none"
                  />
                  <div className="flex items-start justify-between flex-1">
                    <h3 className="text-xl font-semibold flex-1">{universe.name}</h3>
                    <div className="flex items-center gap-2">
                      {showOwnBadge && (
                        <Badge variant="primary" size="sm">
                          Yours
                        </Badge>
                      )}
                      {!hidePublicPrivateBadge && <PublicPrivateBadge isPublic={universe.is_public} />}
                    </div>
                  </div>
                </HStack>
                {universe.description && (
                  <p className="text-gray-600 line-clamp-3">
                    {universe.description}
                  </p>
                )}
                {showUserInfo && (
                  <div className="flex items-center space-x-2">
                    <UserAvatar 
                      userId={showUserInfo.user_id}
                      size="sm"
                    />
                    <span className="text-sm text-gray-600">
                      @{showUserInfo.username}
                    </span>
                  </div>
                )}
                <div className="text-sm text-gray-500 mt-auto">
                  Created {new Date(universe.created_at).toLocaleDateString()}
                </div>
              </VStack>
            </div>
          )}
          
      </Card>
    </>
  )
}