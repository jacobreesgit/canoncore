interface DetailsCardProps {
  title?: string
  items: Array<{
    label: string
    value: string | number
  }>
}

export function DetailsCard({ title = "Details", items }: DetailsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3 text-sm">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-500">{item.label}:</span>
            <span className="text-gray-900 font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}