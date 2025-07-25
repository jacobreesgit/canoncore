import { Card, VStack, SectionHeader } from '@/components/ui'

interface RelationshipsCardProps {
  title?: string
}

export function RelationshipsCard({ title = "Relationships" }: RelationshipsCardProps) {
  return (
    <Card>
      <VStack spacing="md">
        <SectionHeader title={title} level={3} />
        <p className="text-gray-500 italic">Content relationships will be available in Phase 2.5</p>
      </VStack>
    </Card>
  )
}