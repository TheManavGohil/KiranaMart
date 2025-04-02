import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Leaf, Truck, ShieldCheck, Search } from "lucide-react"
import ProductCard from "@/components/product-card"
import { getProducts } from "@/lib/db"

export default async function Home() {
  // Fetch featured products
  const products = await getProducts(6)

  const categories = [
    { name: "Fruits", image: "/categories/fruits.jpg" },
    { name: "Vegetables", image: "/categories/vegetables.jpg" },
    { name: "Dairy", image: "/categories/dairy.jpg" },
    { name: "Bakery", image: "/categories/bakery.jpg" },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-green-500 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Fresh Groceries Delivered to Your Door</h1>
            <p className="text-lg md:text-xl mb-6">
              Shop for fresh, organic products from local vendors and get them delivered straight to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-primary bg-white text-green-600 hover:bg-green-100">
                Shop Now
              </Link>
              <Link
                href="/vendor/dashboard"
                className="btn-secondary bg-transparent border-white text-white hover:bg-green-600"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <Image
              src="/hero-image.jpg"
              alt="Fresh groceries"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Decorative shapes */}
        <div
          className="hidden md:block absolute bottom-0 left-0 w-full h-24 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 60%, 0 0)" }}
        ></div>
      </section>

      {/* Search Bar */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl mx-auto">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search for fruits, vegetables, dairy and more..."
              className="w-full py-2 focus:outline-none text-gray-700"
            />
            <button className="btn-primary ml-4">Search</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <Leaf className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">100% Organic</h3>
            <p className="text-gray-600">
              We source our products from certified organic farms to ensure the highest quality.
            </p>
          </div>

          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <Truck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Get your groceries delivered to your doorstep within hours of placing your order.
            </p>
          </div>

          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-gray-600">Your transactions are secure with our trusted payment processing system.</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4 py-12 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${category.name}`}
              className="group relative overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
            >
              <div className="aspect-square relative">
                <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link href="/products" className="text-green-600 hover:text-green-700 flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id?.toString()} product={product} onAddToCart={() => {}} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold mr-4">
                  S
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-gray-500 text-sm">Regular Customer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "I love the quality of the produce from KirnaMart. Everything is always fresh and the delivery is
                prompt. Great service!"
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold mr-4">
                  M
                </div>
                <div>
                  <h4 className="font-semibold">Michael Dawson</h4>
                  <p className="text-gray-500 text-sm">Loyal Customer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The organic selection is impressive and the prices are reasonable. I've switched all my grocery
                shopping to KirnaMart!"
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold mr-4">
                  A
                </div>
                <div>
                  <h4 className="font-semibold">Amanda Lewis</h4>
                  <p className="text-gray-500 text-sm">New Customer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "First time ordering and I'm impressed! The app is easy to use and the delivery was faster than
                expected. Will order again!"
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

