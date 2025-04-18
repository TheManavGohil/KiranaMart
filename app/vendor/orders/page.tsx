"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ArrowUpDown, Eye, CheckCircle, XCircle, Clock, Package, Truck, Calendar, ChevronDown, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { apiCall } from '@/lib/api'
import { toast } from "sonner"

// Define the structure for the fetched order data
interface Order {
  _id: string; // MongoDB ObjectId
  id: string; // Custom Order ID (e.g., ord-1001)
  customer: string;
  date: string;
  items: number; // Total number of items
  total: string; // Formatted total amount
  status: string;
}

// Define order status flow and available transitions
const statusTransitions = {
  Pending: ["Preparing", "Cancelled"],
  Preparing: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered", "Cancelled"],
  Delivered: [], // Terminal state
  Cancelled: [], // Terminal state
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isDateFilterActive, setIsDateFilterActive] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null)

  const statuses = ["All", "Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"]

  // Fetch orders function
  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedOrders = await apiCall<Order[]>('/api/vendor/orders')
      setOrders(fetchedOrders || [])
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError(err.message || "Failed to load orders")
      toast.error(`Error: ${err.message || "Failed to load orders"}`)
      setOrders([]) // Clear orders on error
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders()
  }, [])

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

  // Update status handler using API call with MongoDB _id
  const handleUpdateStatus = async (orderMongoId: string, newStatus: string) => {
    setIsUpdatingStatus(orderMongoId); // Use MongoDB _id for tracking
    try {
      // Use mongoId query parameter and pass the MongoDB _id
      await apiCall(`/api/vendor/orders?mongoId=${orderMongoId}`, {
        method: 'PUT',
        body: JSON.stringify({ newStatus }),
      });

      // Update local state on success using MongoDB _id
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderMongoId ? { ...order, status: newStatus } : order
        )
      );
      // Find the order's custom ID for the toast message
      const updatedOrder = orders.find(o => o._id === orderMongoId);
      toast.success(`Order ${updatedOrder?.id || orderMongoId} status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(null); // Clear loading state
    }
  };

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

  // Loading State UI
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading Orders...</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait while we fetch your order history.</p>
        </div>
      </div>
    )
  }

  // Error State UI
  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error Loading Orders</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2 mb-4">{error}</p>
          <Button
            onClick={fetchOrders}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          <span className="border-b-4 border-green-500 pb-1">Order Management</span>
        </h1>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md mb-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by order # or customer name..."
                className="form-input pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <div>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-full md:w-[180px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status} className="dark:focus:bg-gray-700 dark:text-gray-200">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                className={`w-full md:w-auto flex items-center justify-center transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 ${
                  isDateFilterActive
                    ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800/40"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                }`}
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {isDateFilterActive
                  ? `${startDate} - ${endDate}`
                  : "Date Range"}
              </Button>

              {showDatePicker && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-10 w-72">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <Input
                      type="date"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <Input
                      type="date"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearDateFilter}
                      className="dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={applyDateFilter}
                      disabled={!startDate}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Order ID
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Customer
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Date
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Total
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{order.id}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{order.customer}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{order.date}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{order.items}</td>
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">₹{order.total}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {getStatusIcon(order.status)}
                        <span className="text-gray-700 dark:text-gray-300">{order.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="dark:text-gray-400 dark:hover:bg-gray-700" disabled={isUpdatingStatus === order._id}>
                            {isUpdatingStatus === order._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                Update Status <ChevronDown className="ml-1 w-4 h-4" />
                              </>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                          {getAvailableStatusTransitions(order.status).map(
                            (newStatus) => (
                              <DropdownMenuItem
                                key={newStatus}
                                onSelect={() => handleUpdateStatus(order._id, newStatus)}
                                className="dark:focus:bg-gray-700 dark:text-gray-200"
                              >
                                Mark as {newStatus}
                              </DropdownMenuItem>
                            )
                          )}
                          {getAvailableStatusTransitions(order.status).length === 0 && order.status !== 'Pending' && (
                            <DropdownMenuItem disabled className="dark:text-gray-500">No actions available</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="dark:bg-gray-700"/>
                          <DropdownMenuItem onSelect={() => {/* Implement view details */}} className="dark:focus:bg-gray-700 dark:text-gray-200">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Package className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
                    No orders found matching your criteria.
                    {orders.length === 0 && !isLoading && <p className="mt-1 text-sm">Once customers place orders, they will appear here.</p>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Keep static or implement if API supports it) */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Showing {filteredOrders.length} of {filteredOrders.length} orders {/* Update pagination logic if implemented */}
          </div>
          {/* Pagination buttons would go here if needed */}
        </div>
      </div>
    </div>
  )
}

