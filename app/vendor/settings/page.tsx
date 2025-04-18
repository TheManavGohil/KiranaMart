"use client"

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic' // Import dynamic
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Check, AlertCircle } from "lucide-react" // For icons
import { apiCall } from '@/lib/api' // Import API utility
import { toast } from "sonner" // For notifications

// Import Leaflet CSS (ensure this path is correct for your setup)
import 'leaflet/dist/leaflet.css'
// Remove direct Leaflet import from here - we'll import it inside useEffect

// Default initial store data (will be replaced with API data)
const initialStoreData = {
  storeName: "",
  storeId: "",
  storeDescription: "",
  phoneNumber: "",
  email: "",
  address: "",
}

// Default initial business hours (will be replaced with API data)
const initialBusinessHours = [
  { day: "Monday", open: "08:00", close: "22:00", enabled: true },
  { day: "Tuesday", open: "08:00", close: "22:00", enabled: true },
  { day: "Wednesday", open: "08:00", close: "22:00", enabled: true },
  { day: "Thursday", open: "08:00", close: "22:00", enabled: true },
  { day: "Friday", open: "08:00", close: "22:00", enabled: true },
  { day: "Saturday", open: "09:00", close: "20:00", enabled: true },
  { day: "Sunday", open: "10:00", close: "18:00", enabled: false },
]

// Default initial delivery settings (will be replaced with API data)
const initialDeliverySettings = {
  deliveryRadius: 5,
  freeDelivery: true,
  freeDeliveryThreshold: 500,
  expressDelivery: false,
  expressDeliveryTime: 30,
}

// Helper to generate time options for select dropdowns
const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      options.push(time)
    }
  }
  return options
}

// Dynamically import the Map component to avoid SSR issues
const MapDisplay = dynamic(
  () => import('@/components/settings/MapDisplay'), // Adjust path if needed
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading Map...
      </div>
    )
  }
)

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
}

// Remove Leaflet icon fix from the module scope

interface StoreSettings {
  storeName: string;
  storeId: string;
  storeDescription: string;
  phoneNumber: string;
  email: string;
  address: string;
  businessHours: Array<{
    day: string;
    open: string;
    close: string;
    enabled: boolean;
  }>;
  deliverySettings: {
    deliveryRadius: number;
    freeDelivery: boolean;
    freeDeliveryThreshold: number;
    expressDelivery: boolean;
    expressDeliveryTime: number;
  };
  location?: [number, number] | null;
}

