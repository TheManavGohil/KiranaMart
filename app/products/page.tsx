import { Suspense } from "react"
import Link from "next/link"
import { Filter, Loader } from "lucide-react"
import ProductCard from "@/components/product-card"
import { getProducts } from "@/lib/db"

interface ProductsPageProps {
  searchParams: {
    category?: string
    sort?: string
    page?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const category = searchParams.category
  const page = Number.parseInt(searchParams.page || "1")
  const limit = 12
  const skip = (page - 1) * limit

  const products = await getProducts(limit, skip, category)

  const categories = ["All", "Fruits", "Vegetables", "Dairy", "Bakery", "Grains", "Condiments", "Nuts"]

  const sortOptions = [
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
    { value: "name_desc", label: "Name: Z to A" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Products</h1>

      {/* Mobile Filter Buttons */}
      <div className="flex justify-between md:hidden mb-4">
        <button className="btn-secondary flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>

        <select className="form-input py-2 px-4 w-40" defaultValue="">
          <option value="" disabled>
            Sort By
          </option>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Categories</h2>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={cat === "All" ? "/products" : `/products?category=${cat}`}
                    className={`block py-2 px-3 rounded-md transition ${
                      (cat === "All" && !category) || cat === category
                        ? "bg-green-500 text-white"
                        : "hover:bg-green-100"
                    }`}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-200 my-6 pt-6">
              <h2 className="font-semibold text-lg mb-4">Sort By</h2>
              <select className="form-input py-2 px-3 w-full" defaultValue="">
                <option value="" disabled>
                  Select option
                </option>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-200 my-6 pt-6">
              <h2 className="font-semibold text-lg mb-4">Price Range</h2>
              <div className="flex space-x-4">
                <input type="number" placeholder="Min" className="form-input py-2 px-3 w-full" />
                <input type="number" placeholder="Max" className="form-input py-2 px-3 w-full" />
              </div>
              <button className="btn-primary w-full mt-4">Apply</button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-grow">
          <Suspense fallback={<LoadingProducts />}>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id?.toString()} product={product} onAddToCart={() => {}} />
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
                <p className="text-yellow-700">No products found. Try different filters or check back later!</p>
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <div className="flex space-x-1">
              <Link
                href={`/products?page=${page > 1 ? page - 1 : 1}${category ? `&category=${category}` : ""}`}
                className={`px-4 py-2 border rounded-md ${
                  page <= 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-green-50"
                }`}
              >
                Previous
              </Link>

              {[...Array(3)].map((_, i) => {
                const pageNumber = page - 1 + i
                if (pageNumber < 1) return null

                return (
                  <Link
                    key={pageNumber}
                    href={`/products?page=${pageNumber}${category ? `&category=${category}` : ""}`}
                    className={`px-4 py-2 border rounded-md ${
                      pageNumber === page ? "bg-green-500 text-white" : "hover:bg-green-50"
                    }`}
                  >
                    {pageNumber}
                  </Link>
                )
              })}

              <Link
                href={`/products?page=${page + 1}${category ? `&category=${category}` : ""}`}
                className="px-4 py-2 border rounded-md hover:bg-green-50"
              >
                Next
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingProducts() {
  return (
    <div className="text-center py-12">
      <Loader className="w-10 h-10 animate-spin text-green-500 mx-auto" />
      <p className="mt-4 text-gray-600">Loading products...</p>
    </div>
  )
}

