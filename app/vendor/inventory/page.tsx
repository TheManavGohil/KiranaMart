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
    lastRestocked: new Date(Date.now() - (i * 2 + 1) * 86400000).toISOString().split("T")[0],
  }))

export default function VendorInventoryPage() {
  const [inventory, setInventory] = useState(mockInventory)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [showLowStock, setShowLowStock] = useState(false)
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [restockAmount, setRestockAmount] = useState("")

  const categories = ["All", "Fruits", "Vegetables", "Dairy", "Bakery", "Grains"]

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <h3 className="font-bold text-2xl mt-1">{inventory.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <PackageCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Items</p>
              <h3 className="font-bold text-2xl mt-1">{inventory.filter((item) => item.stock <= 5).length}</h3>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Restocked Today</p>
              <h3 className="font-bold text-2xl mt-1">0</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Out of Stock</p>
              <h3 className="font-bold text-2xl mt-1">{inventory.filter((item) => item.stock === 0).length}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory..."
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
                className="mr-2"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              <label htmlFor="low-stock">Low Stock Only</label>
            </div>

            <button className="btn-secondary flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
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
                    Stock
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button className="flex items-center">
                    Last Restocked
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden">
                      <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{item.name}</td>
                  <td className="py-3 px-4">{item.category}</td>
                  <td className="py-3 px-4">
                    <span className={`${item.stock <= 5 ? "text-red-600" : "text-green-600"}`}>{item.stock}</span>
                    {item.stock <= 5 && (
                      <span className="ml-2 text-xs inline-block px-2 py-1 bg-red-100 text-red-600 rounded-full">
                        Low Stock
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">{item.lastRestocked}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                        onClick={() => openRestockModal(item)}
                      >
                        Restock
                      </button>
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded-full">
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
          <div className="py-8 text-center text-gray-500">No inventory items found matching your criteria.</div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
          <div className="text-gray-500 text-sm">
            Showing 1-{filteredInventory.length} of {filteredInventory.length} items
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 border rounded-md bg-green-500 text-white">1</button>
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Restock Product</h2>
                <button onClick={() => setIsRestockModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden mr-4">
                    <Image
                      src={selectedProduct.imageUrl || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-500">Current Stock: {selectedProduct.stock}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add Stock Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter quantity"
                    min="1"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                  />
                </div>

                <div className="text-sm text-gray-500">
                  New Stock Level:{" "}
                  {restockAmount && !isNaN(Number.parseInt(restockAmount)) && Number.parseInt(restockAmount) > 0
                    ? selectedProduct.stock + Number.parseInt(restockAmount)
                    : selectedProduct.stock}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button className="btn-secondary" onClick={() => setIsRestockModalOpen(false)}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
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
    </div>
  )
}

