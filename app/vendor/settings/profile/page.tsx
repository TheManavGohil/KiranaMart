"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock initial profile data
const initialProfileData = {
  firstName: "Vikram",
  lastName: "Singh",
  email: "vikram.singh@freshmart.com",
  phoneNumber: "+91 98765 43210", // Corrected based on previous context
  role: "Store Manager",
  avatarUrl: "", // Placeholder for avatar image URL
}

export default function ProfileSettingsPage() {
  const [profileData, setProfileData] = useState(initialProfileData)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleProfileDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  // Placeholder function for handling avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      console.log("Selected avatar file:", file.name)
      // Here you would typically upload the file to your server
      // and update profileData.avatarUrl with the new URL
    }
  }

  const handleSaveProfile = () => {
    console.log("Saving profile information:", profileData)
    // Add API call logic here, possibly sending avatarPreview if it changed
  }

  // Get initials for Avatar Fallback
  const getInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName?.[0]?.toUpperCase() || ''
    const lastInitial = lastName?.[0]?.toUpperCase() || ''
    return `${firstInitial}${lastInitial}` || 'VS' // Default to VS if no name
  }

  return (
    <div className="animate-fadeIn">
      <Card className="max-w-4xl mx-auto shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Profile Information</CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-700/50">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarPreview || profileData.avatarUrl} alt="User Avatar" />
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                {getInitials(profileData.firstName, profileData.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Change Avatar
              </Label>
              <input
                id="avatar-upload"
                name="avatar-upload"
                type="file"
                className="sr-only" // Hide the default file input
                accept="image/jpeg, image/png, image/gif"
                onChange={handleAvatarChange}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">JPG, GIF or PNG. Max size of 2MB.</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                className="mt-1"
                value={profileData.firstName}
                onChange={handleProfileDataChange}
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                className="mt-1"
                value={profileData.lastName}
                onChange={handleProfileDataChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              className="mt-1"
              value={profileData.email}
              onChange={handleProfileDataChange}
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              className="mt-1"
              value={profileData.phoneNumber}
              onChange={handleProfileDataChange}
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</Label>
            <Input
              id="role"
              name="role"
              className="mt-1 bg-gray-100 dark:bg-gray-700"
              value={profileData.role}
              readOnly // Assuming role is not directly editable
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <Button 
              className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              onClick={handleSaveProfile}
            >
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 