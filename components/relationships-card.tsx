interface RelationshipsCardProps {
  title?: string
}

export function RelationshipsCard({ title = "Relationships" }: RelationshipsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-500 italic">Content relationships will be available in Phase 2.5</p>
    </div>
  )
}