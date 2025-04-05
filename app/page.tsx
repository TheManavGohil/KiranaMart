import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Leaf, Truck, ShieldCheck, Search, MapPin, Star, Clock } from "lucide-react"
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
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 z-10 animate-slideUp">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Fresh Groceries Delivered to Your Door</h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Shop for fresh, organic products from local vendors and get them delivered straight to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-primary bg-white text-green-600 hover:bg-green-100 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700">
                Shop Now
              </Link>
              <Link
                href="/vendor/dashboard"
                className="btn-secondary bg-transparent border-white text-white hover:bg-green-600 dark:hover:bg-green-700"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="rounded-lg overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
              <Image
                src="/hero-image.jpg"
                alt="Fresh groceries"
                width={600}
                height={400}
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>

        {/* Decorative shapes */}
        <div
          className="hidden md:block absolute bottom-0 left-0 w-full h-24 bg-white dark:bg-gray-900"
          style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 60%, 0 0)" }}
        ></div>
      </section>

      {/* Search Bar */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-3xl mx-auto border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search for fruits, vegetables, dairy and more..."
              className="w-full py-2 focus:outline-none text-gray-700 dark:text-gray-200 bg-transparent"
            />
            <button className="btn-primary ml-4 whitespace-nowrap">Search</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-green-50 dark:bg-gray-800 rounded-lg shadow-sm transition-transform duration-300 hover:scale-105 border border-transparent hover:border-green-200 dark:hover:border-green-800">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
              <Leaf className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">100% Organic</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We source our products from certified organic farms to ensure the highest quality.
            </p>
          </div>

          <div className="text-center p-6 bg-green-50 dark:bg-gray-800 rounded-lg shadow-sm transition-transform duration-300 hover:scale-105 border border-transparent hover:border-green-200 dark:hover:border-green-800">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
              <Truck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get your groceries delivered to your doorstep within hours of placing your order.
            </p>
          </div>

          <div className="text-center p-6 bg-green-50 dark:bg-gray-800 rounded-lg shadow-sm transition-transform duration-300 hover:scale-105 border border-transparent hover:border-green-200 dark:hover:border-green-800">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-gray-600 dark:text-gray-300">Your transactions are secure with our trusted payment processing system.</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4 py-12 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${category.name}`}
              className="group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="aspect-square relative">
                <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300">{category.name}</h3>
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
          <Link href="/products" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center group">
            View All <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id?.toString()} product={product} onAddToCart={() => {}} />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-green-50 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose KirnaMart?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Organic & Fresh</h3>
              <p className="text-gray-600 dark:text-gray-300">
                100% organic products sourced fresh from local farms.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Local Vendors</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Supporting local businesses and reducing carbon footprint.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Stringent quality checks for all products we deliver.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Same Day Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Order before 2 PM for same-day delivery in select areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-bold mr-4">
                  S
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <div className="flex text-yellow-400 mt-1">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "I love the quality of the produce from KirnaMart. Everything is always fresh and the delivery is
                prompt. Great service!"
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-bold mr-4">
                  M
                </div>
                <div>
                  <h4 className="font-semibold">Michael Dawson</h4>
                  <div className="flex text-yellow-400 mt-1">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "The organic selection is impressive and the prices are reasonable. I've switched all my grocery
                shopping to KirnaMart!"
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-bold mr-4">
                  A
                </div>
                <div>
                  <h4 className="font-semibold">Amanda Lewis</h4>
                  <div className="flex text-yellow-400 mt-1">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
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

