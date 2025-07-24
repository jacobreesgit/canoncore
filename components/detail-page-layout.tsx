'use client'

import { ReactNode } from 'react'

interface DetailPageLayoutProps {
  // Header content
  backButton?: ReactNode
  title: string
  subtitle?: string  
  icon?: string
  actionButtons?: ReactNode

  // Main content (left side - 2/3 width)
  mainContent: ReactNode

  // Sidebar cards (right side - 1/3 width)
  detailsCard?: ReactNode
  descriptionCard?: ReactNode
  versionsCard?: ReactNode
  relationshipsCard?: ReactNode
  additionalCards?: ReactNode[]

  // Modals and other content
  children?: ReactNode
}

export function DetailPageLayout({
  backButton,
  title,
  subtitle,
  icon,
  actionButtons,
  mainContent,
  detailsCard,
  descriptionCard,
  versionsCard,
  relationshipsCard,
  additionalCards = [],
  children,
}: DetailPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {backButton}
              <div className="flex items-center gap-3">
                {icon && <span className="text-3xl">{icon}</span>}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  {subtitle && <p className="text-gray-500">{subtitle}</p>}
                </div>
              </div>
            </div>
            {actionButtons && (
              <div className="flex items-center gap-3">
                {actionButtons}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {mainContent}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {detailsCard}
            {descriptionCard}
            {versionsCard}
            {relationshipsCard}
            {additionalCards.map((card, index) => (
              <div key={index}>{card}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional content (modals, etc.) */}
      {children}
    </div>
  )
}