"use client";

import { useEffect, useState } from 'react';
import { getUser, redirectIfNotAuthenticated } from '@/lib/auth';
import { ShoppingBag, Package, CreditCard, User, Clock } from 'lucide-react';

interface User {
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    redirectIfNotAuthenticated();
    
    // Get user data
    const userData = getUser();
    if (userData) {
      setUser(userData as User);
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  const recentOrders = [
    { id: 'ORD-1234', date: '2023-04-01', total: 45.99, status: 'Delivered' },
    { id: 'ORD-1235', date: '2023-04-05', total: 32.50, status: 'Processing' },
    { id: 'ORD-1236', date: '2023-04-08', total: 78.25, status: 'Shipped' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Customer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Welcome back, {user.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
              <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">12</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Active Orders</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">2</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 mr-4">
              <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">$325.40</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-3 mr-4">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Member Since</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Orders</h2>
            <a href="#" className="text-green-600 dark:text-green-400 text-sm hover:underline">View All</a>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{order.id}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800 dark:text-white">${order.total}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Delivered' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : order.status === 'Processing'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Profile Information</h2>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-start mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 mr-4">
                {user.name ? user.name[0].toUpperCase() : <User className="h-6 w-6" />}
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role: {user.role}</p>
              </div>
            </div>
            <a 
              href="/customer/profile" 
              className="inline-block bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded text-sm transition-colors dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
            >
              Update Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 