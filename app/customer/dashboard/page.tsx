"use client";

import { useEffect, useState } from 'react';
import { getUser, redirectIfNotAuthenticated } from '@/lib/auth';
import { 
  ShoppingBag, Package, CreditCard, Clock, Search as LucideSearch, Heart, 
  ShoppingCart, MapPin, RefreshCw, Star, Truck, Tag, ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface User {
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  categoryId: string;
  vendorId: string;
  stock: number;
  isAvailable: boolean;
}

const PLACEHOLDER_IMAGE = '/images/placeholder.jpg';

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Redirect if not authenticated
        redirectIfNotAuthenticated();
        
        // Get user data
        const userData = getUser();
        if (userData) {
          setUser(userData as User);
        }
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Fetch products
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    { id: 'ORD-1234', date: '2023-04-01', total: 549, status: 'Delivered', items: 5 },
    { id: 'ORD-1235', date: '2023-04-05', total: 320, status: 'Processing', items: 3 },
    { id: 'ORD-1236', date: '2023-04-08', total: 785, status: 'Shipped', items: 7 },
  ];

  const favoriteProducts = products.slice(0, 4); // Mock favorite products
  const recentlyViewedProducts = products.slice(4, 8); // Mock recently viewed products
  const recommendedProducts = products.slice(8, 12); // Mock recommended products

  const savedAddresses = [
    { id: 1, name: 'Home', address: '123 Main Street, Apartment 4B, Mumbai 400001', isDefault: true },
    { id: 2, name: 'Office', address: 'Building 7, Tech Park, Bangalore 560001', isDefault: false }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Welcome and Search */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800">Hi, {user.name.split(' ')[0]}!</h1>
              <div className="flex items-center space-x-3">
                <Link href="/customer/cart" className="relative">
                  <ShoppingCart className="h-6 w-6 text-gray-700" />
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </Link>
                <Link href="/customer/favorites" className="relative">
                  <Heart className="h-6 w-6 text-gray-700" />
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    5
                  </span>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search for groceries, vegetables, fruits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-6 mt-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          <Link href="/customer/orders" className="flex flex-col items-center justify-center py-3 bg-white rounded-lg shadow-sm">
            <ShoppingBag className="h-6 w-6 text-green-600 mb-1" />
            <span className="text-xs text-gray-700">My Orders</span>
          </Link>
          <Link href="/customer/favorites" className="flex flex-col items-center justify-center py-3 bg-white rounded-lg shadow-sm">
            <Heart className="h-6 w-6 text-green-600 mb-1" />
            <span className="text-xs text-gray-700">Favorites</span>
          </Link>
          <Link href="/customer/profile" className="flex flex-col items-center justify-center py-3 bg-white rounded-lg shadow-sm">
            <MapPin className="h-6 w-6 text-green-600 mb-1" />
            <span className="text-xs text-gray-700">Addresses</span>
          </Link>
          <Link href="/customer/offers" className="flex flex-col items-center justify-center py-3 bg-white rounded-lg shadow-sm">
            <Tag className="h-6 w-6 text-green-600 mb-1" />
            <span className="text-xs text-gray-700">Offers</span>
          </Link>
        </div>

        {/* Delivery Status (if any active order) */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-gray-800">Active Order</h2>
            <Link href={`/customer/orders/${recentOrders[1].id}`} className="text-green-600 text-xs hover:underline flex items-center">
              View Details <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              <Truck className="h-12 w-12 text-green-600 p-2 bg-green-50 rounded-full" />
            </div>
            <div className="ml-4 flex-grow">
              <p className="text-sm font-medium text-gray-900">Order #{recentOrders[1].id}</p>
              <p className="text-xs text-gray-500">Estimated delivery: Today, 5:30 PM - 6:00 PM</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Order Placed</span>
                <span>Out for Delivery</span>
                <span>Delivered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-800">Recent Orders</h2>
            <Link href="/customer/orders" className="text-green-600 text-xs hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/customer/orders/${order.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 relative">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">{order.date} • {order.items} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₹{order.total}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Delivered' 
                      ? 'bg-green-100 text-green-800' 
                      : order.status === 'Processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories Slider */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-gray-800">Shop by Category</h2>
            <Link href="/customer/categories" className="text-green-600 text-xs hover:underline">
              View All
            </Link>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/customer/categories/${category._id}`}
                className="flex-shrink-0 w-20"
              >
                <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={category.image || PLACEHOLDER_IMAGE}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-center mt-1 text-gray-800">{category.name}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Reorder */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-gray-800">Buy Again</h2>
            <Link href="/customer/orders" className="text-green-600 text-xs hover:underline">
              View History
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {favoriteProducts.slice(0, 4).map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden flex"
              >
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={product.image || PLACEHOLDER_IMAGE}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-2 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-xs font-medium text-gray-800 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">{product.unit}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                    <button className="bg-green-500 text-white rounded p-1">
                      <ShoppingCart className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-800">Your Addresses</h2>
            <Link href="/customer/profile" className="text-green-600 text-xs hover:underline">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {savedAddresses.map((address) => (
              <div key={address.id} className="px-4 py-3">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{address.name}</span>
                    {address.isDefault && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{address.address}</p>
              </div>
            ))}
            <div className="px-4 py-3">
              <button className="w-full border border-dashed border-gray-300 rounded-lg p-3 text-sm text-gray-600 flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-2" />
                Add New Address
              </button>
            </div>
          </div>
        </div>

        {/* Recommended For You */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-gray-800">Recommended For You</h2>
            <Link href="/customer/products" className="text-green-600 text-xs hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recommendedProducts.slice(0, 4).map((product) => (
              <Link
                key={product._id}
                href={`/customer/products/${product._id}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="relative h-32">
                  <Image
                    src={product.image || PLACEHOLDER_IMAGE}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-white rounded-full p-1">
                    <Heart className="h-4 w-4 text-gray-400" />
                  </span>
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                    <button className="bg-green-500 text-white rounded-full p-1">
                      <ShoppingCart className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
} 