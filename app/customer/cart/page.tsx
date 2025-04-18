"use client";

import { useEffect, useState } from 'react';
import { redirectIfNotAuthenticated } from '@/lib/auth';
import { ArrowLeft, Trash2, ShoppingBag, Plus, Minus, MapPin, Truck, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceholderRect } from '@/app/customer/dashboard/page';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image?: string;
}

interface Address {
  _id: string;
  name: string;
  address: string;
  isDefault: boolean;
}

export default function CartPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Redirect if not authenticated
        redirectIfNotAuthenticated();
        
        // For now, we'll use mock data
        const mockCartItems: CartItem[] = [
          { _id: '1', name: 'Organic Tomatoes', price: 40, unit: '500g', quantity: 1, image: '/images/products/tomato.jpg' },
          { _id: '2', name: 'Fresh Milk', price: 60, unit: '500ml', quantity: 2, image: '/images/products/milk.jpg' },
          { _id: '3', name: 'Whole Wheat Bread', price: 35, unit: 'pack', quantity: 1, image: '/images/products/bread.jpg' },
        ];
        
        const mockAddresses: Address[] = [
          { _id: '1', name: 'Home', address: '123 Main Street, Apartment 4B, Mumbai 400001', isDefault: true },
          { _id: '2', name: 'Office', address: 'Building 7, Tech Park, Bangalore 560001', isDefault: false }
        ];
        
        setCartItems(mockCartItems);
        setAddresses(mockAddresses);
        setSelectedAddress(mockAddresses.find(addr => addr.isDefault) || mockAddresses[0]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryFee = () => {
    // Simple calculation: free for orders above 200, otherwise 40
    return getSubtotal() > 200 ? 0 : 40;
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryFee();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/customer/dashboard" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">My Cart</h1>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-16 p-4">
          <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6 text-center">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            href="/customer/categories"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="container mx-auto px-4 space-y-4 mt-4">
          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-800">Delivery Address</h2>
              <Link href="/customer/profile" className="text-green-600 text-xs hover:underline">
                Change
              </Link>
            </div>
            {selectedAddress && (
              <div className="flex mt-3">
                <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{selectedAddress.name}</p>
                  <p className="text-sm text-gray-600">{selectedAddress.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Cart Items ({cartItems.length})</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <PlaceholderRect name={item.name} />
                    )}
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item._id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">{item.unit}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-gray-900">₹{item.price}</span>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Option */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-gray-500" />
              <div className="ml-3 flex-grow">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Standard Delivery</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {getDeliveryFee() === 0 ? 'FREE' : `₹${getDeliveryFee()}`}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Delivery within 30-40 minutes</p>
              </div>
            </div>
          </div>

          {/* Bill Details */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Bill Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Item Total</span>
                <span className="text-gray-900">₹{getSubtotal()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className={getDeliveryFee() === 0 ? "text-green-600" : "text-gray-900"}>
                  {getDeliveryFee() === 0 ? 'FREE' : `₹${getDeliveryFee()}`}
                </span>
              </div>
              {getDeliveryFee() === 0 && (
                <div className="text-xs text-green-600">
                  You saved ₹40 on delivery fee
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 mt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">To Pay</span>
                <span className="font-bold text-gray-900">₹{getTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Button - Fixed at bottom */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">₹{getTotal()}</p>
            </div>
            <Link
              href="/customer/checkout"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
            >
              Proceed to Checkout
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 