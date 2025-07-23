import { ContentDetailPageClient } from './content-detail-page-client'

interface ContentDetailPageProps {
  params: Promise<{
    slug: string
    contentId: string
  }>
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const { slug, contentId } = await params
  
  return (
    <ContentDetailPageClient 
      universeSlug={slug}
      contentId={contentId}
    />
  )
}