export default function StoreSettingsPage() {
  const [storeData, setStoreData] = useState(initialStoreData)
  const [businessHours, setBusinessHours] = useState(initialBusinessHours)
  const [deliverySettings, setDeliverySettings] = useState(initialDeliverySettings)
  const [mapCoordinates, setMapCoordinates] = useState<[number, number] | null>(null) // [latitude, longitude]
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState({
    storeInfo: false,
    businessHours: false,
    deliverySettings: false
  })

  const timeOptions = generateTimeOptions()

  // Fix Leaflet icon issue on component mount (client-side only)
  useEffect(() => {
    // Import Leaflet inside useEffect to ensure it only runs client-side
    import('leaflet').then((L) => {
      // Fix for default Leaflet icon issues with build tools
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    });
  }, []);

  // Fetch vendor settings from API
  const fetchVendorSettings = async () => {
    try {
      setIsLoading(true);
      const data = await apiCall<StoreSettings>('/api/vendor/settings');
      
      // Update state with fetched data
      setStoreData({
        storeName: data.storeName,
        storeId: data.storeId,
        storeDescription: data.storeDescription,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
      });
      
      setBusinessHours(data.businessHours);
      setDeliverySettings(data.deliverySettings);
      
      // Set map coordinates if available
      if (data.location) {
        setMapCoordinates(data.location);
      }
      
      toast.success("Store settings loaded successfully");
    } catch (error: any) {
      console.error("Error fetching vendor settings:", error);
      toast.error(`Error loading settings: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    fetchVendorSettings();
  }, []);

  // --- Geocoding Logic --- 
  const fetchCoordinates = async (address: string) => {
    if (!address) {
      setMapCoordinates(null)
      setGeocodeError(null)
      return
    }
    setIsGeocoding(true)
    setGeocodeError(null)
    try {
      // Using OpenStreetMap Nominatim API (free, rate-limited)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch coordinates from Nominatim');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCoordinates([parseFloat(lat), parseFloat(lon)]);
      } else {
        setMapCoordinates(null);
        setGeocodeError('Address not found.');
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setMapCoordinates(null);
      setGeocodeError('Failed to fetch location. Check address or network.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Debounced version of the fetch function
  const debouncedFetchCoordinates = useCallback(debounce(fetchCoordinates, 1000), []); // 1 second debounce

  // Effect to fetch coordinates when address changes
  useEffect(() => {
    debouncedFetchCoordinates(storeData.address);
  }, [storeData.address, debouncedFetchCoordinates]);

  // --- Handler functions --- 
  const handleStoreDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setStoreData(prev => ({ ...prev, [name]: value }))
  }

  const handleBusinessHourChange = (day: string, field: string, value: string | boolean) => {
    setBusinessHours(prev =>
      prev.map(item => (item.day === day ? { ...item, [field]: value } : item))
    )
  }

  const handleDeliverySettingChange = (field: string, value: string | number | boolean) => {
    // Ensure deliveryRadius is a number
    const updatedValue = field === 'deliveryRadius' ? Number(value) : value;
    setDeliverySettings(prev => ({ ...prev, [field]: updatedValue }))
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving({...isSaving, storeInfo: true});
      
      // Prepare data to send to API
      const dataToUpdate = {
        ...storeData,
        location: mapCoordinates // Save the coordinates along with the address
      };
      
      // Call API to update settings
      await apiCall('/api/vendor/settings', {
        method: 'PUT',
        body: JSON.stringify(dataToUpdate)
      });
      
      toast.success("Store information updated successfully");
    } catch (error: any) {
      console.error("Error saving store information:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSaving({...isSaving, storeInfo: false});
    }
  }

  const handleSaveBusinessHours = async () => {
    try {
      setIsSaving({...isSaving, businessHours: true});
      
      // Call API to update business hours
      await apiCall('/api/vendor/settings', {
        method: 'PUT',
        body: JSON.stringify({ businessHours })
      });
      
      toast.success("Business hours updated successfully");
    } catch (error: any) {
      console.error("Error saving business hours:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSaving({...isSaving, businessHours: false});
    }
  }

  const handleSaveDeliverySettings = async () => {
    try {
      setIsSaving({...isSaving, deliverySettings: true});
      
      // Call API to update delivery settings
      await apiCall('/api/vendor/settings', {
        method: 'PUT',
        body: JSON.stringify({ deliverySettings })
      });
      
      toast.success("Delivery settings updated successfully");
    } catch (error: any) {
      console.error("Error saving delivery settings:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSaving({...isSaving, deliverySettings: false});
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading store settings...</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait while we fetch your store information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Store Information Column */}
      <div className="lg:col-span-2">
        <Card className="shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Store Information</CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Update your store details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storeName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</Label>
                <Input
                  id="storeName"
                  name="storeName"
                  className="mt-1"
                  value={storeData.storeName}
                  onChange={handleStoreDataChange}
                />
              </div>
              <div>
                <Label htmlFor="storeId" className="text-sm font-medium text-gray-700 dark:text-gray-300">Store ID</Label>
                <Input
                  id="storeId"
                  name="storeId"
                  className="mt-1 bg-gray-100 dark:bg-gray-700"
                  value={storeData.storeId}
                  readOnly // Assuming Store ID is not editable
                />
              </div>
            </div>

            <div>
              <Label htmlFor="storeDescription" className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Description</Label>
              <Textarea
                id="storeDescription"
                name="storeDescription"
                className="mt-1"
                rows={3}
                value={storeData.storeDescription}
                onChange={handleStoreDataChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  className="mt-1"
                  value={storeData.phoneNumber}
                  onChange={handleStoreDataChange}
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="mt-1"
                  value={storeData.email}
                  onChange={handleStoreDataChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</Label>
              <Textarea
                id="address"
                name="address"
                className="mt-1"
                rows={2}
                placeholder="Enter full store address"
                value={storeData.address}
                onChange={handleStoreDataChange}
              />
               {isGeocoding && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center"> 
                    <Loader2 className="h-3 w-3 animate-spin mr-1"/> Looking up location...
                  </p>
                )}
                {geocodeError && (
                   <p className="text-xs text-red-600 dark:text-red-400 mt-1">{geocodeError}</p>
                )}
            </div>

            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Location Map</Label>
              <div className="mt-1 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <MapDisplay 
                  coordinates={mapCoordinates}
                  storeName={storeData.storeName} 
                />
              </div>
              {!isGeocoding && !mapCoordinates && storeData.address && !geocodeError && (
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter a valid address to see the location on the map.</p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <Button 
                className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                onClick={handleSaveChanges}
                disabled={isSaving.storeInfo || isGeocoding}
              >
                {isSaving.storeInfo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column (Business Hours & Delivery Settings) */}
      <div className="space-y-6">
        {/* Business Hours Card */}
        <Card className="shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Business Hours</CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Set your store's operating hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {businessHours.map(item => (
              <div key={item.day} className="flex items-center justify-between gap-2">
                <div className="flex items-center flex-1 min-w-0">
                  <Switch
                    id={`enabled-${item.day}`}
                    checked={item.enabled}
                    onCheckedChange={(checked) => handleBusinessHourChange(item.day, 'enabled', checked)}
                    className="mr-3 data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500"
                  />
                  <Label htmlFor={`enabled-${item.day}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 truncate">
                    {item.day}
                  </Label>
                </div>
                <div className={`flex items-center gap-1.5 ${!item.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Select 
                    value={item.open}
                    onValueChange={(value) => handleBusinessHourChange(item.day, 'open', value)}
                    disabled={!item.enabled}
                  >
                    <SelectTrigger className="w-[90px] h-8 text-xs">
                      <SelectValue placeholder="Open" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={`open-${item.day}-${time}`} value={time} className="text-xs">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">to</span>
                  <Select 
                    value={item.close}
                    onValueChange={(value) => handleBusinessHourChange(item.day, 'close', value)}
                    disabled={!item.enabled}
                  >
                    <SelectTrigger className="w-[90px] h-8 text-xs">
                      <SelectValue placeholder="Close" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={`close-${item.day}-${time}`} value={time} className="text-xs">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <Button 
                size="sm" 
                className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                onClick={handleSaveBusinessHours}
                disabled={isSaving.businessHours}
              >
                {isSaving.businessHours ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Hours"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings Card */}
        <Card className="shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Delivery Settings</CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Configure delivery options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="deliveryRadius" className="text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Radius (km)</Label>
              <Input
                id="deliveryRadius"
                name="deliveryRadius"
                type="number"
                className="w-20 text-sm"
                value={deliverySettings.deliveryRadius}
                onChange={(e) => handleDeliverySettingChange('deliveryRadius', e.target.value)}
                min="1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="freeDelivery" className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Delivery</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">For orders above ₹{deliverySettings.freeDeliveryThreshold}</p>
              </div>
              <Switch
                id="freeDelivery"
                checked={deliverySettings.freeDelivery}
                onCheckedChange={(checked) => handleDeliverySettingChange('freeDelivery', checked)}
                className="data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="expressDelivery" className="text-sm font-medium text-gray-700 dark:text-gray-300">Express Delivery</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Deliver within {deliverySettings.expressDeliveryTime} minutes</p>
              </div>
              <Switch
                id="expressDelivery"
                checked={deliverySettings.expressDelivery}
                onCheckedChange={(checked) => handleDeliverySettingChange('expressDelivery', checked)}
                className="data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <Button 
                size="sm" 
                className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                onClick={handleSaveDeliverySettings}
                disabled={isSaving.deliverySettings}
              >
                {isSaving.deliverySettings ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 