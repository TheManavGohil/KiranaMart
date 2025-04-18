"use client"

import Image from "next/image"
import { Minus, Plus, X } from "lucide-react"
import type { OrderItem } from "@/lib/models"

interface CartItemProps {
  item: OrderItem
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
}

const CartItem = ({ item, updateQuantity, removeItem }: CartItemProps) => {
  const handleIncrement = () => {
    updateQuantity(item.productId, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1)
    }
  }

  return (
    <div className="flex items-center border-b border-gray-200 py-4">
      <div className="relative w-24 h-24 rounded-md overflow-hidden">
        <Image src={item.imageUrl || "/placeholder.png"} alt={item.name} fill className="object-cover" />
      </div>

      <div className="flex-grow ml-4">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-gray-600 text-sm">${item.price.toFixed(2)} each</p>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecrement}
          className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>

        <span className="w-8 text-center">{item.quantity}</span>

        <button
          onClick={handleIncrement}
          className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="ml-6 w-20 text-right">
        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
      </div>

      <button
        onClick={() => removeItem(item.productId)}
        className="ml-4 p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
        aria-label={`Remove ${item.name} from cart`}
      >
        <X size={20} />
      </button>
    </div>
  )
}

export default CartItem

