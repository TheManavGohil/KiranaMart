"use client"

import { useState, useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, AlertCircle, User, Upload } from "lucide-react"
import Image from 'next/image'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiCall } from "@/lib/api"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

// --- Types and Schemas ---

// Shape of data from GET /api/vendor/profile
interface VendorProfileData {
  _id: string
  name: string // Expecting full name from backend
  email: string
  phoneNumber?: string
  role?: string // Include role if available and needed for display
  avatarUrl?: string // Assuming backend might provide this eventually
  storeName?: string
  storeDescription?: string
  address?: string
  // Add other fields fetched from backend if necessary
}

// Zod schema for form validation
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(50),
  lastName: z.string().min(1, "Last name is required.").max(50),
  phoneNumber: z.string().regex(/^$|^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Invalid phone number format.").optional().or(z.literal('')),
  storeName: z.string().min(2, "Store name must be at least 2 characters.").max(100).optional().or(z.literal('')),
  storeDescription: z.string().max(500).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  // Email and Role are not directly editable in this form
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// --- Helper Functions ---

// Split full name into first and last
const splitName = (fullName: string | undefined): { firstName: string; lastName: string } => {
  if (!fullName) return { firstName: "", lastName: "" }
  const parts = fullName.trim().split(' ')
  const firstName = parts[0] || ""
  const lastName = parts.slice(1).join(' ') || ""
  return { firstName, lastName }
}

// Get initials for Avatar Fallback
const getInitials = (firstName: string, lastName: string) => {
  const firstInitial = firstName?.[0]?.toUpperCase() || ''
  const lastInitial = lastName?.[0]?.toUpperCase() || ''
  return `${firstInitial}${lastInitial}` || 'U' // Default to U if no name
}

// --- Component ---

export default function VendorProfileSettings() {
  const [profile, setProfile] = useState<VendorProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFileToUpload, setAvatarFileToUpload] = useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      storeName: "",
      storeDescription: "",
      address: "",
    },
    mode: 'onChange',
  })

  // --- Data Fetching ---
  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiCall<VendorProfileData>("/api/vendor/profile")
      setProfile(data)
      const { firstName, lastName } = splitName(data.name)
      form.reset({
        firstName: firstName,
        lastName: lastName,
        phoneNumber: data.phoneNumber || "",
        storeName: data.storeName || "",
        storeDescription: data.storeDescription || "",
        address: data.address || "",
      })
      setAvatarPreview(data.avatarUrl || null)
    } catch (err: any) {
      console.error("Error fetching vendor profile:", err)
      setError(err.message || "Failed to load profile data.")
      toast.error(`Error: ${err.message || "Failed to load profile"}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Form Submission ---
  const onSubmit: SubmitHandler<ProfileFormValues> = async (values) => {
    setIsSaving(true)
    try {
      const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim()
      const payload = {
        name: fullName,
        phoneNumber: values.phoneNumber,
        storeName: values.storeName,
        storeDescription: values.storeDescription,
        address: values.address,
      }

      const updatedProfile = await apiCall<{ message: string; vendor: VendorProfileData }>("/api/vendor/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      })

      toast.success("Profile updated successfully!")

      if (updatedProfile.vendor) {
        setProfile(updatedProfile.vendor)
        const { firstName, lastName } = splitName(updatedProfile.vendor.name)
        form.reset({
          firstName: firstName,
          lastName: lastName,
          phoneNumber: updatedProfile.vendor.phoneNumber || "",
          storeName: updatedProfile.vendor.storeName || "",
          storeDescription: updatedProfile.vendor.storeDescription || "",
          address: updatedProfile.vendor.address || "",
        })
        if (!avatarFileToUpload) {
          setAvatarPreview(updatedProfile.vendor.avatarUrl || null)
        }
      } else {
        form.reset(values)
      }
    } catch (err: any) {
      console.error("Error updating profile:", err)
      toast.error(`Update failed: ${err.message || "An unknown error occurred"}`)
    } finally {
      setIsSaving(false)
    }
  }

  // --- Avatar Upload Logic ---
  const uploadAvatar = async (imageDataUrl: string) => {
    setIsUploadingAvatar(true)
    try {
      const result = await apiCall<{ message: string; avatarUrl: string }>("/api/vendor/avatar/upload", {
        method: "POST",
        body: JSON.stringify({ imageData: imageDataUrl }),
      })
      toast.success(result.message || "Avatar uploaded!")

      if (profile) {
        setProfile({ ...profile, avatarUrl: result.avatarUrl })
      }
      setAvatarPreview(result.avatarUrl)
      setAvatarFileToUpload(null)
    } catch (err: any) {
      console.error("Error uploading avatar:", err)
      toast.error(`Avatar upload failed: ${err.message || "Please try again"}`)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // --- Avatar Handling ---
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("File is too large. Max size is 2MB.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string
        setAvatarPreview(imageDataUrl)
        setAvatarFileToUpload(imageDataUrl)
        uploadAvatar(imageDataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Loading your personal information...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (error || !profile) { // Handle error or profile being null after loading
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-300 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" /> Error Loading Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 dark:text-red-400">{error || "Could not load profile data."}</p>
          <Button onClick={fetchProfile} variant="destructive" className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // --- Render Form ---
  return (
    <div className="animate-fadeIn">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <Card className="shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Profile Information</CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Update your personal and store information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-700/50">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarPreview || undefined} alt="Vendor Avatar" />
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                      {getInitials(form.watch("firstName"), form.watch("lastName"))}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="avatar-upload"
                    className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${isUploadingAvatar ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    aria-disabled={isUploadingAvatar}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Change Avatar
                  </Label>
                  <input
                    id="avatar-upload"
                    name="avatar-upload"
                    type="file"
                    className="sr-only"
                    accept="image/jpeg, image/png, image/gif"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 pt-2">Personal Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input value={profile.email} readOnly className="bg-gray-100 dark:bg-gray-700" />
                </FormControl>
                <FormDescription>
                  Email address cannot be changed.
                </FormDescription>
              </FormItem>

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input value={profile.role || 'Vendor'} readOnly className="bg-gray-100 dark:bg-gray-700" />
                </FormControl>
              </FormItem>

              <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 pt-4 border-t border-gray-100 dark:border-gray-700/50">Store Details</h3>
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ramesh Kirana Store" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storeDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell customers a little about your store..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Market St, Malad West, Mumbai" {...field} />
                    </FormControl>
                    <FormDescription>The primary address for your store location.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t border-gray-100 dark:border-gray-700/50 pt-6 flex justify-end">
              <Button type="submit" disabled={isSaving || isUploadingAvatar || !form.formState.isDirty}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving Profile..." : "Save Profile"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
} 