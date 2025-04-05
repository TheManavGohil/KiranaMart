"use client"

import { useState } from "react"
import {
  Plus, 
  Edit, 
  Trash, 
  Sparkles, // Example icon for Fruits & Vegetables
  Milk,      // Example icon for Dairy & Bakery
  ShoppingBasket, // Example icon for Pantry
  Cookie,    // Example icon for Snacks & Drinks
  SprayCan,  // Example icon for Beauty & Personal Care
  Home,      // Example icon for Household Essentials
  X,         // Close icon
  PackageCheck // For empty state
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog" // Import Dialog components
import Image from "next/image" // Import Image for product display
// Link is no longer needed if we use a modal
// import Link from "next/link"

// --- Re-defined mock product data (similar to products page) ---
// In a real app, this data would likely come from a shared context or API call
const mockProducts = Array(20)
  .fill(null)
  .map((_, i) => ({
    id: `prod-${i + 1}`,
    name: `Product Item ${i + 1}`,
    // Distribute categories somewhat matching the main categories
    category: 
      i < 4 ? "Fruits & Vegetables" :
      i < 8 ? "Dairy & Bakery" :
      i < 11 ? "Pantry" :
      i < 14 ? "Snacks & Drinks" :
      i < 17 ? "Beauty & Personal Care" :
      "Household Essentials",
    stock: Math.floor(Math.random() * 100),
    imageUrl: "/placeholder.png", 
    price: (Math.random() * 10 + 5).toFixed(2),
  }))
// --- End Mock Product Data ---

// Mock Category Data (keep as is)
const mockCategories = [
  {
    id: "cat-1",
    name: "Fruits & Vegetables",
    icon: Sparkles,
    subcategories: ["Fresh Fruits", "Fresh Vegetables", "Herbs & Seasonings", "Organic"],
    productCount: mockProducts.filter(p => p.category === "Fruits & Vegetables").length, // Calculate count dynamically
    color: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/30",
  },
  {
    id: "cat-2",
    name: "Dairy & Bakery",
    icon: Milk,
    subcategories: ["Milk", "Cheese", "Yogurt", "Eggs", "Butter"],
    productCount: mockProducts.filter(p => p.category === "Dairy & Bakery").length,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
  },
   {
    id: "cat-3",
    name: "Pantry",
    icon: ShoppingBasket,
    subcategories: ["Rice & Grains", "Pasta & Noodles", "Cooking Oils", "Spices & Seasonings"],
    productCount: mockProducts.filter(p => p.category === "Pantry").length,
    color: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/30",
  },
   {
    id: "cat-4",
    name: "Snacks & Drinks",
    icon: Cookie,
    subcategories: ["Chips & Namkeen", "Soft Drinks", "Juices", "Tea & Coffee"],
    productCount: mockProducts.filter(p => p.category === "Snacks & Drinks").length,
    color: "text-yellow-500 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
  },
   {
    id: "cat-5",
    name: "Beauty & Personal Care",
    icon: SprayCan,
    subcategories: ["Skin Care", "Hair Care", "Hygiene & Grooming"],
    productCount: mockProducts.filter(p => p.category === "Beauty & Personal Care").length,
    color: "text-pink-500 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-900/30",
  },
   {
    id: "cat-6",
    name: "Household Essentials",
    icon: Home,
    subcategories: ["Cleaning Supplies", "Laundry", "Kitchen Essentials"],
    productCount: mockProducts.filter(p => p.category === "Household Essentials").length,
    color: "text-purple-500 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/30",
  },
]

export default function InventoryCategoriesPage() {
  const [categories, setCategories] = useState(mockCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [categoryProducts, setCategoryProducts] = useState<any[]>([])

  const handleDeleteCategory = (id: string) => {
     console.log("Deleting category:", id)
     // Add confirmation logic
     setCategories(prev => prev.filter(cat => cat.id !== id))
  }

  const handleShowDetails = (category: any) => {
    setSelectedCategory(category)
    // Filter mock products based on the selected category name
    const products = mockProducts.filter(p => p.category === category.name)
    setCategoryProducts(products)
    setIsModalOpen(true)
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Product Categories</h2>
        <Button className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Card key={category.id} className="shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${category.bgColor}`}>
                     <Icon className={`h-6 w-6 ${category.color}`} />
                   </div>
                   <div>
                      <CardTitle className={`text-lg font-semibold ${category.color}`}>{category.name}</CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{category.subcategories.length} subcategories</p>
                   </div>
                </div>
                <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">{category.productCount} products</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {category.subcategories.map((sub) => (
                    <Badge key={sub} variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                      {sub}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700/50 pt-3">
                   <Button 
                      variant="outline" 
                      size="sm" 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                      onClick={() => handleShowDetails(category)}
                    >
                      Show Details
                    </Button>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700">
                      <Edit className="h-4 w-4" />
                    </Button>
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-700"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          {selectedCategory && (
            <>
              <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                   <selectedCategory.icon className={`mr-3 h-6 w-6 ${selectedCategory.color}`} /> 
                   Products in {selectedCategory.name}
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  Showing {categoryProducts.length} product(s) found in this category.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
                {categoryProducts.length > 0 ? (
                  <ul className="space-y-3">
                    {categoryProducts.map((product) => (
                      <li key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                            <Image src={product.imageUrl || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">{product.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Stock: {product.stock}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-200">₹{product.price}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <PackageCheck className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    <p>No products found in this category.</p>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600">Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 