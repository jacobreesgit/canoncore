'use client'

import { useState, useEffect, useRef } from 'react'
import { useProfile, useUpdateProfile, useAvatarUrl, useUploadAvatar } from '@/hooks/use-profile'
import { useToast } from '@/hooks/use-toast'
import { BaseModal, ActionButton, VStack, HStack, LoadingWrapper, Input, Textarea, UserAvatar, HeaderTitle } from '@/components/ui'
import Image from 'next/image'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { data: profile, isLoading: profileLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const currentAvatarUrl = useAvatarUrl(user, profile)
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    website: ''
  })
  
  // Local state for avatar file and preview
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState<boolean>(false)

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website: profile.website || ''
      })
    }
  }, [profile])
  
  // Reset avatar state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Clean up object URL to prevent memory leaks
      if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatarUrl)
      }
      setPreviewAvatarUrl(null)
      setSelectedAvatarFile(null)
      setRemoveAvatar(false)
    }
  }, [isOpen, previewAvatarUrl])
  
  // Also reset avatar state when modal opens (fresh start)
  useEffect(() => {
    if (isOpen) {
      setPreviewAvatarUrl(null)
      setSelectedAvatarFile(null)
      setRemoveAvatar(false)
    }
  }, [isOpen])
  
  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatarUrl)
      }
    }
  }, [previewAvatarUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let avatarUrl: string | undefined = undefined
      
      // Handle avatar upload if a new file was selected
      if (selectedAvatarFile) {
        const result = await uploadAvatar.mutateAsync(selectedAvatarFile)
        avatarUrl = result
      } else if (removeAvatar) {
        // Set avatar to null if user chose to remove it
        avatarUrl = undefined
      }
      
      // Update profile with form data and avatar URL
      await updateProfile.mutateAsync({
        full_name: formData.full_name || undefined,
        bio: formData.bio || undefined,
        website: formData.website || undefined,
        ...(selectedAvatarFile || removeAvatar ? { avatar_url: avatarUrl } : {})
      })
      
      toast.success('Profile Updated', 'Your profile has been updated successfully')
      
      // Clean up preview before closing
      if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatarUrl)
      }
      setPreviewAvatarUrl(null)
      setSelectedAvatarFile(null)
      setRemoveAvatar(false)
      onClose()
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Update Failed', 'Failed to update profile. Please try again.')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File Type', 'Please select an image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File Too Large', 'Image must be smaller than 5MB')
      return
    }

    // Clean up previous preview URL if it exists
    if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewAvatarUrl)
    }

    // Set the file for upload and create preview URL
    setSelectedAvatarFile(file)
    const localPreviewUrl = URL.createObjectURL(file)
    setPreviewAvatarUrl(localPreviewUrl)
    setRemoveAvatar(false) // Clear remove flag if user selects new file
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveAvatar = () => {
    // Clean up preview URL if it exists
    if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewAvatarUrl)
    }
    
    // Set flags to remove avatar on save
    setPreviewAvatarUrl(null)
    setSelectedAvatarFile(null)
    setRemoveAvatar(true)
  }

  const isAvatarLoading = uploadAvatar.isPending || updateProfile.isPending
  
  // Use preview avatar if available, otherwise use current avatar (unless removing)
  const displayAvatarUrl = removeAvatar ? null : (previewAvatarUrl || currentAvatarUrl)

  if (profileLoading) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Profile">
        <div className="p-6">
          <LoadingWrapper 
            isLoading={true}
            fallback="placeholder"
            title="Loading profile..."
          >
            <div />
          </LoadingWrapper>
        </div>
      </BaseModal>
    )
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="p-6">
        <VStack spacing="lg">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center">
            <HeaderTitle level={3} className="mb-4">Profile Photo</HeaderTitle>
            
            {/* Avatar Display */}
            <VStack spacing="md" align="center">
              {/* Custom avatar display with preview support */}
              <div className={`relative ${isAvatarLoading ? 'opacity-50' : ''}`}>
                {displayAvatarUrl ? (
                  <Image
                    src={displayAvatarUrl}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div 
                  className={`w-32 h-32 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium text-5xl ${displayAvatarUrl ? 'hidden' : ''}`}
                >
                  {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
              </div>
              
              {/* Action Buttons */}
              <HStack spacing="sm">
                <ActionButton
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAvatarLoading}
                  size="sm"
                >
                  {displayAvatarUrl ? 'Change Photo' : 'Upload Photo'}
                </ActionButton>
                
                {displayAvatarUrl && (
                  <ActionButton
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isAvatarLoading}
                    variant="secondary"
                    size="sm"
                  >
                    Remove
                  </ActionButton>
                )}
              </HStack>

              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {/* Help Text */}
              <div className="text-xs text-gray-500 text-center max-w-xs">
                {displayAvatarUrl 
                  ? 'Use the buttons above to change or remove your profile photo'
                  : 'Click Upload Photo to add a profile photo'
                }
                <br />
                <span className="text-gray-400">Max 5MB • JPG, PNG, GIF</span>
              </div>
            </VStack>
          </div>

          {/* Profile Information */}
          <VStack spacing="md" className="w-full">
            <HeaderTitle level={3}>Profile Information</HeaderTitle>
            
            {/* Full Name */}
            <Input
              id="full_name"
              type="text"
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
            />

            {/* Bio */}
            <Textarea
              id="bio"
              label="Bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              placeholder="Tell others about yourself"
              maxLength={500}
              showCharCount={true}
            />

            {/* Website */}
            <Input
              id="website"
              type="url"
              label="Website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://example.com"
            />

            {/* Current Username (read-only info) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                @{profile?.username || 'loading...'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Username cannot be changed
              </div>
            </div>
          </VStack>

          {/* Action Buttons */}
          <HStack spacing="sm" className="justify-end pt-4 border-t border-gray-200">
            <ActionButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={updateProfile.isPending}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </ActionButton>
          </HStack>
        </VStack>
      </form>
    </BaseModal>
  )
}