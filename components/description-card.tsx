import { Card, VStack, SectionHeader } from './ui'

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
    <Card>
      <VStack spacing="md">
        <SectionHeader title={title} level={2} />
        {description ? (
          <p className="text-gray-700 leading-relaxed">{description}</p>
        ) : (
          <p className="text-gray-500 italic">{placeholder}</p>
        )}
      </VStack>
    </Card>
  )
}