"use client"

import { useState } from "react"
import { Search, Filter, ArrowUpDown, Eye, CheckCircle, XCircle, Clock, Package, Truck } from "lucide-react"

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

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const statuses = ["All", "Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"]

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || order.status === statusFilter
    return matchesSearch && matchesStatus
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
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Order Management</h1>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order # or customer name..."
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

            <button className="btn-secondary flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Date Range
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <button className="flex items-center">
                    Order ID
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button className="flex items-center">
                    Customer
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button className="flex items-center">
                    Date
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">Items</th>
                <th className="text-left py-3 px-4">
                  <button className="flex items-center">
                    Total
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button className="flex items-center">
                    Status
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">#{order.id}</td>
                  <td className="py-3 px-4">{order.customer}</td>
                  <td className="py-3 px-4">{order.date}</td>
                  <td className="py-3 px-4">{order.items}</td>
                  <td className="py-3 px-4">${order.total}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
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
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                        aria-label={`View details for order ${order.id}`}
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      <select
                        className="text-sm border rounded py-1 px-2"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleUpdateStatus(order.id, e.target.value)
                            e.target.value = ""
                          }
                        }}
                      >
                        <option value="">Update Status</option>
                        {statuses
                          .filter((s) => s !== "All" && s !== order.status)
                          .map((status) => (
                            <option key={status} value={status}>
                              Mark as {status}
                            </option>
                          ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-8 text-center text-gray-500">No orders found matching your criteria.</div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
          <div className="text-gray-500 text-sm">
            Showing 1-{filteredOrders.length} of {filteredOrders.length} orders
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 border rounded-md bg-green-500 text-white">1</button>
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

