import Link from 'next/link'
import { Universe } from '@/types/database'

interface UniverseCardProps {
  universe: Universe
}

export function UniverseCard({ universe }: UniverseCardProps) {
  return (
    <Link
      href={`/universes/${universe.slug}`}
      className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
    >
      <h3 className="text-xl font-semibold mb-2">{universe.name}</h3>
      {universe.description && (
        <p className="text-gray-600 mb-4 line-clamp-3">
          {universe.description}
        </p>
      )}
      <div className="text-sm text-gray-500">
        Created {new Date(universe.created_at).toLocaleDateString()}
      </div>
    </Link>
  )
}