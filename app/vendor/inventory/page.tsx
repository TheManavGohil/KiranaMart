"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Search, Filter, ArrowUpDown, AlertTriangle, Edit, Truck, PackageCheck, Plus
} from "lucide-react"

// Mock inventory data
const mockInventory = Array(12)
  .fill(null)
  .map((_, i) => ({
    id: `p${i + 1}`,
    name: `Product ${i + 1}`,
    category: i % 3 === 0 ? "Fruits" : i % 3 === 1 ? "Vegetables" : "Dairy",
    stock: i % 4 === 0 ? 3 : 10 + i * 3, // Some low stock items
    imageUrl: "/placeholder.png",
    price: 5.99 + i * 0.5,
    unit: i % 3 === 0 ? "kg" : i % 3 === 1 ? "bundle" : "pack",
    description: `Description for Product ${i + 1}. This is a sample product description.`,
    lastRestocked: new Date(Date.now() - (i * 2 + 1) * 86400000).toISOString().split("T")[0],
  }))

export default function VendorInventoryProductsPage() {
  const [inventory, setInventory] = useState(mockInventory)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [showLowStock, setShowLowStock] = useState(false)
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [restockAmount, setRestockAmount] = useState("")
  const [editedProduct, setEditedProduct] = useState<any>(null)

  const categories = ["All", "Fruits", "Vegetables", "Dairy", "Bakery", "Grains"]
  const units = ["kg", "g", "pack", "bundle", "dozen", "piece", "liter"]

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
    const matchesLowStock = showLowStock ? item.stock <= 5 : true
    return matchesSearch && matchesCategory && matchesLowStock
  })

  const openRestockModal = (product: any) => {
    setSelectedProduct(product)
    setRestockAmount("")
    setIsRestockModalOpen(true)
  }

  const openEditModal = (product: any) => {
    setSelectedProduct(product)
    setEditedProduct({...product})
    setIsEditModalOpen(true)
  }

  const handleRestock = () => {
    if (!selectedProduct || !restockAmount) return

    const amount = Number.parseInt(restockAmount)
    if (isNaN(amount) || amount <= 0) return

    setInventory((prev) =>
      prev.map((item) =>
        item.id === selectedProduct.id
          ? {
              ...item,
              stock: item.stock + amount,
              lastRestocked: new Date().toISOString().split("T")[0],
            }
          : item,
      ),
    )

    setIsRestockModalOpen(false)
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

  const isFieldModified = (fieldName: string) => {
    if (!selectedProduct || !editedProduct) return false
    
    if (fieldName === "price" || fieldName === "stock") {
      return parseFloat(selectedProduct[fieldName]) !== parseFloat(editedProduct[fieldName])
    }
    
    return selectedProduct[fieldName] !== editedProduct[fieldName]
  }

  const handleSaveEdit = () => {
    if (!editedProduct) return

    setInventory((prev) =>
      prev.map((item) =>
        item.id === selectedProduct.id ? { 
          ...editedProduct,
          lastRestocked: 
            isFieldModified("stock") ? new Date().toISOString().split("T")[0] : item.lastRestocked
        } : item
      )
    )

    setIsEditModalOpen(false)
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <div/>
        <button className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all dark:bg-green-500 dark:hover:bg-green-600">
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500 dark:border-green-400 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Products</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800 dark:text-gray-100">{inventory.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
              <PackageCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500 dark:border-red-400 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Low Stock Items</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800 dark:text-gray-100">{inventory.filter((item) => item.stock <= 5).length}</h3>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500 dark:border-blue-400 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Restocked Today</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800 dark:text-gray-100">{inventory.filter(item => item.lastRestocked === new Date().toISOString().split("T")[0]).length}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-500 dark:border-yellow-400 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Out of Stock</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800 dark:text-gray-100">{inventory.filter((item) => item.stock === 0).length}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md mb-6 border border-gray-100 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products in table..."
                className="form-input pl-10 w-full rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <div>
              <select
                className="form-input py-2 rounded-lg w-full md:w-auto"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    Category: {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="low-stock"
                className="mr-2 h-4 w-4 rounded text-green-600 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-green-500"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              <label htmlFor="low-stock" className="text-gray-700 dark:text-gray-300 text-sm">Low Stock Only</label>
            </div>
            <button className="btn-secondary flex items-center justify-center px-4 py-2 rounded-lg text-sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Image</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Product
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Category
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Price
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Stock
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Last Restocked
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                      <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100">{item.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100">₹{item.price.toFixed(2)}/{item.unit}</td>
                  <td className="py-3 px-4">
                    <span className={`${item.stock <= 5 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"} font-medium`}>{item.stock}</span>
                    {item.stock <= 5 && (
                      <span className="ml-2 text-xs inline-block px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-full font-medium">
                        {item.stock === 0 ? "Out of Stock" : "Low Stock"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.lastRestocked}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => openRestockModal(item)}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-full transition-colors"
                        aria-label={`Restock ${item.name}`}
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <PackageCheck className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-lg font-medium">No inventory found matching your criteria.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {isRestockModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 animate-slideUp border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-green-500"/> Restock Product
                </h2>
                <button onClick={() => setIsRestockModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Product:</span> {selectedProduct.name}</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Current Stock:</span> {selectedProduct.stock}</p>
              </div>

              <div className="mb-4">
                <label htmlFor="restock-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity to Add</label>
                <input
                  type="number"
                  id="restock-amount"
                  className="form-input"
                  min="1"
                  placeholder="Enter quantity"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsRestockModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  onClick={handleRestock}
                  disabled={!restockAmount || Number.parseInt(restockAmount) <= 0}
                >
                  Add Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-4 animate-slideUp border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                 <Edit className="mr-2 h-5 w-5 text-blue-500"/> Edit Product Details
                </h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => {e.preventDefault(); handleSaveEdit();}}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                   <div className="md:col-span-2 flex items-center mb-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden mr-4 border border-gray-200 dark:border-gray-600">
                      <Image
                        src={editedProduct.imageUrl || "/placeholder.svg"}
                        alt={editedProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">Product ID: {editedProduct.id}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Edit product details below</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                    <input
                      type="text"
                      className={`form-input ${isFieldModified("name") ? "border-green-500 dark:border-green-600 focus:ring-green-300 dark:focus:ring-green-600" : ""}`}
                      name="name"
                      value={editedProduct.name}
                      onChange={handleEditChange}
                      required
                    />
                    {isFieldModified("name") && <p className="text-xs text-green-600 mt-1">Modified</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                      className={`form-input ${isFieldModified("category") ? "border-green-500 dark:border-green-600 focus:ring-green-300 dark:focus:ring-green-600" : ""}`}
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
                     {isFieldModified("category") && <p className="text-xs text-green-600 mt-1">Modified</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`form-input ${isFieldModified("price") ? "border-green-500 dark:border-green-600 focus:ring-green-300 dark:focus:ring-green-600" : ""}`}
                      name="price"
                      value={editedProduct.price}
                      onChange={handleEditChange}
                      required
                    />
                     {isFieldModified("price") && <p className="text-xs text-green-600 mt-1">Modified from ₹{selectedProduct.price.toFixed(2)}</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                    <select
                      className={`form-input ${isFieldModified("unit") ? "border-green-500 dark:border-green-600 focus:ring-green-300 dark:focus:ring-green-600" : ""}`}
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
                    {isFieldModified("unit") && <p className="text-xs text-green-600 mt-1">Modified</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      className={`form-input ${isFieldModified("stock") ? "border-green-500 dark:border-green-600 focus:ring-green-300 dark:focus:ring-green-600" : ""}`}
                      name="stock"
                      value={editedProduct.stock}
                      onChange={handleEditChange}
                      required
                    />
                     {isFieldModified("stock") && <p className="text-xs text-green-600 mt-1">Modified from {selectedProduct.stock}</p>}
                  </div>

                  <div className="md:col-span-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      className={`form-input ${isFieldModified("description") ? "border-green-500 dark:border-green-600 focus:ring-green-300 dark:focus:ring-green-600" : ""}`}
                      name="description"
                      rows={3}
                      value={editedProduct.description}
                      onChange={handleEditChange}
                      required
                    />
                    {isFieldModified("description") && <p className="text-xs text-green-600 mt-1">Modified</p>}
                  </div>

                </div>
                
                <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-100">Summary of Changes</h4>
                  {Object.keys(editedProduct).some(key => isFieldModified(key)) ? (
                     <ul className="text-sm text-gray-600 dark:text-gray-300 bg-green-50 dark:bg-green-900/50 p-3 rounded-md border border-green-100 dark:border-green-800">
                        {isFieldModified("name") && <li className="py-1">• Name changed</li>}
                        {isFieldModified("category") && <li className="py-1">• Category changed</li>}
                        {isFieldModified("stock") && (
                          <li className="py-1">• Stock updated from <span className="font-medium">{selectedProduct.stock}</span> to <span className="font-medium text-green-700 dark:text-green-300">{editedProduct.stock}</span></li>
                        )}
                        {isFieldModified("price") && (
                          <li className="py-1">• Price updated from <span className="font-medium">₹{selectedProduct.price.toFixed(2)}</span> to <span className="font-medium text-green-700 dark:text-green-300">₹{editedProduct.price.toFixed(2)}</span></li>
                        )}
                        {isFieldModified("unit") && (
                          <li className="py-1">• Unit changed from <span className="font-medium">{selectedProduct.unit}</span> to <span className="font-medium text-green-700 dark:text-green-300">{editedProduct.unit}</span></li>
                        )}
                        {isFieldModified("description") && <li className="py-1">• Description updated</li>}
                      </ul>
                  ) : (
                     <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">No changes made yet</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

