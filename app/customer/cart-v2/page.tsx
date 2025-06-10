'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

async function fetcher(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        // Handle case where token is not found, maybe redirect to login
        throw new Error('No auth token found');
    }
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        try {
            // @ts-ignore
            error.info = await res.json();
        } catch (e) {
            // @ts-ignore
            error.info = { message: res.statusText };
        }
        // @ts-ignore
        error.status = res.status;
        throw error;
    }
    // Handle empty response for methods like DELETE
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return res.json();
    }
    return {};
}


interface CartItem {
    _id: string;
    productId: {
        _id: string;
        name: string;
        price: number;
        imageUrl?: string;
    };
    quantity: number;
}

export default function CartV2Page() {
    const [cartItems, setCartItems] = useState<CartItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetcher('/api/customer/cart-v2');
            setCartItems(data);
            setError(null);
        } catch (err: any) {
            console.error(err);
            if (err.status === 401) {
                router.push('/auth?type=login');
            } else {
                setError(err.info?.message || 'Failed to load cart.');
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleUpdateQuantity = async (productId: string, quantity: number) => {
        try {
            const updatedItems = await fetcher('/api/customer/cart-v2', {
                method: 'PUT',
                body: JSON.stringify({ productId, quantity }),
            });
            setCartItems(updatedItems);
        } catch (err: any) {
            console.error(err);
            setError(err.info?.message || 'Failed to update item.');
            // Optional: refetch cart to revert optimistic updates if you were using them
            fetchCart();
        }
    };
    
    const handleRemoveItem = async (productId: string) => {
        try {
            const updatedItems = await fetcher('/api/customer/cart-v2', {
                method: 'DELETE',
                body: JSON.stringify({ productId }),
            });
            setCartItems(updatedItems);
        } catch (err: any) {
            console.error(err);
            setError(err.info?.message || 'Failed to remove item.');
            fetchCart();
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="text-center">
                <ShoppingCart className="w-16 h-16 text-green-600 animate-pulse mx-auto" />
                <p className="text-lg text-gray-600 mt-4">Loading your cart...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-screen bg-red-50">
            <div className="text-center p-8 border border-red-200 rounded-lg bg-white">
                <h2 className="text-2xl font-bold text-red-600">Oops!</h2>
                <p className="text-gray-700 mt-2">{error}</p>
                <button
                    onClick={() => router.push('/customer/products')}
                    className="mt-6 btn-primary bg-red-600 hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
    
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="container mx-auto text-center py-20">
                <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link href="/customer/products" className="btn-primary inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                </Link>
            </div>
        );
    }
    
    const subtotal = cartItems.reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/customer/products" className="text-green-600 hover:text-green-700 flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Products
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Your Shopping Cart</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 space-y-4">
                        {cartItems.map(item => (
                            item.productId ? (
                                <div key={item.productId._id} className="flex gap-4 border-b border-gray-100 py-4 last:border-b-0">
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.productId.imageUrl || '/placeholder.png'}
                                            alt={item.productId.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
    
                                    <div className="flex flex-col justify-between flex-grow">
                                        <div>
                                            <h2 className="text-base sm:text-lg font-semibold text-gray-800">{item.productId.name}</h2>
                                            <p className="text-sm text-gray-500">
                                                Unit Price: ₹{item.productId.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center bg-gray-100 rounded-lg">
                                                <button onClick={() => handleUpdateQuantity(item.productId._id, item.quantity - 1)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-l-lg transition-colors" disabled={item.quantity <= 1}>
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="px-3 sm:px-4 font-bold text-gray-800 text-sm sm:text-base">{item.quantity}</span>
                                                <button onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-r-lg transition-colors">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 sm:gap-4">
                                                <p className="font-bold text-gray-800 text-sm sm:text-base text-right">
                                                    ₹{(item.productId.price * item.quantity).toFixed(2)}
                                                </p>
                                                <button onClick={() => handleRemoveItem(item.productId._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-md p-6 sticky top-8">
                            <h2 className="text-xl font-bold border-b border-gray-200 pb-4 mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-semibold">FREE</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="flex justify-between font-bold text-lg text-gray-900">
                                        <span>Total</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-primary w-full mt-6 text-lg">
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}