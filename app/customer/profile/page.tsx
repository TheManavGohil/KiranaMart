"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Mail as MailIcon, 
  Camera, 
  Save, 
  Loader2,
  Package,
  CreditCard,
  Clock,
  Home,
  Building,
  Plus,
  ChevronRight,
  Shield,
  Heart,
  PanelLeft,
  LogOut,
  Map,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { getUser as getJWTUser, isAuthenticated } from "@/lib/auth";
import AddressForm from '@/app/components/AddressForm';
import MapDisplayComponent from '@/app/components/MapDisplay';

interface PhoneNumber {
  id: string;
  number: string;
  type: 'primary' | 'secondary';
}

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phoneNumbers: PhoneNumber[];
  addresses: Address[];
  avatar?: string;
}

interface Order {
  _id: string;
  orderId: string;
  date: string;
  total: number;
  status: string;
  items: number;
  imageUrl?: string;
}

export default function CustomerProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<CustomerProfile>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'edit'>('overview');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'home' as const,
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    label: '',
    location: null as [number, number] | null,
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  // Combine NextAuth and custom JWT auth
  useEffect(() => {
    // Try with custom JWT auth if NextAuth session is not available
    if (status === "unauthenticated" && !isAuthenticated()) {
      router.push("/auth");
    }

    // If using custom auth, get the user data
    if (status === "unauthenticated" && isAuthenticated()) {
      const jwtUser = getJWTUser();
      if (jwtUser) {
        // Continue with JWT user
      }
    }
  }, [status, router]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "authenticated" || isAuthenticated()) {
        try {
          const response = await fetch("/api/customer/profile");
          if (response.ok) {
            const data = await response.json();
            handleProfileData(data);

            // Also fetch recent orders
            try {
              const ordersResponse = await fetch("/api/customer/orders?limit=3");
              if (ordersResponse.ok) {
                const ordersData = await ordersResponse.json();
                setRecentOrders(ordersData);
              }
            } catch (error) {
              console.error("Error fetching orders:", error);
            }
          } else {
            toast.error("Failed to load profile");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    if (status !== "loading") {
      fetchProfile();
    }
  }, [status, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Update both profile and formData states
    if (name === 'name') {
      setProfile(prev => prev ? { ...prev, name: value } : null);
      setFormData(prev => ({ ...prev, name: value }));
    } else if (name === 'email') {
      setProfile(prev => prev ? { ...prev, email: value } : null);
      setFormData(prev => ({ ...prev, email: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => {
        const parentValue = prev[parent as keyof typeof prev];
        const updatedParentValue = typeof parentValue === 'object' && parentValue !== null
          ? { ...parentValue, [child]: checked }
          : { [child]: checked };
          
        return {
        ...prev,
          [parent]: updatedParentValue
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast.success("Profile updated successfully");
        // Refresh profile data
        const updatedProfile = await fetch("/api/customer/profile").then(res => res.json());
        handleProfileData(updatedProfile);
        setActiveTab('overview');
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 2MB.");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        const response = await fetch("/api/customer/avatar/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageData: base64Data }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.avatarUrl) {
            // Update the local state with the new avatar URL
            handleProfileData(profile ? { ...profile, avatar: data.avatarUrl } : null);
            setFormData(prev => ({ ...prev, avatar: data.avatarUrl }));
            toast.success(data.message || "Avatar updated successfully");
          } else {
            toast.error("No avatar URL returned from server");
          }
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to upload avatar");
        }
      };
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddress),
      });

      if (response.ok) {
        toast.success("Address added successfully");
        setIsAddingAddress(false);
        // Reset the form
        setNewAddress({
          type: 'home',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          label: '',
          location: null,
        });
        // Refresh profile data
        const updatedProfile = await fetch("/api/customer/profile").then(res => res.json());
        handleProfileData(updatedProfile);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add address");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGeocodeAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      setGeocodeError("Please fill in all address fields");
      return;
    }

    setIsGeocoding(true);
    setGeocodeError(null);

    try {
      const addressString = `${newAddress.street}, ${newAddress.city}, ${newAddress.state} ${newAddress.postalCode}, ${newAddress.country}`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setNewAddress(prev => ({
          ...prev,
          location: [parseFloat(lat), parseFloat(lon)]
        }));
      } else {
        setGeocodeError("Could not find location for this address");
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      setGeocodeError("Failed to get location for this address");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleAddPhone = async () => {
    if (!newPhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[\+]?[0-9\-\(\)\s]{10,15}$/;
    if (!phoneRegex.test(newPhone.trim())) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Check if phone number already exists
    if (profile?.phoneNumbers.some(phone => phone.number === newPhone.trim())) {
      toast.error("This phone number is already added");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/customer/profile/phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          number: newPhone,
          type: 'secondary'
        }),
      });

      if (response.ok) {
        toast.success("Phone number added successfully");
        setIsAddingPhone(false);
        setNewPhone("");
        
        // Refresh profile data
        const updatedProfile = await fetch("/api/customer/profile").then(res => res.json());
        handleProfileData(updatedProfile);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add phone number");
      }
    } catch (error) {
      console.error("Error adding phone:", error);
      toast.error("Failed to add phone number");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhone = async (id: string) => {
    if (!confirm("Are you sure you want to delete this phone number?")) {
      return;
    }

    try {
      const response = await fetch(`/api/customer/profile/phone/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Phone number deleted successfully");
        
        // Refresh profile data
        const updatedProfile = await fetch("/api/customer/profile").then(res => res.json());
        handleProfileData(updatedProfile);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete phone number");
      }
    } catch (error) {
      console.error("Error deleting phone:", error);
      toast.error("Failed to delete phone number");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await fetch(`/api/customer/profile/address/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Address deleted successfully");
        
        // Refresh profile data
        const updatedProfile = await fetch("/api/customer/profile").then(res => res.json());
        handleProfileData(updatedProfile);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!profile?.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
        
        // Refresh profile data
        const updatedProfile = await fetch("/api/customer/profile").then(res => res.json());
        handleProfileData(updatedProfile);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileData = (data: any) => {
    if (!data) {
      setProfile(null);
      return;
    }

    const formattedProfile: CustomerProfile = {
      id: data._id || '',
      name: data.name || '',
      email: data.email || '',
      phoneNumbers: (data.phoneNumbers || []).map((phone: any) => ({
        id: phone._id || phone.id || '',
        number: phone.number || '',
        type: phone.type || 'secondary'
      })),
      addresses: (data.addresses || []).map((address: any) => ({
        id: address._id || address.id || '',
        type: address.type || 'home',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'India',
        label: address.label,
        location: address.location ? {
          latitude: address.location[1] || address.location.latitude,
          longitude: address.location[0] || address.location.longitude
        } : undefined
      })),
      avatar: data.avatar
    };
    
    setProfile(formattedProfile);
    setFormData({
      name: formattedProfile.name,
      email: formattedProfile.email,
      avatar: formattedProfile.avatar
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show message if no profile data
  if (!isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600 mb-4">Unable to load your profile information.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Profile Information
              </h3>
              {profile && (
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  Welcome, {profile.name}
                </div>
              )}
            </div>
            
            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="name"
                    value={profile?.name || ''}
                    onChange={handleInputChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="email"
                    name="email"
                    value={profile?.email || ''}
                    onChange={handleInputChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Phone Numbers
                </h3>
                <button
                  onClick={() => setIsAddingPhone(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </button>
              </div>

              {/* Phone Numbers List */}
              <div className="space-y-4">
                {profile?.phoneNumbers?.map((phone) => (
                  <div
                    key={phone.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {phone.number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {phone.type === 'primary' ? 'Primary' : 'Secondary'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePhone(phone.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Phone Form */}
              {isAddingPhone && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="mt-1">
                        <input
                          type="tel"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value.replace(/[^0-9+\-\(\)\s]/g, ''))}
                          className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="Enter phone number (e.g., +91 9876543210)"
                          maxLength={15}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setIsAddingPhone(false);
                          setNewPhone("");
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddPhone}
                        disabled={isSaving || !newPhone}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Phone
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Addresses */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Addresses
                </h3>
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </button>
              </div>

              {/* Addresses List */}
              <div className="space-y-4">
                {profile?.addresses?.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {address.type === 'home' ? 'Home' : address.type === 'work' ? 'Work' : 'Other'}
                            </p>
                            {address.label && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {address.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {address.street}
                          </p>
                          <p className="text-sm text-gray-500">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-gray-500">
                            {address.country}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {address.location && (
                      <div className="mt-4 h-48 rounded-lg overflow-hidden">
                        <MapDisplayComponent
                          center={[address.location.latitude, address.location.longitude]}
                          zoom={15}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <AddressForm
                  onSuccess={() => {
                    setIsAddingAddress(false);
                    // Refresh profile data
                    fetch("/api/customer/profile")
                      .then(res => res.json())
                      .then(data => handleProfileData(data))
                      .catch(error => {
                        console.error("Error refreshing profile:", error);
                        toast.error("Failed to refresh profile data");
                      });
                  }}
                  onCancel={() => setIsAddingAddress(false)}
                />
              )}
            </div>

            {/* Save Profile Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 