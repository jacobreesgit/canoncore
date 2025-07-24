interface DescriptionCardProps {
  title?: string
  description?: string | null
  placeholder?: string
}

export function DescriptionCard({ 
  title = "Description", 
  description, 
  placeholder = "No description provided" 
}: DescriptionCardProps) {
  // Don't render if no description and no placeholder should be shown
  if (!description && !placeholder) {
    return null
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {description ? (
        <p className="text-gray-700 leading-relaxed">{description}</p>
      ) : (
        <p className="text-gray-500 italic">{placeholder}</p>
      )}
    </div>
  )
}