"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, Truck, ShieldCheck, RefreshCw, Tag, ShoppingCart, Plus, Minus, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { apiCall } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  unit?: string;
  category: string;
  vendorId: string;
  stock: number;
  imageUrl?: string;
  isAvailable?: boolean;
  tags?: string[];
  manufacturingDate?: string | Date;
  expiryDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  // Dummy reviews and related products (replace with real data as needed)
  const reviews = [
    { id: 1, username: "Sarah", rating: 5, date: "2023-06-15", comment: "Excellent quality produce! Very fresh and arrived quickly." },
    { id: 2, username: "Michael", rating: 4, date: "2023-06-10", comment: "Good product, but packaging could be improved." },
    { id: 3, username: "Jessica", rating: 5, date: "2023-05-28", comment: "Always buy from this vendor. Great quality and consistent deliveries." },
  ];
  const relatedProducts = Array(4).fill(null).map((_, i) => ({
    _id: `related-${i}`,
    name: `Related Product ${i + 1}`,
    description: "This is a related product description.",
    imageUrl: "/placeholder.png",
    price: 4.99 + i,
    category: product.category,
    stock: 10,
    vendorId: product.vendorId,
    createdAt: new Date(),
  }));

  // Personalized greeting (try to get user from localStorage)
  let customerName = "there";
  if (typeof window !== "undefined") {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user && user.name) customerName = user.name.split(" ")[0];
    } catch {}
  }

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (adding || added) return;
    setAdding(true);
    try {
      await apiCall("/api/customer/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product._id, quantity }),
      });
      setAdded(true);
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-600" />
          <span>
            <b>{product.name}</b> added to your basket, {customerName}! <br />
            <span className="text-xs text-gray-500">Happy shopping with KiranaMart 🛒</span>
          </span>
        </div>,
        { duration: 3500 }
      );
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      toast.error(
        <span>
          Could not add to cart. {err.message || "Please try again."}
        </span>
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <motion.div
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Link href="/customer/products" className="text-green-600 hover:text-green-700 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12 flex flex-col md:flex-row gap-10 p-8 animate-fadeIn">
          {/* Product Image */}
          <motion.div
            className="relative aspect-square w-full max-w-md mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-lg"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src={product.imageUrl || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            <AnimatePresence>
              {added && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-20"
                >
                  <CheckCircle className="w-5 h-5 text-white animate-bounce" />
                  Added!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                  {product.category}
                </span>
                {product.tags && product.tags.map((tag: string) => (
                  <span key={tag} className="inline-flex items-center bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full ml-1">
                    <Tag className="w-3 h-3 mr-1" />{tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-extrabold mb-3 text-gray-900 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-green-600">₹{product.price.toFixed(2)}</span>
                {product.unit && <span className="text-gray-500 text-lg">/ {product.unit}</span>}
                {product.stock <= 5 && (
                  <span className="ml-4 text-orange-600 font-semibold">Only {product.stock} left!</span>
                )}
              </div>
              <div className="mb-6">
                <h3 className="font-semibold mb-1 text-lg">Description</h3>
                <p className="text-gray-700 text-base leading-relaxed">{product.description}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-gray-500 text-xs">Stock</span>
                  <span className="font-bold text-lg">{product.stock}</span>
                </div>
                {product.manufacturingDate && (
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-gray-500 text-xs">Manufactured</span>
                    <span className="font-bold text-lg">{new Date(product.manufacturingDate).toLocaleDateString()}</span>
                  </div>
                )}
                {product.expiryDate && (
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-gray-500 text-xs">Expiry</span>
                    <span className="font-bold text-lg">{new Date(product.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 items-center">
              <div className="flex items-center bg-green-50 rounded-lg px-3 py-2 shadow-inner">
                <button
                  className="p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || adding}
                  aria-label="Decrease quantity"
                >
                  <Minus />
                </button>
                <span className="mx-3 font-bold text-lg text-green-700">{quantity}</span>
                <button
                  className="p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || adding}
                  aria-label="Increase quantity"
                >
                  <Plus />
                </button>
              </div>
              <motion.button
                className={`btn-primary flex-1 flex items-center justify-center gap-2 text-lg font-semibold py-3 transition-all ${adding ? "opacity-60 cursor-not-allowed" : ""}`}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={adding || added}
                aria-label="Add to Cart"
              >
                <ShoppingCart className={`w-6 h-6 ${added ? "animate-bounce text-green-300" : ""}`} />
                {adding ? "Adding..." : added ? "Added!" : `Add to Cart`}
              </motion.button>
              <button className="btn-secondary flex-1 py-3">Buy Now</button>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-sm">
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-green-600 mr-2" />
                <span>Free shipping over ₹500</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="w-5 h-5 text-green-600 mr-2" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center">
                <RefreshCw className="w-5 h-5 text-green-600 mr-2" />
                <span>Easy returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="ml-2 text-2xl font-bold">4.8</span>
                  <span className="text-gray-500 ml-2">out of 5</span>
                </div>
                <p className="text-gray-500">Based on {reviews.length} reviews</p>
              </div>
              <button className="btn-secondary">Write a Review</button>
            </div>
            <div className="border-t border-gray-200 pt-6">
              {reviews.map((review) => (
                <div key={review.id} className="mb-8 pb-8 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                        {review.username.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold">{review.username}</p>
                        <p className="text-gray-500 text-sm">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Related Products */}
        <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <div key={prod._id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                <Image src={prod.imageUrl} alt={prod.name} width={120} height={120} className="rounded-lg object-cover mb-2" />
                <h3 className="font-semibold text-lg text-center mb-1">{prod.name}</h3>
                <p className="text-green-600 font-bold mb-1">₹{prod.price.toFixed(2)}</p>
                <Link href={`/customer/products/${prod._id}`} className="btn-primary w-full text-center mt-2">View</Link>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
} 