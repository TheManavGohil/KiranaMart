import DashboardStats from "@/components/dashboard-stats"
import Link from "next/link"
import { ShoppingBag, Package, AlertCircle, Clock, TrendingUp, ChevronRight, Bell, ArrowUpRight, Store, Activity } from "lucide-react"
import Image from "next/image"

export default function VendorDashboardPage() {
  // In a real app, fetch this data from API
  const stats = {
    revenue: 4890,
    orders: 234,
    customers: 89,
    products: 45,
    salesData: [
      { name: "Jan", sales: 3000 },
      { name: "Feb", sales: 2000 },
      { name: "Mar", sales: 2780 },
      { name: "Apr", sales: 1890 },
      { name: "May", sales: 2390 },
      { name: "Jun", sales: 3490 },
    ],
  }

  // Dummy recent orders
  const recentOrders = [
    { id: "3201", customer: "Sarah Johnson", date: "2023-07-15", total: 56.78, status: "Pending" },
    { id: "3200", customer: "Michael Brown", date: "2023-07-14", total: 89.32, status: "Preparing" },
    { id: "3199", customer: "Jessica Lee", date: "2023-07-14", total: 45.99, status: "Out for Delivery" },
    { id: "3198", customer: "David Wilson", date: "2023-07-13", total: 23.5, status: "Delivered" },
    { id: "3197", customer: "Emma Davis", date: "2023-07-12", total: 67.25, status: "Delivered" },
  ]

  // Dummy low stock products
  const lowStockProducts = [
    { id: "101", name: "Organic Avocados", stock: 3 },
    { id: "102", name: "Fresh Milk", stock: 5 },
    { id: "103", name: "Whole Wheat Bread", stock: 2 },
  ]

  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="animate-fadeIn">
      {/* Dashboard Header with Greeting */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 -m-8 mb-6 p-8 pt-6 pb-12 rounded-b-3xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {getGreeting()}, Vendor!
            </h1>
            <p className="text-green-50 text-opacity-90">Here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 space-x-3">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg text-white">
              <span className="text-sm font-semibold">Today: </span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="relative">
              <Bell className="h-6 w-6 text-white cursor-pointer hover:text-green-200 transition-colors" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 -mt-16 mb-8 px-1">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500 overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-blue-600 font-semibold text-sm">QUICK ACTION</span>
                <h3 className="text-lg font-bold mt-1">Manage Orders</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">Process pending orders and manage deliveries</p>
          </div>
          <Link href="/vendor/orders" className="flex items-center justify-center py-3 bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors">
            <span>View Orders</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-500 overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-purple-600 font-semibold text-sm">QUICK ACTION</span>
                <h3 className="text-lg font-bold mt-1">Add Product</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">Add new products to your inventory</p>
          </div>
          <Link href="/vendor/products" className="flex items-center justify-center py-3 bg-purple-50 text-purple-600 font-medium hover:bg-purple-100 transition-colors">
            <span>Add Product</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-amber-500 overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-amber-600 font-semibold text-sm">QUICK ACTION</span>
                <h3 className="text-lg font-bold mt-1">Update Stock</h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">Update inventory levels for your products</p>
          </div>
          <Link href="/vendor/inventory" className="flex items-center justify-center py-3 bg-amber-50 text-amber-600 font-medium hover:bg-amber-100 transition-colors">
            <span>Manage Inventory</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500 overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-green-600 font-semibold text-sm">QUICK ACTION</span>
                <h3 className="text-lg font-bold mt-1">View Analytics</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">Check your store performance metrics</p>
          </div>
          <Link href="#analytics" className="flex items-center justify-center py-3 bg-green-50 text-green-600 font-medium hover:bg-green-100 transition-colors">
            <span>View Stats</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div id="analytics">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-green-500" />
          Performance Metrics
        </h2>
        <DashboardStats data={stats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <ShoppingBag className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            </div>
            <Link 
              href="/vendor/orders" 
              className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm bg-green-50 hover:bg-green-100 px-3 py-1 rounded-full transition-colors"
            >
              View All
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 rounded-lg">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm uppercase">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm uppercase">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm uppercase">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm uppercase">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      <Link href={`/vendor/orders/${order.id}`} className="text-green-600 hover:text-green-700 flex items-center">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{order.customer}</td>
                    <td className="py-3 px-4 text-gray-700">{order.date}</td>
                    <td className="py-3 px-4 font-medium">${order.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Preparing"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "Out for Delivery"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock & Notifications */}
        <div className="space-y-6">
          {/* Low Stock */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-red-100">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Low Stock Alert</h2>
            </div>

            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center p-3 mb-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Only {product.stock} items left
                  </p>
                </div>
                <Link 
                  href={`/vendor/products/${product.id}`} 
                  className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-full transition-colors font-medium"
                >
                  Restock
                </Link>
              </div>
            ))}

            <Link
              href="/vendor/inventory"
              className="mt-4 text-red-600 hover:text-red-700 font-medium text-sm flex items-center justify-center bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
            >
              <Package className="w-4 h-4 mr-2" />
              Manage Inventory
            </Link>
          </div>

          {/* Store Performance */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Store Overview</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-gray-700">Orders Today</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-gray-800">12</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 ml-2 rounded-full">+2</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-purple-500 mr-3" />
                  <span className="text-gray-700">Active Products</span>
                </div>
                <span className="font-bold text-gray-800">45</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-amber-500 mr-3" />
                  <span className="text-gray-700">Low Stock Items</span>
                </div>
                <span className="font-bold text-red-500">3</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                  <span className="text-gray-700">Pending Orders</span>
                </div>
                <span className="font-bold text-gray-800">7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

