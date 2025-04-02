"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/models"

interface ProductCardProps {
  product: Product
  onAddToCart?: () => void
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <div className="card group">
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/product/${product._id}`}>
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/product/${product._id}`} className="hover:text-green-600">
              <h3 className="font-semibold text-lg">{product.name}</h3>
            </Link>
            <p className="text-sm text-gray-600 mb-2">{product.category}</p>
            <p className="font-bold text-lg text-green-600">${product.price.toFixed(2)}</p>
          </div>
          <button
            onClick={onAddToCart}
            className="bg-green-100 hover:bg-green-500 hover:text-white p-2 rounded-full transition-colors duration-300"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        </div>

        {product.stock <= 5 && <p className="mt-2 text-sm text-orange-600">Only {product.stock} left in stock!</p>}
      </div>
    </div>
  )
}

export default ProductCard

