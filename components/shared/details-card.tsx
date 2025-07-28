import { ReactNode } from 'react'
import { Card, VStack, HStack, SectionHeader } from '@/components/ui'

interface DetailsCardProps {
  title?: string
  items: Array<{
    label: string
    value: string | number | ReactNode
  }>
  actions?: ReactNode
}

export function DetailsCard({ title = "Details", items, actions }: DetailsCardProps) {
  return (
    <Card>
      <VStack spacing="md">
        <SectionHeader title={title} level={3} />
        <VStack spacing="sm" className="text-sm">
          {items.map((item, index) => (
            <HStack key={index} justify="between">
              <span className="text-gray-500">{item.label}:</span>
              <span className="text-gray-900 font-medium">{item.value}</span>
            </HStack>
          ))}
        </VStack>
        {actions && (
          <VStack spacing="sm" className="pt-4 border-t border-gray-200">
            {actions}
          </VStack>
        )}
      </VStack>
    </Card>
  )
}