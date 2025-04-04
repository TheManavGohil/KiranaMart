"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ArrowUpDown, Eye, CheckCircle, XCircle, Clock, Package, Truck, Calendar } from "lucide-react"

// Mock order data
const mockOrders = Array(15)
  .fill(null)
  .map((_, i) => ({
    id: `ord-${1000 + i}`,
    customer: `Customer ${i + 1}`,
    date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
    items: Math.floor(Math.random() * 5) + 1,
    total: (Math.random() * 100 + 20).toFixed(2),
    status:
      i % 5 === 0
        ? "Pending"
        : i % 5 === 1
          ? "Preparing"
          : i % 5 === 2
            ? "Out for Delivery"
            : i % 5 === 3
              ? "Delivered"
              : "Cancelled",
  }))

// Define order status flow and available transitions
const statusTransitions = {
  Pending: ["Preparing", "Cancelled"],
  Preparing: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered", "Cancelled"],
  Delivered: [], // Terminal state
  Cancelled: [], // Terminal state
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isDateFilterActive, setIsDateFilterActive] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const statuses = ["All", "Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"]

  useEffect(() => {
    // Set default end date to today if not set
    if (!endDate) {
      setEndDate(new Date().toISOString().split("T")[0])
    }
  }, [endDate])

  const filteredOrders = orders.filter((order) => {
    // Filter by search term
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by status
    const matchesStatus = statusFilter === "All" || order.status === statusFilter
    
    // Filter by date range
    let matchesDateRange = true
    if (isDateFilterActive && startDate && endDate) {
      const orderDate = new Date(order.date)
      const filterStartDate = new Date(startDate)
      const filterEndDate = new Date(endDate)
      
      // Set time to end of day for end date for inclusive comparison
      filterEndDate.setHours(23, 59, 59, 999)
      
      matchesDateRange = orderDate >= filterStartDate && orderDate <= filterEndDate
    }
    
    return matchesSearch && matchesStatus && matchesDateRange
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "Preparing":
        return <Package className="w-4 h-4 text-blue-500" />
      case "Out for Delivery":
        return <Truck className="w-4 h-4 text-purple-500" />
      case "Delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setOrders((prev) => 
      prev.map((order) => 
        order.id === id ? { ...order, status: newStatus } : order
      )
    )
  }

  const getAvailableStatusTransitions = (currentStatus: string) => {
    return statusTransitions[currentStatus as keyof typeof statusTransitions] || []
  }

  const applyDateFilter = () => {
    setIsDateFilterActive(true)
    setShowDatePicker(false)
  }

  const clearDateFilter = () => {
    setIsDateFilterActive(false)
    setStartDate("")
    setEndDate(new Date().toISOString().split("T")[0])
    setShowDatePicker(false)
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="border-b-4 border-green-500 pb-1">Order Management</span>
        </h1>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order # or customer name..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <button 
                className={`btn-secondary flex items-center px-4 py-2 rounded-lg transition-all ${
                  isDateFilterActive 
                    ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                }`}
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {isDateFilterActive 
                  ? `${startDate} - ${endDate}` 
                  : "Date Range"}
              </button>
              
              {showDatePicker && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 w-72">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="form-input w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="form-input w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      onClick={clearDateFilter}
                    >
                      Clear
                    </button>
                    <button
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                      onClick={applyDateFilter}
                      disabled={!startDate}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button className="flex items-center hover:text-green-600 transition-colors">
                    Order ID
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button className="flex items-center hover:text-green-600 transition-colors">
                    Customer
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button className="flex items-center hover:text-green-600 transition-colors">
                    Date
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button className="flex items-center hover:text-green-600 transition-colors">
                    Total
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button className="flex items-center hover:text-green-600 transition-colors">
                    Status
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">#{order.id}</td>
                  <td className="py-3 px-4 text-gray-700">{order.customer}</td>
                  <td className="py-3 px-4 text-gray-700">{order.date}</td>
                  <td className="py-3 px-4 text-gray-700">{order.items}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">${order.total}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Preparing"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "Out for Delivery"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        aria-label={`View details for order ${order.id}`}
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {getAvailableStatusTransitions(order.status).length > 0 ? (
                        <div className="relative inline-block text-left">
                          <select
                            className="form-select py-2 px-3 rounded-md border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all text-sm w-36"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpdateStatus(order.id, e.target.value)
                                e.target.value = ""
                              }
                            }}
                            disabled={order.status === "Delivered" || order.status === "Cancelled"}
                          >
                            <option value="">Update Status</option>
                            {getAvailableStatusTransitions(order.status).map((status) => (
                              <option key={status} value={status}>
                                Mark as {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <button
                          className="py-2 px-3 rounded-md bg-gray-100 text-gray-500 text-sm cursor-not-allowed w-36"
                          disabled
                        >
                          Status Final
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No orders found matching your criteria.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-gray-500 text-sm">
            Showing 1-{filteredOrders.length} of {filteredOrders.length} orders
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50 transition-colors">Previous</button>
            <button className="px-3 py-1 border rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors">1</button>
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50 transition-colors">2</button>
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

