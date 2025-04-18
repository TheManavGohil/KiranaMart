"use client";

import { useEffect, useState } from 'react';
import { getUser, redirectIfNotAuthenticated } from '@/lib/auth';
import { Package, ArrowLeft, Filter, Clock, Check, Truck } from 'lucide-react';
import Link from 'next/link';

interface Order {
  _id: string;
  orderId: string;
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: number;
}

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Redirect if not authenticated
        redirectIfNotAuthenticated();
        
        // For now, we'll use mock data
        // Later we'll fetch real order data from an API
        setOrders([
          { _id: '1', orderId: 'ORD-1234', date: '2023-04-01', total: 549, status: 'Delivered', items: 5 },
          { _id: '2', orderId: 'ORD-1235', date: '2023-04-05', total: 320, status: 'Processing', items: 3 },
          { _id: '3', orderId: 'ORD-1236', date: '2023-04-08', total: 785, status: 'Shipped', items: 7 },
          { _id: '4', orderId: 'ORD-1237', date: '2023-04-15', total: 450, status: 'Pending', items: 4 },
          { _id: '5', orderId: 'ORD-1238', date: '2023-03-25', total: 950, status: 'Delivered', items: 8 },
          { _id: '6', orderId: 'ORD-1239', date: '2023-03-18', total: 220, status: 'Cancelled', items: 2 },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'active') 
      return orders.filter(order => 
        ['Pending', 'Processing', 'Shipped'].includes(order.status)
      );
    return orders.filter(order => 
      ['Delivered', 'Cancelled'].includes(order.status)
    );
  };

  const filteredOrders = getFilteredOrders();

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'Shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'Delivered':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'Cancelled':
        return <Clock className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/customer/dashboard" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
            <button className="ml-auto bg-gray-100 p-2 rounded-full">
              <Filter className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 mt-4">
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'all' ? 'bg-green-50 text-green-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'active' ? 'bg-green-50 text-green-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'completed' ? 'bg-green-50 text-green-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="container mx-auto px-4 mt-4 space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-500">You don't have any {activeTab !== 'all' ? activeTab : ''} orders yet.</p>
            <Link
              href="/customer/categories"
              className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Link
              key={order._id}
              href={`/customer/orders/${order.orderId}`}
              className="block bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{order.orderId}</h3>
                    <p className="text-xs text-gray-500">{order.date} • {order.items} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{order.total}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full 
                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
} 