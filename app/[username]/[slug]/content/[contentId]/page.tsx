import { ContentDetailPageClient } from './content-detail-page-client'

interface ContentDetailPageProps {
  params: Promise<{
    username: string
    slug: string
    contentId: string
  }>
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const { username, slug, contentId } = await params
  
  return (
    <ContentDetailPageClient 
      username={username}
      universeSlug={slug}
      contentId={contentId}
    />
  )
}