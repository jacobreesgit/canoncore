import { UniversePageClient } from './universe-page-client'

interface UniversePageProps {
  params: Promise<{ username: string; slug: string }>
}

export default async function UniversePage({ params }: UniversePageProps) {
  const { username, slug } = await params
  return <UniversePageClient username={username} slug={slug} />
}