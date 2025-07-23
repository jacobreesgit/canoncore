import { UniversePageClient } from './universe-page-client'

interface UniversePageProps {
  params: Promise<{ slug: string }>
}

export default async function UniversePage({ params }: UniversePageProps) {
  const { slug } = await params
  return <UniversePageClient slug={slug} />
}