"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Star } from "lucide-react"
import type { Product } from "@/lib/db"
import { motion } from "framer-motion"

interface ProductCardProps {
  product: Product
  onAddToCart?: () => void
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <motion.div
      className="card group hover:translate-y-[-4px] transition-all duration-300"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Link href={`/customer/products/${product._id}`}>
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 z-10 relative"
          />
          {product.isOrganic && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-20">
              Organic
            </div>
          )}
        </Link>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/customer/products/${product._id}`} className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <h3 className="font-semibold text-lg">{product.name}</h3>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.category}</p>
            <div className="flex items-center space-x-2">
              <p className="font-bold text-lg text-green-600 dark:text-green-400">${product.price.toFixed(2)}</p>
              {product.oldPrice && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">${product.oldPrice.toFixed(2)}</p>
              )}
            </div>
          </div>
          <button
            onClick={onAddToCart}
            className="bg-green-100 dark:bg-green-900/50 hover:bg-green-500 dark:hover:bg-green-600 hover:text-white text-green-600 dark:text-green-400 p-2 rounded-full transition-colors duration-300"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{product.description}</p>
        </div>

        {product.rating && (
          <div className="mt-2 flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={i < Math.floor(product.rating) ? "fill-current" : ""} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({product.ratingCount || 0})</span>
          </div>
        )}

        {product.stock <= 5 && (
          <p className="mt-2 text-sm text-orange-600 dark:text-orange-400 font-medium">
            Only {product.stock} left in stock!
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default ProductCard

