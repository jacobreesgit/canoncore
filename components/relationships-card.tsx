import { Card } from './ui/card'

interface RelationshipsCardProps {
  title?: string
}

export function RelationshipsCard({ title = "Relationships" }: RelationshipsCardProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-500 italic">Content relationships will be available in Phase 2.5</p>
    </Card>
  )
}