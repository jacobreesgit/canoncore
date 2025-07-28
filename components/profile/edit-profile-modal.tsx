'use client'

import { useState, useEffect, useRef } from 'react'
import { useProfile, useUpdateProfile, useAvatarUrl, useUploadAvatar, useRemoveAvatar } from '@/hooks/use-profile'
import { useToast } from '@/hooks/use-toast'
import { BaseModal, ActionButton, VStack, LoadingWrapper, Input, Textarea, UserAvatar } from '@/components/ui'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { data: profile, isLoading: profileLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const currentAvatarUrl = useAvatarUrl(user, profile)
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    website: ''
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateProfile.mutateAsync({
        full_name: formData.full_name || undefined,
        bio: formData.bio || undefined,
        website: formData.website || undefined
      })
      toast.success('Profile Updated', 'Your profile has been updated successfully')
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

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File Type', 'Please select an image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File Too Large', 'Image must be smaller than 5MB')
      return
    }

    try {
      await uploadAvatar.mutateAsync(file)
      toast.success('Avatar Updated', 'Your profile photo has been updated')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload Failed', 'Failed to upload avatar. Please try again.')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar.mutateAsync()
      toast.success('Avatar Removed', 'Your profile photo has been removed')
    } catch (error) {
      console.error('Remove failed:', error)
      toast.error('Remove Failed', 'Failed to remove avatar. Please try again.')
    }
  }

  const isAvatarLoading = uploadAvatar.isPending || removeAvatar.isPending

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
            <h3 className="text-lg font-medium mb-4">Profile Photo</h3>
            
            {/* Avatar Display */}
            <div className="flex flex-col items-center space-y-4">
              <UserAvatar 
                user={user}
                size="2xl"
                className={isAvatarLoading ? 'opacity-50' : ''}
              />
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <ActionButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAvatarLoading}
                  size="sm"
                >
                  {currentAvatarUrl ? 'Change Photo' : 'Upload Photo'}
                </ActionButton>
                
                {currentAvatarUrl && (
                  <ActionButton
                    onClick={handleRemoveAvatar}
                    disabled={isAvatarLoading}
                    variant="secondary"
                    size="sm"
                  >
                    Remove
                  </ActionButton>
                )}
              </div>

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
                {currentAvatarUrl 
                  ? 'Use the buttons above to change or remove your profile photo'
                  : 'Click Upload Photo to add a profile photo'
                }
                <br />
                <span className="text-gray-400">Max 5MB • JPG, PNG, GIF</span>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="w-full space-y-4">
            <h3 className="text-lg font-medium">Profile Information</h3>
            
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
          </div>
        </VStack>
      </form>
    </BaseModal>
  )
}