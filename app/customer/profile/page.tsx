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
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { getUser as getJWTUser, isAuthenticated } from "@/lib/auth";

interface CustomerProfile {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  addresses?: {
    _id?: string;
    type: 'home' | 'work' | 'other';
    isDefault?: boolean;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    label?: string;
  }[];
  avatar?: string;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    quickCheckout: boolean;
    deliverySlot?: string;
  };
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
            setProfile(data);
            setFormData(data);

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
      }
    };

    fetchProfile();
  }, [status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => {
        const parentValue = prev[parent as keyof typeof prev];
        const updatedParentValue = typeof parentValue === 'object' && parentValue !== null
          ? { ...parentValue, [child]: value }
          : { [child]: value };
          
        return {
        ...prev,
          [parent]: updatedParentValue
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
        setProfile(updatedProfile);
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
          setProfile(prev => prev ? { ...prev, avatar: data.avatarUrl } : null);
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

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">My Account</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6 border border-gray-100 dark:border-gray-700">
          <div className="p-6 relative">
            <div className="absolute top-3 right-3">
              {profile?.avatar && (
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Camera className="h-3 w-3 mr-1" /> 
                  {activeTab === 'overview' ? 'Profile photo' : 'Change photo'}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-600 shadow-md">
                  {profile?.avatar ? (
                    <Image 
                      src={profile.avatar} 
                      alt={profile.name || "Profile"} 
                      width={112} 
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400 dark:text-gray-300" />
                  )}
                </div>
                {activeTab === 'edit' && (
                <label 
                  htmlFor="avatar-upload" 
                    className="absolute bottom-1 right-1 bg-green-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-green-600 transition-colors shadow-sm"
                >
                    <Camera className="h-4 w-4" />
                </label>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profile?.name}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center sm:justify-start">
                    <Phone className="h-4 w-4 mr-1.5" />
                    <span>{profile?.phone || "Add phone number"}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <Mail className="h-4 w-4 mr-1.5" />
                    <span>{profile?.email}</span>
                  </div>
                </div>
                
                {activeTab === 'overview' && (
                  <button 
                    onClick={() => setActiveTab('edit')} 
                    className="mt-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Quick Links */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Link href="/customer/orders" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <Package className="h-6 w-6 mx-auto text-green-500 mb-2" />
                <span className="text-sm font-medium dark:text-gray-200">My Orders</span>
              </Link>
              <Link href="/customer/favorites" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <Heart className="h-6 w-6 mx-auto text-green-500 mb-2" />
                <span className="text-sm font-medium dark:text-gray-200">Favorites</span>
              </Link>
              <button onClick={() => window.location.href = '/auth'} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <LogOut className="h-6 w-6 mx-auto text-red-500 mb-2" />
                <span className="text-sm font-medium dark:text-gray-200">Logout</span>
              </button>
            </div>
            
            {/* Addresses */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold dark:text-gray-100">Saved Addresses</h3>
                <Link 
                  href="/customer/addresses/add"
                  className="text-green-600 dark:text-green-400 text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add New
                </Link>
              </div>
              <div className="p-4">
                {profile?.addresses && profile.addresses.length > 0 ? (
              <div className="space-y-4">
                    {profile.addresses.map((address, index) => (
                      <div key={address._id || index} className="flex border-b dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          {address.type === 'home' ? (
                            <Home className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          ) : address.type === 'work' ? (
                            <Building className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">
                              {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                              {address.label && ` - ${address.label}`}
                            </h4>
                            {address.isDefault && (
                              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {address.street}, {address.city}, {address.state} {address.postalCode}
                          </p>
                        </div>
                        <Link href={`/customer/addresses/edit/${address._id}`} className="text-gray-400 dark:text-gray-500">
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MapPin className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No addresses saved yet</p>
                    <Link href="/customer/addresses/add" className="text-green-600 dark:text-green-400 text-sm mt-2 inline-block">
                      + Add a delivery address
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold dark:text-gray-100">Recent Orders</h3>
                <Link href="/customer/orders" className="text-green-600 dark:text-green-400 text-sm">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <Link 
                      key={order._id} 
                      href={`/customer/orders/${order.orderId}`} 
                      className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 mr-3 flex-shrink-0">
                            {order.imageUrl ? (
                              <Image
                                src={order.imageUrl}
                                alt={`Order ${order.orderId}`}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <Package className="h-6 w-6 m-auto text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium dark:text-gray-200">{order.orderId}</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{order.date} • {order.items} items</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold dark:text-gray-200">₹{order.total.toFixed(2)}</span>
                          <p className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block
                            ${order.status === 'Delivered' 
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400' 
                              : order.status === 'Cancelled' 
                              ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400' 
                              : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400'}`}
                          >
                            {order.status}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Package className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
                    <Link href="/" className="text-green-600 dark:text-green-400 text-sm mt-2 inline-block">
                      Start shopping
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold dark:text-gray-100">Notification Preferences</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <span className="dark:text-gray-300">Push Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" 
                      className="sr-only peer" 
                      checked={profile?.preferences?.notifications || false}
                      onChange={() => {}}
                      disabled
                    />
                    <div className={`w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${profile?.preferences?.notifications ? 'bg-green-600 dark:bg-green-500' : ''}`}></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MailIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <span className="dark:text-gray-300">Email Updates</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" 
                      className="sr-only peer" 
                      checked={profile?.preferences?.emailUpdates || false}
                      onChange={() => {}}
                      disabled
                    />
                    <div className={`w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${profile?.preferences?.emailUpdates ? 'bg-green-600 dark:bg-green-500' : ''}`}></div>
                  </label>
                </div>
                <button 
                  onClick={() => setActiveTab('edit')}
                  className="w-full py-2 border border-green-500 dark:border-green-600 text-green-600 dark:text-green-500 rounded-lg text-center mt-4 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  Manage Preferences
                </button>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold dark:text-gray-100">Basic Information</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                    value={profile?.email || ''}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
                      disabled
                    />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
              </div>
            </div>
            
            {/* Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold dark:text-gray-100">Preferences</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <span className="dark:text-gray-300">Push Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferences.notifications"
                    checked={formData.preferences?.notifications || false}
                    onChange={handleCheckboxChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MailIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <span className="dark:text-gray-300">Email Updates</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="preferences.emailUpdates"
                      checked={formData.preferences?.emailUpdates || false}
                      onChange={handleCheckboxChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <span className="dark:text-gray-300">Enable Quick Checkout</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                      name="preferences.quickCheckout"
                      checked={formData.preferences?.quickCheckout || false}
                    onChange={handleCheckboxChange}
                      className="sr-only peer"
                  />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Delivery Time</label>
                  <select
                    name="preferences.deliverySlot"
                    value={formData.preferences?.deliverySlot || ''}
                    onChange={(e) => handleInputChange(e as any)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select preferred time</option>
                    <option value="morning">Morning (8am - 12pm)</option>
                    <option value="afternoon">Afternoon (12pm - 4pm)</option>
                    <option value="evening">Evening (4pm - 8pm)</option>
                    <option value="night">Night (8pm - 11pm)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 flex items-center justify-center"
                disabled={isSaving}
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
          </form>
        )}
      </div>
    </div>
  );
} 