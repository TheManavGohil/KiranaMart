"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Search, Edit, Trash, Filter, ArrowUpDown } from "lucide-react"
import FormInput from "@/components/form-input"

// Mock data for products
const mockProducts = Array(10)
  .fill(null)
  .map((_, i) => ({
    id: `p${i + 1}`,
    name: `Product ${i + 1}`,
    category: i % 3 === 0 ? "Fruits" : i % 3 === 1 ? "Vegetables" : "Dairy",
    price: (4.99 + i * 0.5).toFixed(2),
    stock: 10 + i * 3,
    imageUrl: "/placeholder.png",
  }))

export default function VendorProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", "Fruits", "Vegetables", "Dairy", "Bakery", "Grains"]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts((prev) => prev.filter((product) => product.id !== id))
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add New Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <select
                className="form-input py-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn-secondary flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4">Image</th>
                <th className="text-left py-3 px-4">
                  <button className="flex items-center">
                    Product
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button className="flex items-center">
                    Category
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button className="flex items-center">
                    Price
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button className="flex items-center">
                    Stock
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden">
                      <Image
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4">{product.category}</td>
                  <td className="py-3 px-4">${product.price}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`${Number.parseInt(product.stock.toString()) <= 5 ? "text-red-600" : "text-green-600"}`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-8 text-center text-gray-500">No products found matching your criteria.</div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
          <div className="text-gray-500 text-sm">
            Showing 1-{filteredProducts.length} of {filteredProducts.length} products
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 border rounded-md bg-green-500 text-white">1</button>
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New Product</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Product Name" id="name" type="text" placeholder="Enter product name" required />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="form-input py-2" required>
                      <option value="">Select category</option>
                      {categories
                        .filter((c) => c !== "All")
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                  </div>

                  <FormInput label="Price" id="price" type="number" step="0.01" min="0" placeholder="0.00" required />

                  <FormInput label="Stock Quantity" id="stock" type="number" min="0" placeholder="0" required />

                  <div className="md:col-span-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="form-input"
                      rows={4}
                      placeholder="Enter product description"
                      required
                    ></textarea>
                  </div>

                  <div className="md:col-span-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                      <input type="file" className="hidden" id="product-image" accept="image/*" />
                      <label htmlFor="product-image" className="cursor-pointer text-green-600 hover:text-green-700">
                        Click to upload or drag and drop
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

