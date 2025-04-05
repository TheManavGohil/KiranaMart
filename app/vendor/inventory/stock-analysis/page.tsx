"use client"

import { useState } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

// Mock Data for Stock Levels
const mockStockLevels = [
  { id: "p1", name: "Organic Bananas", category: "Fruits", stock: 55, threshold: 10, imageUrl: "/placeholder.png" },
  { id: "p2", name: "Fresh Milk (1L)", category: "Dairy", stock: 8, threshold: 15, imageUrl: "/placeholder.png" }, // Low stock
  { id: "p3", name: "Whole Wheat Bread", category: "Bakery", stock: 32, threshold: 20, imageUrl: "/placeholder.png" },
  { id: "p4", name: "Red Apples (kg)", category: "Fruits", stock: 120, threshold: 25, imageUrl: "/placeholder.png" },
  { id: "p5", name: "Free-range Eggs (12)", category: "Dairy", stock: 0, threshold: 10, imageUrl: "/placeholder.png" }, // Out of stock
  { id: "p6", name: "Basmati Rice (5kg)", category: "Pantry", stock: 40, threshold: 15, imageUrl: "/placeholder.png" },
];

// Mock Data for Expiry Analysis
const mockExpiryData = [
  { id: "p2", name: "Fresh Milk (1L)", expiryDate: "2024-08-18", daysLeft: 3, stock: 8, batch: "B123" },
  { id: "p7", name: "Fresh Paneer (200g)", expiryDate: "2024-08-25", daysLeft: 10, stock: 15, batch: "P456" },
  { id: "p3", name: "Whole Wheat Bread", expiryDate: "2024-09-01", daysLeft: 17, stock: 32, batch: "W789" },
];

// Mock Data for Stock Movement
const mockMovementData = [
  { id: "m1", date: "2024-08-14", product: "Organic Bananas", type: "Restock", quantity: 50, balance: 55 },
  { id: "m2", date: "2024-08-14", product: "Fresh Milk (1L)", type: "Sale", quantity: -2, balance: 8 },
  { id: "m3", date: "2024-08-13", product: "Red Apples (kg)", type: "Sale", quantity: -5, balance: 120 },
  { id: "m4", date: "2024-08-13", product: "Whole Wheat Bread", type: "Restock", quantity: 20, balance: 32 },
  { id: "m5", date: "2024-08-12", product: "Basmati Rice (5kg)", type: "Adjustment", quantity: -1, reason: "Damaged", balance: 40 },
];

export default function InventoryStockAnalysisPage() {
  const [activeTab, setActiveTab] = useState("stock-levels");

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { text: "Out of Stock", color: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300" };
    if (stock <= threshold) return { text: "Low Stock", color: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400" };
    return { text: "In Stock", color: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" };
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Stock Analysis</h2>
        <p className="text-gray-600 dark:text-gray-400">Analyze your inventory stock levels and movements</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-200 dark:bg-gray-700/50 rounded-lg p-1 mb-6">
          <TabsTrigger value="stock-levels" className="px-4 py-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
            Stock Levels
          </TabsTrigger>
          <TabsTrigger value="expiry-analysis" className="px-4 py-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
            Expiry Analysis
          </TabsTrigger>
          <TabsTrigger value="stock-movement" className="px-4 py-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
            Stock Movement
          </TabsTrigger>
        </TabsList>

        {/* Stock Levels Content */}
        <TabsContent value="stock-levels">
          <Card className="shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Current Stock Levels</CardTitle>
              <CardDescription className="dark:text-gray-400">Overview of stock levels across all product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-gray-200 dark:border-gray-700">
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Stock Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStockLevels.map((item) => {
                    const status = getStockStatus(item.stock, item.threshold);
                    const progress = item.stock > item.threshold * 2 ? 100 : Math.min(100, Math.max(0, (item.stock / (item.threshold * 2)) * 100)); 
                    return (
                      <TableRow key={item.id} className="border-gray-200 dark:border-gray-700/80 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                            </div>
                            <span className="text-gray-900 dark:text-gray-100">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{item.category}</TableCell>
                        <TableCell className="text-right font-semibold text-gray-900 dark:text-gray-100">{item.stock}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${status.color} text-xs`}>{status.text}</Badge>
                        </TableCell>
                        <TableCell>
                          <Progress value={progress} className="h-2" indicatorClassName={`${status.text === 'Low Stock' ? 'bg-yellow-500' : status.text === 'Out of Stock' ? 'bg-red-500' : 'bg-green-500'}`}/>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiry Analysis Content */}
        <TabsContent value="expiry-analysis">
          <Card className="shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Expiry Analysis</CardTitle>
              <CardDescription className="dark:text-gray-400">Products approaching their expiry date (next 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-gray-200 dark:border-gray-700">
                    <TableHead>Product</TableHead>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-center">Days Left</TableHead>
                    <TableHead className="text-right">Stock Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockExpiryData.map((item) => (
                    <TableRow key={item.id} className="border-gray-200 dark:border-gray-700/80 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">{item.name}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400 font-mono text-xs">{item.batch}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{item.expiryDate}</TableCell>
                      <TableCell className={`text-center font-semibold ${item.daysLeft <= 7 ? 'text-red-500 dark:text-red-400' : item.daysLeft <= 15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.daysLeft} days
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-900 dark:text-gray-100">{item.stock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Movement Content */}
        <TabsContent value="stock-movement">
          <Card className="shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Stock Movement History</CardTitle>
              <CardDescription className="dark:text-gray-400">Log of recent inventory changes</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-gray-200 dark:border-gray-700">
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMovementData.map((item) => (
                    <TableRow key={item.id} className="border-gray-200 dark:border-gray-700/80 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <TableCell className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.date}</TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">{item.product}</TableCell>
                      <TableCell>
                         <Badge variant={item.type === 'Restock' ? 'default' : item.type === 'Sale' ? 'destructive' : 'secondary'} className={`text-xs ${item.type === 'Restock' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : item.type === 'Sale' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'dark:bg-gray-700 dark:text-gray-300'}`}> 
                           {item.type}
                         </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${item.quantity > 0 ? 'text-green-600 dark:text-green-400' : item.quantity < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-900 dark:text-gray-100">{item.balance}</TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400 text-xs italic">
                        {item.reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 