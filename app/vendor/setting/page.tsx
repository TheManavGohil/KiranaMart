"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

// Mock initial store data
const initialStoreData = {
  storeName: "Fresh Mart Groceries",
  storeId: "STORE-001",
  storeDescription: "Fresh Mart Groceries offers a wide range of fresh produce, groceries, and household essentials with quick delivery.",
  phoneNumber: "+91 98765 43210",
  email: "contact@freshmart.com",
  address: "123 Main Street, Koramangala, Bangalore - 560034",
}

// Mock initial business hours
const initialBusinessHours = [
  { day: "Monday", open: "08:00", close: "22:00", enabled: true },
  { day: "Tuesday", open: "08:00", close: "22:00", enabled: true },
  { day: "Wednesday", open: "08:00", close: "22:00", enabled: true },
  { day: "Thursday", open: "08:00", close: "22:00", enabled: true },
  { day: "Friday", open: "08:00", close: "22:00", enabled: true },
  { day: "Saturday", open: "09:00", close: "20:00", enabled: true },
  { day: "Sunday", open: "10:00", close: "18:00", enabled: false },
]

// Mock initial delivery settings
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

export default function StoreSettingsPage() {
  const [storeData, setStoreData] = useState(initialStoreData)
  const [businessHours, setBusinessHours] = useState(initialBusinessHours)
  const [deliverySettings, setDeliverySettings] = useState(initialDeliverySettings)
  const timeOptions = generateTimeOptions()

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

  const handleSaveChanges = () => {
    console.log("Saving store information:", storeData)
    // Add API call logic here
  }

  const handleSaveBusinessHours = () => {
    console.log("Saving business hours:", businessHours)
    // Add API call logic here
  }

  const handleSaveDeliverySettings = () => {
    console.log("Saving delivery settings:", deliverySettings)
    // Add API call logic here
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
                value={storeData.address}
                onChange={handleStoreDataChange}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <Button 
                className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                onClick={handleSaveChanges}
              >
                Save Changes
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
              >
                Save Hours
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
              >
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 