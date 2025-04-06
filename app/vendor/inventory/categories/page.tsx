"use client"

import React, { useState, useEffect } from "react"
import {
  Plus, 
  Edit, 
  Trash, 
  Sparkles,
  Milk,
  ShoppingBasket,
  Cookie,
  SprayCan,
  Home,
  X,
  PackageCheck,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { apiCall } from '@/lib/api'
import { toast } from "sonner"

// Icon mapping for categories
const iconMapping = {
  Sparkles: Sparkles,
  Milk: Milk,
  ShoppingBasket: ShoppingBasket,
  Cookie: Cookie,
  SprayCan: SprayCan,
  Home: Home
};

// Default icon if the string doesn't match any in our mapping
const DefaultIcon = ShoppingBasket;

// Interface for Category
interface Category {
  _id: string;
  name: string;
  icon: string;
  subcategories: string[];
  productCount: number;
  color: string;
  bgColor: string;
  vendorId: string;
}

// Interface for Product
interface Product {
  _id: string;
  name: string;
  categoryId: string;
  stock: number;
  imageUrl: string;
  price: number;
  unit: string;
  description: string;
  vendorId: string;
}

// Interface for new product
interface NewProduct {
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  unit: string;
  description: string;
}

// Interface for new category
interface NewCategory {
  name: string;
  icon: string;
  subcategories: string[];
  color: string;
  bgColor: string;
}

export default function InventoryCategoriesPage() {
  // State for categories and products
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for category modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  
  // State for add/edit category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: "",
    icon: "ShoppingBasket",
    subcategories: [],
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  })
  const [currentSubcategory, setCurrentSubcategory] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null)
  
  // State for add product to category modal
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    price: 0,
    stock: 0,
    imageUrl: "/placeholder.svg",
    unit: "kg",
    description: ""
  })
  
  // State for saving actions
  const [isSaving, setIsSaving] = useState(false)

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Function to fetch categories from API
  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await apiCall<Category[]>('/api/vendor/inventory/categories')
      
      // If no categories exist yet, create default categories
      if (data.length === 0) {
        await createDefaultCategories()
        const updatedData = await apiCall<Category[]>('/api/vendor/inventory/categories')
        setCategories(updatedData || [])
      } else {
        setCategories(data || [])
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err)
      setError(err.message || "Failed to load categories")
      toast.error(`Error: ${err.message || "Failed to load categories"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to create default categories for new vendors
  const createDefaultCategories = async () => {
    try {
      const defaultCategories = [
        {
          name: "Fruits & Vegetables",
          icon: "Sparkles",
          subcategories: ["Fresh Fruits", "Fresh Vegetables", "Herbs & Seasonings", "Organic"],
          color: "text-red-500",
          bgColor: "bg-red-50"
        },
        {
          name: "Dairy & Bakery",
          icon: "Milk",
          subcategories: ["Milk", "Cheese", "Yogurt", "Eggs", "Butter"],
          color: "text-blue-500",
          bgColor: "bg-blue-50"
        },
        {
          name: "Pantry",
          icon: "ShoppingBasket",
          subcategories: ["Rice & Grains", "Pasta & Noodles", "Cooking Oils", "Spices & Seasonings"],
          color: "text-orange-500",
          bgColor: "bg-orange-50"
        },
        {
          name: "Snacks & Drinks",
          icon: "Cookie",
          subcategories: ["Chips & Namkeen", "Soft Drinks", "Juices", "Tea & Coffee"],
          color: "text-yellow-500",
          bgColor: "bg-yellow-50"
        },
        {
          name: "Beauty & Personal Care",
          icon: "SprayCan",
          subcategories: ["Skin Care", "Hair Care", "Hygiene & Grooming"],
          color: "text-pink-500",
          bgColor: "bg-pink-50"
        },
        {
          name: "Household Essentials",
          icon: "Home",
          subcategories: ["Cleaning Supplies", "Laundry", "Kitchen Essentials"],
          color: "text-purple-500",
          bgColor: "bg-purple-50"
        }
      ]
      
      // Create each default category
      for (const category of defaultCategories) {
        await apiCall('/api/vendor/inventory/categories', {
          method: 'POST',
          body: JSON.stringify(category)
        })
      }
      
      toast.success("Default categories have been created")
    } catch (err: any) {
      console.error("Error creating default categories:", err)
      toast.error(`Error: ${err.message || "Failed to create default categories"}`)
    }
  }

  // Function to fetch products for a category
  const fetchCategoryProducts = async (categoryId: string) => {
    try {
      setIsLoadingProducts(true)
      
      const data = await apiCall<Product[]>(`/api/vendor/inventory/categories/products?categoryId=${categoryId}`)
      setCategoryProducts(data || [])
    } catch (err: any) {
      console.error("Error fetching category products:", err)
      toast.error(`Error: ${err.message || "Failed to load products"}`)
      setCategoryProducts([])
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Handle add subcategory
  const handleAddSubcategory = () => {
    if (currentSubcategory.trim() !== '') {
      setNewCategory(prev => ({
        ...prev,
        subcategories: [...prev.subcategories, currentSubcategory.trim()]
      }))
      setCurrentSubcategory("")
    }
  }

  // Handle remove subcategory
  const handleRemoveSubcategory = (index: number) => {
    setNewCategory(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index)
    }))
  }

  // Function to delete a category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsLoading(true);
      
      await apiCall(`/api/vendor/inventory/categories?id=${categoryId}`, {
        method: 'DELETE'
      });
      
      // Remove the category from the state
      setCategories(prev => prev.filter(cat => cat._id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to edit a category
  const handleEditCategory = (category: Category) => {
    setIsEditMode(true)
    setEditCategoryId(category._id)
    setNewCategory({
      name: category.name,
      icon: category.icon,
      subcategories: [...category.subcategories],
      color: category.color,
      bgColor: category.bgColor
    })
    setIsCategoryModalOpen(true)
  }
  
  // Function to save category (create new or update existing)
  const handleSaveCategory = async () => {
    if (!newCategory.name) {
      toast.error("Category name is required")
      return
    }
    
    try {
      setIsSaving(true)
      
      if (isEditMode && editCategoryId) {
        // Update existing category
        await apiCall(`/api/vendor/inventory/categories?id=${editCategoryId}`, {
          method: 'PUT',
          body: JSON.stringify(newCategory)
        })
        
        // Update the local state
        setCategories(prev => prev.map(cat => 
          cat._id === editCategoryId
            ? {
                ...cat,
                name: newCategory.name,
                icon: newCategory.icon,
                subcategories: newCategory.subcategories,
                color: newCategory.color,
                bgColor: newCategory.bgColor
              }
            : cat
        ))
        
        toast.success("Category updated successfully")
      } else {
        // Create new category
        const response = await apiCall<Category>('/api/vendor/inventory/categories', {
          method: 'POST',
          body: JSON.stringify(newCategory)
        })
        
        setCategories(prev => [...prev, response])
        toast.success("Category added successfully")
      }
      
      // Close modal and reset form
      setIsCategoryModalOpen(false)
      setIsEditMode(false)
      setEditCategoryId(null)
      setNewCategory({
        name: "",
        icon: "ShoppingBasket",
        subcategories: [],
        color: "text-blue-500",
        bgColor: "bg-blue-50"
      })
    } catch (err: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} category:`, err)
      toast.error(`Error: ${err.message || `Failed to ${isEditMode ? 'update' : 'add'} category`}`)
    } finally {
      setIsSaving(false)
    }
  }
  
  // Function to open the Add Category modal
  const handleAddCategoryClick = () => {
    setIsEditMode(false)
    setEditCategoryId(null)
    setNewCategory({
      name: "",
      icon: "ShoppingBasket",
      subcategories: [],
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    })
    setIsCategoryModalOpen(true)
  }

  // Function to add a product to a category
  const handleAddProduct = async () => {
    if (!selectedCategory) return
    
    if (!newProduct.name || newProduct.price <= 0) {
      toast.error("Product name and price are required")
      return
    }
    
    try {
      setIsSaving(true)
      
      const response = await apiCall(`/api/vendor/inventory/categories/products?categoryId=${selectedCategory._id}`, {
        method: 'POST',
        body: JSON.stringify(newProduct)
      })
      
      // Refetch products for the category
      await fetchCategoryProducts(selectedCategory._id)
      
      // Update product count in the category
      setCategories(prev => prev.map(cat => 
        cat._id === selectedCategory._id 
          ? { ...cat, productCount: cat.productCount + 1 } 
          : cat
      ))
      
      toast.success("Product added successfully")
      setIsAddProductModalOpen(false)
      
      // Reset form
      setNewProduct({
        name: "",
        price: 0,
        stock: 0,
        imageUrl: "/placeholder.svg",
        unit: "kg",
        description: ""
      })
    } catch (err: any) {
      console.error("Error adding product:", err)
      toast.error(`Error: ${err.message || "Failed to add product"}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Function to show details of a category
  const handleShowDetails = (category: Category) => {
    setSelectedCategory(category)
    fetchCategoryProducts(category._id)
    setIsProductModalOpen(true)
  }

  // Get the icon component for a category
  const getCategoryIcon = (iconName: string) => {
    const IconComponent = iconMapping[iconName as keyof typeof iconMapping] || DefaultIcon
    return IconComponent
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading categories...</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait while we fetch your inventory categories.</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Error Loading Categories</h3>
          <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>
          <Button 
            onClick={fetchCategories} 
            className="mt-4 bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Product Categories</h2>
        <Button 
          className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          onClick={handleAddCategoryClick}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md border border-gray-100 dark:border-gray-700/50 text-center">
          <ShoppingBasket className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Categories Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first product category to organize your inventory</p>
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            onClick={handleAddCategoryClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add First Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon)
            return (
              <Card key={category._id} className="shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-700"
                        onClick={() => handleDeleteCategory(category._id)}
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
      )}

      {/* Products Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          {selectedCategory && (
            <>
              <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  {(() => {
                    const Icon = getCategoryIcon(selectedCategory.icon);
                    return <Icon className={`mr-3 h-6 w-6 ${selectedCategory.color}`} />;
                  })()}
                  Products in {selectedCategory.name}
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400 flex justify-between items-center">
                  <span>Showing {categoryProducts.length} product(s) found in this category.</span>
                  <Button 
                    size="sm" 
                    className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                    onClick={() => {
                      setIsAddProductModalOpen(true)
                      setIsProductModalOpen(false)
                    }}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Product
                  </Button>
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-green-500 mr-2" />
                    <span className="text-gray-500 dark:text-gray-400">Loading products...</span>
                  </div>
                ) : categoryProducts.length > 0 ? (
                  <ul className="space-y-3">
                    {categoryProducts.map((product) => (
                      <li key={product._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                            <Image src={product.imageUrl || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">{product.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Stock: {product.stock}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-200">₹{parseFloat(product.price.toString()).toFixed(2)}</span>
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
                <Button variant="outline" onClick={() => setIsProductModalOpen(false)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600">Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Create a new product category for your inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="categoryName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Name*
              </Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="mt-1"
                placeholder="e.g., Fruits & Vegetables"
              />
            </div>

            <div>
              <Label htmlFor="categoryIcon" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Icon
              </Label>
              <Select
                value={newCategory.icon}
                onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sparkles">Fruits & Vegetables</SelectItem>
                  <SelectItem value="Milk">Dairy & Bakery</SelectItem>
                  <SelectItem value="ShoppingBasket">Pantry</SelectItem>
                  <SelectItem value="Cookie">Snacks & Drinks</SelectItem>
                  <SelectItem value="SprayCan">Beauty & Personal Care</SelectItem>
                  <SelectItem value="Home">Household Essentials</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Subcategories
              </Label>
              <div className="flex mt-1">
                <Input
                  value={currentSubcategory}
                  onChange={(e) => setCurrentSubcategory(e.target.value)}
                  placeholder="e.g., Fresh Fruits"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => handleAddSubcategory()}
                  className="ml-2 bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                  disabled={!currentSubcategory.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {newCategory.subcategories.map((sub, index) => (
                  <Badge key={index} variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
                    {sub}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(index)}
                      className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={!newCategory.name || isSaving}
              className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  {isEditMode ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                isEditMode ? "Update Category" : "Add Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={isAddProductModalOpen} onOpenChange={setIsAddProductModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Add Product to {selectedCategory?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Add a new product to this category.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="productName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Name*
              </Label>
              <Input
                id="productName"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="mt-1"
                placeholder="e.g., Apple"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price*
                </Label>
                <Input
                  id="productPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="productUnit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit
                </Label>
                <Select
                  value={newProduct.unit}
                  onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                >
                  <SelectTrigger id="productUnit" className="mt-1">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="pieces">pieces</SelectItem>
                    <SelectItem value="pack">pack</SelectItem>
                    <SelectItem value="dozen">dozen</SelectItem>
                    <SelectItem value="liter">liter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="productStock" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Initial Stock
              </Label>
              <Input
                id="productStock"
                type="number"
                min="0"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="productImage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Image URL
              </Label>
              <Input
                id="productImage"
                value={newProduct.imageUrl}
                onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                className="mt-1"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="productDescription" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="productDescription"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="mt-1"
                placeholder="Product description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddProductModalOpen(false);
                setIsProductModalOpen(true);
              }}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={!newProduct.name || newProduct.price <= 0 || isSaving}
              className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 