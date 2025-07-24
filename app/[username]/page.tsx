import { UserUniversesPageClient } from './user-universes-page-client'

interface UserUniversesPageProps {
  params: Promise<{ username: string }>
}

export default async function UserUniversesPage({ params }: UserUniversesPageProps) {
  const { username } = await params
  return <UserUniversesPageClient username={username} />
}