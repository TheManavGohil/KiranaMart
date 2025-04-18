import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, Truck, ShieldCheck, RefreshCw } from "lucide-react"
import { getProductById } from "@/lib/db"
import ProductCard from "@/components/product-card"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  // Dummy reviews data
  const reviews = [
    {
      id: 1,
      username: "Sarah",
      rating: 5,
      date: "2023-06-15",
      comment: "Excellent quality produce! Very fresh and arrived quickly.",
    },
    {
      id: 2,
      username: "Michael",
      rating: 4,
      date: "2023-06-10",
      comment: "Good product, but packaging could be improved.",
    },
    {
      id: 3,
      username: "Jessica",
      rating: 5,
      date: "2023-05-28",
      comment: "Always buy from this vendor. Great quality and consistent deliveries.",
    },
  ]

  // Dummy related products (in a real app, fetch from API)
  const relatedProducts = Array(4)
    .fill(null)
    .map((_, i) => ({
      _id: `related-${i}`,
      name: `Related Product ${i + 1}`,
      description: "This is a related product description.",
      imageUrl: "/placeholder.png",
      price: 4.99 + i,
      category: product.category,
      stock: 10,
      vendorId: product.vendorId,
      createdAt: new Date(),
    }))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-8">
        <Link href="/products" className="text-green-600 hover:text-green-700 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-auto">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md mb-2">
                    {product.category}
                  </span>
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                </div>
                <div className="bg-green-50 p-2 rounded-md">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 font-bold">4.8</span>
                    <span className="text-gray-500 text-sm ml-1">({reviews.length} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="text-2xl font-bold text-green-600 my-4">${product.price.toFixed(2)}</div>

              <div className="my-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="my-6">
              <h3 className="font-semibold mb-2">Quantity</h3>
              <div className="flex items-center">
                <button className="border border-gray-300 px-3 py-1 rounded-l-md hover:bg-gray-100">-</button>
                <input
                  type="number"
                  className="w-16 border-t border-b border-gray-300 py-1 text-center"
                  min="1"
                  max={product.stock}
                  defaultValue="1"
                />
                <button className="border border-gray-300 px-3 py-1 rounded-r-md hover:bg-gray-100">+</button>
                <span className="ml-4 text-gray-500">{product.stock} available</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button className="btn-primary flex-1">Add to Cart</button>
              <button className="btn-secondary flex-1">Buy Now</button>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-sm">
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-green-600 mr-2" />
                <span>Free shipping over $50</span>
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
      </div>

      {/* Reviews Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        <div className="bg-white rounded-lg shadow-lg p-6">
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
                  <div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                        {review.username.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold">{review.username}</p>
                        <p className="text-gray-500 text-sm">{review.date}</p>
                      </div>
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
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <ProductCard key={product._id.toString()} product={product} onAddToCart={() => {}} />
          ))}
        </div>
      </div>
    </div>
  )
}

