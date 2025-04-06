"use client";

import { useEffect, useState } from 'react';
import { getUser, getToken, redirectIfNotAuthenticated } from '@/lib/auth';
import Link from "next/link";
import { ShoppingBag, Package, AlertCircle, Clock, TrendingUp, ChevronRight, Bell, ArrowUpRight, Store, Activity, DollarSign, Users } from "lucide-react";

// Define types for our dashboard data
interface SalesData {
  name: string;
  sales: number;
}

interface DashboardStats {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  salesData: SalesData[];
}

interface RecentOrder {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
}

export default function VendorDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/vendor/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not authenticated
    redirectIfNotAuthenticated();
    
    // Get user data
    const userData = getUser();
    if (userData) {
      setUser(userData);
    }
    
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Fallback when loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchDashboardData()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Fallback to empty data if API fails
  const stats = dashboardData?.stats || {
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    salesData: []
  };

  const recentOrders = dashboardData?.recentOrders || [];
  const lowStockProducts = dashboardData?.lowStockProducts || [];

  return (
    <div className="animate-fadeIn">
      {/* Dashboard Header with Greeting */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 -m-8 mb-6 p-8 pt-6 pb-12 rounded-b-3xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {getGreeting()}, {user?.name || 'Vendor'}!
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-8">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-red-500 overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-red-600 font-semibold text-sm">QUICK ACTION</span>
                <h3 className="text-lg font-bold mt-1">New Product</h3>
              </div>
              <div className="bg-red-100 p-3 rounded-full text-red-600">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">Add a new product to your inventory</p>
          </div>
          <Link href="/vendor/inventory" className="flex items-center justify-center py-3 bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors">
            <span>Add Product</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-amber-500 overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-amber-600 font-semibold text-sm">ALERT</span>
                <h3 className="text-lg font-bold mt-1">Low Stock Items</h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">{lowStockProducts.length} items need to be restocked</p>
          </div>
          <Link href="/vendor/inventory?filter=low-stock" className="flex items-center justify-center py-3 bg-amber-50 text-amber-600 font-medium hover:bg-amber-100 transition-colors">
            <span>View Items</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500 overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-blue-600 font-semibold text-sm">QUICK ACTION</span>
                <h3 className="text-lg font-bold mt-1">Pending Orders</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">You have {recentOrders.filter(order => order.status === 'Pending').length} pending orders</p>
          </div>
          <Link href="/vendor/orders?status=pending" className="flex items-center justify-center py-3 bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors">
            <span>Process Orders</span>
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
          <Link href="/vendor/analytics" className="flex items-center justify-center py-3 bg-green-50 text-green-600 font-medium hover:bg-green-100 transition-colors">
            <span>View Stats</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Performance Metrics */}
      <div id="performance-metrics" className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-green-500" />
          Performance Metrics
        </h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">${stats.revenue.toFixed(2)}</p>
              </div>
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 h-12 w-12 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-green-500 text-sm">12.5% from last month</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.orders}</p>
              </div>
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 h-12 w-12 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-green-500 text-sm">8.2% from last month</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Customers</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.customers}</p>
              </div>
              <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 h-12 w-12 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-green-500 text-sm">5.1% from last month</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Active Products</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.products}</p>
              </div>
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-3 h-12 w-12 flex items-center justify-center">
                <Package className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-red-500 text-sm">2.3% from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Sales Chart */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Monthly Sales</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          {/* Y-axis and grid */}
          <div className="relative h-72">
            {/* Y-axis labels and grid lines */}
            <div className="absolute top-0 left-0 h-full flex flex-col justify-between pr-2">
              {[4000, 3000, 2000, 1000, 0].map((value) => (
                <div key={value} className="flex items-center">
                  <span className="text-xs text-gray-500 w-10 text-right">${value}</span>
                  <div className="h-px w-full border-t border-gray-100 ml-2" style={{ width: "calc(100% + 580px)" }}></div>
                </div>
              ))}
            </div>
            
            {/* Chart container with bars */}
            <div className="ml-14 h-64 flex items-end justify-between">
              {stats.salesData.map((month, index) => (
                <div key={month.name} className="flex flex-col items-center group relative">
                  {/* Bar with gradient and animation */}
                  <div
                    className="w-14 rounded-t-md transition-all duration-300 relative overflow-hidden animate-in slide-in-from-bottom duration-500"
                    style={{ 
                      height: `${(month.sales / 4000) * 100}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 transition-colors"></div>
                    
                    {/* Value label on top */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap transition-opacity">
                      ${month.sales.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Month label */}
                  <span className="text-sm mt-2 font-medium text-gray-700">{month.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend and insights */}
          <div className="mt-4 border-t pt-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-t from-green-600 to-green-400 rounded-sm mr-1"></div>
              <span className="text-xs text-gray-600">Monthly Revenue</span>
            </div>
            <div className="text-sm text-gray-600">
              {stats.salesData.length > 0 && (
                <>
                  <span className="font-semibold text-green-600">Highest:</span> $
                  {Math.max(...stats.salesData.map(m => m.sales)).toLocaleString()} 
                  ({stats.salesData.reduce((a, b) => a.sales > b.sales ? a : b).name})
                </>
              )}
            </div>
          </div>
        </div>
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
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-800 font-medium">#{order.id.slice(-4)}</td>
                    <td className="py-3 px-4 text-gray-800">{order.customer}</td>
                    <td className="py-3 px-4 text-gray-600">{order.date}</td>
                    <td className="py-3 px-4 text-gray-800 font-medium">${order.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-700' 
                          : order.status === 'Pending' 
                            ? 'bg-yellow-100 text-yellow-700'
                            : order.status === 'Preparing'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Store Overview & Low Stock */}
        <div className="space-y-6">
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
                  <span className="font-bold text-gray-800">
                    {recentOrders.filter(order => order.date === new Date().toISOString().split('T')[0]).length}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-purple-500 mr-3" />
                  <span className="text-gray-700">Active Products</span>
                </div>
                <span className="font-bold text-gray-800">{stats.products}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-amber-500 mr-3" />
                  <span className="text-gray-700">Low Stock Items</span>
                </div>
                <span className="font-bold text-red-500">{lowStockProducts.length}</span>
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">Low Stock Items</h2>
              </div>
              <Link 
                href="/vendor/inventory?filter=low-stock" 
                className="flex items-center text-amber-600 hover:text-amber-700 font-medium text-sm bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full transition-colors"
              >
                View All
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">{product.name}</span>
                  <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {product.stock} {product.stock === 1 ? 'unit' : 'units'}
                  </span>
                </div>
              ))}

              {lowStockProducts.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No low stock items</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

