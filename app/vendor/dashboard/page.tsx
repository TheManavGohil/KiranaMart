import DashboardStats from "@/components/dashboard-stats"
import Link from "next/link"
import { ShoppingBag, Package, AlertCircle, Clock } from "lucide-react"

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <div>
          <span className="text-gray-500">Today: </span>
          <span className="font-semibold">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats data={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link href="/vendor/orders" className="text-green-600 hover:text-green-700 text-sm">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2">Order ID</th>
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Total</th>
                  <th className="text-left py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <Link href={`/vendor/orders/${order.id}`} className="text-green-600 hover:text-green-700">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="py-3 px-2">{order.customer}</td>
                    <td className="py-3 px-2">{order.date}</td>
                    <td className="py-3 px-2">${order.total.toFixed(2)}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
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
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <h2 className="text-xl font-semibold">Low Stock Products</h2>
            </div>

            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-red-500">{product.stock} items left</p>
                </div>
                <Link href={`/vendor/products/${product.id}`} className="text-green-600 hover:text-green-700 text-sm">
                  Update
                </Link>
              </div>
            ))}

            <Link
              href="/vendor/inventory"
              className="mt-4 text-green-600 hover:text-green-700 text-sm flex justify-center"
            >
              Manage Inventory
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6">Overview</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-green-500 mr-3" />
                  <span>Orders Today</span>
                </div>
                <span className="font-semibold">12</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-green-500 mr-3" />
                  <span>Total Products</span>
                </div>
                <span className="font-semibold">45</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Low Stock Items</span>
                </div>
                <span className="font-semibold">3</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-green-500 mr-3" />
                  <span>Pending Orders</span>
                </div>
                <span className="font-semibold">7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

