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
    description: `This is a description for Product ${i + 1}. It's a high-quality item in the ${i % 3 === 0 ? "Fruits" : i % 3 === 1 ? "Vegetables" : "Dairy"} category.`,
    unit: i % 4 === 0 ? "kg" : i % 4 === 1 ? "pack" : i % 4 === 2 ? "dozen" : "piece",
  }))

export default function VendorProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedProduct, setSelectedProduct] = useState<null | any>(null)
  const [editedProduct, setEditedProduct] = useState<any>(null)

  const categories = ["All", "Fruits", "Vegetables", "Dairy", "Bakery", "Grains"]
  const units = ["kg", "g", "pack", "dozen", "piece", "liter", "ml", "bundle"]

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

  const handleEdit = (product: any) => {
    setSelectedProduct(product)
    setEditedProduct({...product})
    setIsEditModalOpen(true)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setEditedProduct((prev: any) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? 
        parseFloat(value) || 0 : 
        value
    }))
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editedProduct) return
    
    setProducts((prev) =>
      prev.map((product) =>
        product.id === selectedProduct.id ? { ...editedProduct } : product
      )
    )
    
    setIsEditModalOpen(false)
  }

  const isFieldModified = (fieldName: string) => {
    if (!selectedProduct || !editedProduct) return false
    
    if (fieldName === "price" || fieldName === "stock") {
      return parseFloat(selectedProduct[fieldName]) !== parseFloat(editedProduct[fieldName])
    }
    
    return selectedProduct[fieldName] !== editedProduct[fieldName]
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="border-b-4 border-green-500 pb-1">Product Management</span>
        </h1>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Add New Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="form-input pl-10 w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <div>
              <select
                className="form-input py-2 rounded-lg border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all"
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

            <button className="btn-secondary flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all border border-gray-300">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Image</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button className="flex items-center hover:text-green-600 transition-colors">
                    Product
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button className="flex items-center hover:text-green-600 transition-colors">
                    Category
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button className="flex items-center hover:text-green-600 transition-colors">
                    Price
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button className="flex items-center hover:text-green-600 transition-colors">
                    Stock
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-200">
                      <Image
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{product.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">${product.price}/{product.unit}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`${Number.parseInt(product.stock.toString()) <= 5 ? "text-red-600" : "text-green-600"} font-medium`}
                    >
                      {product.stock}
                    </span>
                    {Number.parseInt(product.stock.toString()) <= 5 && (
                      <span className="ml-2 text-xs inline-block px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium">
                        Low Stock
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
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
          <div className="py-12 text-center text-gray-500">
            <Trash className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No products found matching your criteria.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-gray-500 text-sm">
            Showing 1-{filteredProducts.length} of {filteredProducts.length} products
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50 transition-colors">Previous</button>
            <button className="px-3 py-1 border rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors">1</button>
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50 transition-colors">2</button>
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 animate-slideUp">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  ✕
                </button>
              </div>

              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Product Name" id="name" type="text" placeholder="Enter product name" required />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      className="form-input py-2 w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all"
                      required
                    >
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
                      className="form-input w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all"
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
                  <button 
                    type="button" 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" 
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Create Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 animate-slideUp">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex items-center mb-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden mr-4 border border-gray-200">
                      <Image
                        src={selectedProduct.imageUrl || "/placeholder.svg"}
                        alt={selectedProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">Product ID: {selectedProduct.id}</h3>
                      <p className="text-sm text-gray-500">Edit product details below</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      className={`form-input w-full rounded-lg border-gray-300 focus:ring focus:ring-opacity-50 transition-all ${
                        isFieldModified("name") ? "border-green-500 focus:border-green-500 focus:ring-green-200" : "focus:border-gray-400 focus:ring-gray-200"
                      }`}
                      name="name"
                      value={editedProduct.name}
                      onChange={handleEditChange}
                      required
                    />
                    {isFieldModified("name") && (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Modified
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className={`form-input w-full rounded-lg border-gray-300 focus:ring focus:ring-opacity-50 transition-all ${
                        isFieldModified("category") ? "border-green-500 focus:border-green-500 focus:ring-green-200" : "focus:border-gray-400 focus:ring-gray-200"
                      }`}
                      name="category"
                      value={editedProduct.category}
                      onChange={handleEditChange}
                      required
                    >
                      {categories
                        .filter((c) => c !== "All")
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                    {isFieldModified("category") && (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Modified
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`form-input w-full rounded-lg border-gray-300 focus:ring focus:ring-opacity-50 transition-all ${
                        isFieldModified("price") ? "border-green-500 focus:border-green-500 focus:ring-green-200" : "focus:border-gray-400 focus:ring-gray-200"
                      }`}
                      name="price"
                      value={editedProduct.price}
                      onChange={handleEditChange}
                      required
                    />
                    {isFieldModified("price") && (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Modified from ${selectedProduct.price}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      className={`form-input w-full rounded-lg border-gray-300 focus:ring focus:ring-opacity-50 transition-all ${
                        isFieldModified("unit") ? "border-green-500 focus:border-green-500 focus:ring-green-200" : "focus:border-gray-400 focus:ring-gray-200"
                      }`}
                      name="unit"
                      value={editedProduct.unit}
                      onChange={handleEditChange}
                      required
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    {isFieldModified("unit") && (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Modified
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      className={`form-input w-full rounded-lg border-gray-300 focus:ring focus:ring-opacity-50 transition-all ${
                        isFieldModified("stock") ? "border-green-500 focus:border-green-500 focus:ring-green-200" : "focus:border-gray-400 focus:ring-gray-200"
                      }`}
                      name="stock"
                      value={editedProduct.stock}
                      onChange={handleEditChange}
                      required
                    />
                    {isFieldModified("stock") && (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Modified from {selectedProduct.stock}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className={`form-input w-full rounded-lg border-gray-300 focus:ring focus:ring-opacity-50 transition-all ${
                        isFieldModified("description") ? "border-green-500 focus:border-green-500 focus:ring-green-200" : "focus:border-gray-400 focus:ring-gray-200"
                      }`}
                      name="description"
                      rows={3}
                      value={editedProduct.description}
                      onChange={handleEditChange}
                      required
                    />
                    {isFieldModified("description") && (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Modified
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 mb-4 border-t pt-4">
                    <h4 className="font-medium mb-2 text-gray-800">Summary of Changes</h4>
                    {Object.keys(editedProduct).some(key => isFieldModified(key)) ? (
                      <ul className="text-sm text-gray-600 bg-green-50 p-3 rounded-md border border-green-100">
                        {isFieldModified("name") && <li className="py-1">• Name changed</li>}
                        {isFieldModified("category") && <li className="py-1">• Category changed</li>}
                        {isFieldModified("stock") && (
                          <li className="py-1">• Stock updated from <span className="font-medium">{selectedProduct.stock}</span> to <span className="font-medium text-green-700">{editedProduct.stock}</span></li>
                        )}
                        {isFieldModified("price") && (
                          <li className="py-1">• Price updated from <span className="font-medium">${selectedProduct.price}</span> to <span className="font-medium text-green-700">${editedProduct.price}</span></li>
                        )}
                        {isFieldModified("unit") && (
                          <li className="py-1">• Unit changed from <span className="font-medium">{selectedProduct.unit}</span> to <span className="font-medium text-green-700">{editedProduct.unit}</span></li>
                        )}
                        {isFieldModified("description") && <li className="py-1">• Description updated</li>}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-200">No changes made yet</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!Object.keys(editedProduct).some(key => isFieldModified(key))}
                  >
                    Save Changes
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

