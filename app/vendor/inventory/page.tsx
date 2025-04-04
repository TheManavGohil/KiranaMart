"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Filter, ArrowUpDown, AlertTriangle, Edit, Truck, PackageCheck } from "lucide-react"

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

export default function VendorInventoryPage() {
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
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="border-b-4 border-green-500 pb-1">Inventory Management</span>
        </h1>
        <button className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all">
          <PackageCheck className="w-5 h-5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Products</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800">{inventory.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <PackageCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800">{inventory.filter((item) => item.stock <= 5).length}</h3>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Restocked Today</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800">0</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Out of Stock</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800">{inventory.filter((item) => item.stock === 0).length}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory..."
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="low-stock"
                className="mr-2 rounded text-green-600 focus:ring-green-500"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              <label htmlFor="low-stock" className="text-gray-700">Low Stock Only</label>
            </div>

            <button className="btn-secondary flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
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
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button className="flex items-center hover:text-green-600 transition-colors">
                    Last Restocked
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-200">
                      <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{item.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">${item.price.toFixed(2)}/{item.unit}</td>
                  <td className="py-3 px-4">
                    <span className={`${item.stock <= 5 ? "text-red-600" : "text-green-600"} font-medium`}>{item.stock}</span>
                    {item.stock <= 5 && (
                      <span className="ml-2 text-xs inline-block px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium">
                        Low Stock
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.lastRestocked}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                        onClick={() => openRestockModal(item)}
                      >
                        Restock
                      </button>
                      <button
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        onClick={() => openEditModal(item)}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No inventory items found matching your criteria.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-gray-500 text-sm">
            Showing 1-{filteredInventory.length} of {filteredInventory.length} items
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50 transition-colors">Previous</button>
            <button className="px-3 py-1 border rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors">1</button>
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 animate-slideUp">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Restock Product</h2>
                <button onClick={() => setIsRestockModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden mr-4 border border-gray-200">
                    <Image
                      src={selectedProduct.imageUrl || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-500">Current Stock: <span className="font-medium">{selectedProduct.stock}</span></p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add Stock Quantity</label>
                  <input
                    type="number"
                    className="form-input w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all"
                    placeholder="Enter quantity"
                    min="1"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                  />
                </div>

                <div className="text-sm bg-green-50 p-3 rounded-md border border-green-100">
                  <span className="text-gray-700">New Stock Level: </span>
                  <span className="font-semibold text-green-700">
                    {restockAmount && !isNaN(Number.parseInt(restockAmount)) && Number.parseInt(restockAmount) > 0
                      ? selectedProduct.stock + Number.parseInt(restockAmount)
                      : selectedProduct.stock}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" 
                  onClick={() => setIsRestockModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRestock}
                  disabled={
                    !restockAmount || isNaN(Number.parseInt(restockAmount)) || Number.parseInt(restockAmount) <= 0
                  }
                >
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 animate-slideUp">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden mr-4 border border-gray-200">
                    <Image
                      src={selectedProduct.imageUrl || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-500">ID: <span className="font-medium">{selectedProduct.id}</span></p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className={`form-input w-full rounded-lg border-gray-300 focus:ring focus:ring-opacity-50 transition-all ${
                      isFieldModified("name") ? "border-green-500 focus:border-green-500 focus:ring-green-200" : "focus:border-gray-400 focus:ring-gray-200"
                    }`}
                    name="name"
                    value={editedProduct.name}
                    onChange={handleEditChange}
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
                  >
                    {categories.map((category) => (
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    className={`form-input w-full rounded-lg border-gray-300 focus:ring focus:ring-opacity-50 transition-all ${
                      isFieldModified("stock") ? "border-green-500 focus:border-green-500 focus:ring-green-200" : "focus:border-gray-400 focus:ring-gray-200"
                    }`}
                    name="stock"
                    value={editedProduct.stock}
                    onChange={handleEditChange}
                  />
                  {isFieldModified("stock") && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Modified from {selectedProduct.stock}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className={`form-input w-full rounded-lg border-gray-300 focus:ring focus:ring-opacity-50 transition-all ${
                      isFieldModified("price") ? "border-green-500 focus:border-green-500 focus:ring-green-200" : "focus:border-gray-400 focus:ring-gray-200"
                    }`}
                    name="price"
                    value={editedProduct.price}
                    onChange={handleEditChange}
                  />
                  {isFieldModified("price") && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Modified from ${selectedProduct.price.toFixed(2)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className={`form-input w-full rounded-lg border-gray-300 focus:ring focus:ring-opacity-50 transition-all ${
                      isFieldModified("description") ? "border-green-500 focus:border-green-500 focus:ring-green-200" : "focus:border-gray-400 focus:ring-gray-200"
                    }`}
                    name="description"
                    rows={3}
                    value={editedProduct.description}
                    onChange={handleEditChange}
                  />
                  {isFieldModified("description") && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Modified
                    </p>
                  )}
                </div>

                <div className="mb-4 border-t pt-4">
                  <h4 className="font-medium mb-2 text-gray-800">Summary of Changes</h4>
                  {Object.keys(editedProduct).some(key => isFieldModified(key)) ? (
                    <ul className="text-sm text-gray-600 bg-green-50 p-3 rounded-md border border-green-100">
                      {isFieldModified("name") && <li className="py-1">• Name changed</li>}
                      {isFieldModified("category") && <li className="py-1">• Category changed</li>}
                      {isFieldModified("stock") && (
                        <li className="py-1">• Stock updated from <span className="font-medium">{selectedProduct.stock}</span> to <span className="font-medium text-green-700">{editedProduct.stock}</span></li>
                      )}
                      {isFieldModified("price") && (
                        <li className="py-1">• Price updated from <span className="font-medium">${selectedProduct.price.toFixed(2)}</span> to <span className="font-medium text-green-700">${editedProduct.price.toFixed(2)}</span></li>
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

              <div className="flex justify-end gap-3">
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSaveEdit}
                  disabled={!Object.keys(editedProduct).some(key => isFieldModified(key))}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

