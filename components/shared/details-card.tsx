import { Card, VStack, HStack, SectionHeader } from '@/components/ui'

interface DetailsCardProps {
  title?: string
  items: Array<{
    label: string
    value: string | number
  }>
}

export function DetailsCard({ title = "Details", items }: DetailsCardProps) {
  return (
    <Card>
      <VStack spacing="md">
        <SectionHeader title={title} level={2} />
        <VStack spacing="sm" className="text-sm">
          {items.map((item, index) => (
            <HStack key={index} justify="between">
              <span className="text-gray-500">{item.label}:</span>
              <span className="text-gray-900 font-medium">{item.value}</span>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  )
}