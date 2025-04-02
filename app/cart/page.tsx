"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, ShoppingCart, Trash } from "lucide-react"
import CartItem from "@/components/cart-item"
import type { OrderItem } from "@/lib/models"

// Dummy cart data for demo purposes
const initialCartItems: OrderItem[] = [
  {
    productId: "1",
    name: "Organic Bananas",
    price: 2.99,
    quantity: 2,
    imageUrl: "/placeholder.png",
  },
  {
    productId: "2",
    name: "Red Apples",
    price: 3.49,
    quantity: 3,
    imageUrl: "/placeholder.png",
  },
  {
    productId: "3",
    name: "Avocados",
    price: 4.99,
    quantity: 1,
    imageUrl: "/placeholder.png",
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching cart from API
    setTimeout(() => {
      setCartItems(initialCartItems)
      setIsLoading(false)
    }, 800)
  }, [])

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart className="animate-pulse w-12 h-12 mx-auto text-green-500 mb-4" />
        <p className="text-lg">Loading your cart...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link href="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">Cart Items ({cartItems.length})</h2>
              <button onClick={clearCart} className="text-red-500 hover:text-red-700 flex items-center">
                <Trash className="w-4 h-4 mr-1" />
                Clear Cart
              </button>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.productId} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
              ))}
            </div>
          </div>

          <Link href="/products" className="text-green-600 hover:text-green-700 flex items-center mt-4">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>

              {shipping > 0 && <div className="text-sm text-gray-500 italic">Free shipping on orders over $50</div>}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <button className="btn-primary w-full mt-6">Proceed to Checkout</button>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>We accept multiple payment methods</p>
                <div className="flex justify-center space-x-2 mt-2">
                  <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  <div className="w-8 h-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

