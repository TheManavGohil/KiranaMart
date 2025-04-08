"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { redirectIfNotAuthenticated } from '@/lib/auth';
import { ArrowLeft, MapPin, Phone, Package, Truck, CheckCircle, Home, Calendar, Clock, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceholderRect } from '@/app/customer/dashboard/page';

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderId: string;
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  address: {
    name: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  payment: {
    method: 'COD' | 'Card' | 'UPI';
    status: 'Pending' | 'Completed' | 'Failed';
  };
  deliveryDate?: string;
  deliveryTime?: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { orderId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Redirect if not authenticated
        redirectIfNotAuthenticated();
        
        // For now, we'll use mock data
        // Later we'll fetch the specific order from an API
        setOrder({
          _id: '2',
          orderId: orderId as string,
          date: '2023-04-05',
          total: 320,
          status: 'Processing',
          items: [
            { _id: '1', name: 'Organic Tomatoes', quantity: 1, price: 40, image: '/images/products/tomato.jpg' },
            { _id: '2', name: 'Fresh Milk (500ml)', quantity: 2, price: 60, image: '/images/products/milk.jpg' },
            { _id: '3', name: 'Whole Wheat Bread', quantity: 1, price: 35, image: '/images/products/bread.jpg' },
            { _id: '4', name: 'Onions (1kg)', quantity: 1, price: 25, image: '/images/products/onion.jpg' },
          ],
          address: {
            name: 'John Doe',
            addressLine: '123 Main Street, Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            phone: '+91 9876543210',
          },
          payment: {
            method: 'COD',
            status: 'Pending',
          },
          deliveryDate: '2023-04-07',
          deliveryTime: '14:00 - 16:00',
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-6 text-center">
          We couldn't find the order you're looking for. It may have been removed or the ID is incorrect.
        </p>
        <Link
          href="/customer/orders"
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Go Back to Orders
        </Link>
      </div>
    );
  }

  const getStatusStep = () => {
    switch (order.status) {
      case 'Pending': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const getTotalItems = () => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryFee = () => {
    // Simple calculation: free for orders above 200, otherwise 40
    return getSubtotal() > 200 ? 0 : 40;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Order Details</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-4 mt-4">
        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-800">Order #{order.orderId}</h2>
            <span className={`text-xs px-2 py-1 rounded-full ${
              order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
              order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
              order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
              order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {order.status}
            </span>
          </div>

          {order.status !== 'Cancelled' && (
            <div className="mb-2">
              <div className="relative">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500`}
                    style={{ width: `${(getStatusStep() / 3) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <div className={`flex flex-col items-center ${getStatusStep() >= 0 ? 'text-green-600' : ''}`}>
                    <Package className={`h-5 w-5 ${getStatusStep() >= 0 ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Ordered</span>
                  </div>
                  <div className={`flex flex-col items-center ${getStatusStep() >= 1 ? 'text-green-600' : ''}`}>
                    <Package className={`h-5 w-5 ${getStatusStep() >= 1 ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Processing</span>
                  </div>
                  <div className={`flex flex-col items-center ${getStatusStep() >= 2 ? 'text-green-600' : ''}`}>
                    <Truck className={`h-5 w-5 ${getStatusStep() >= 2 ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Shipped</span>
                  </div>
                  <div className={`flex flex-col items-center ${getStatusStep() >= 3 ? 'text-green-600' : ''}`}>
                    <CheckCircle className={`h-5 w-5 ${getStatusStep() >= 3 ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Ordered on {order.date}</span>
            </div>
            {order.deliveryDate && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Expected delivery: {order.deliveryDate}, {order.deliveryTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Items ({getTotalItems()})</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex">
                <div className="relative w-16 h-16 flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                  <div className="flex justify-between mt-1">
                    <div className="text-sm text-gray-500">
                      Qty: {item.quantity} × ₹{item.price}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Delivery Address</h2>
          <div className="flex">
            <div className="flex-shrink-0">
              <Home className="h-5 w-5 text-gray-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{order.address.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {order.address.addressLine}, {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <div className="flex items-center mt-2">
                <Phone className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">{order.address.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Payment Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className="text-sm font-medium text-gray-900">
                {order.payment.method === 'COD' ? 'Cash on Delivery' : 
                 order.payment.method === 'UPI' ? 'UPI Payment' : 'Card Payment'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Status</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                order.payment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                order.payment.status === 'Failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.payment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-medium text-gray-900">₹{getSubtotal()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Delivery Fee</span>
              <span className="text-sm font-medium text-gray-900">
                {getDeliveryFee() === 0 ? 'FREE' : `₹${getDeliveryFee()}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-base font-bold text-gray-900">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Reorder
          </button>
          <button className="flex-1 border border-gray-300 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Need Help
          </button>
        </div>
      </div>
    </div>
  );
} 