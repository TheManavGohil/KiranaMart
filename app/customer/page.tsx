'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LucideSearch, LucideShoppingCart } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image?: string;
  imageUrl?: string;
  categoryId?: string;
  category: string;
  category_id?: string;
  vendorId: string;
  stock: number;
  isAvailable: boolean;
}

// Helper functions for category styling
function getCategoryIcon(category: string): string {
  const iconMap: { [key: string]: string } = {
    'Biscuits & Snacks': 'snacks.png',
    'Beverages': 'beverages.png',
    'Fruits': 'fruits.png',
    'Vegetables': 'vegetables.png',
    'Dairy': 'dairy.png',
    'Bakery': 'bakery.png'
  };
  return iconMap[category] || 'all.png';
}

function getCategoryBgColor(category: string): string {
  const bgColorMap: { [key: string]: string } = {
    'Biscuits & Snacks': 'bg-orange-100',
    'Beverages': 'bg-blue-100',
    'Fruits': 'bg-red-100',
    'Vegetables': 'bg-green-100',
    'Dairy': 'bg-yellow-100',
    'Bakery': 'bg-amber-100'
  };
  return bgColorMap[category] || 'bg-gray-100';
}

export default function CustomerHomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        console.log('Fetched categories:', categoriesData);
        setCategories(categoriesData);

        // Fetch products
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        console.log('Fetched products:', productsData);
        // Log the structure of the first product to see all available fields
        if (productsData.length > 0) {
          console.log('Sample product structure:', Object.keys(productsData[0]));
        }
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sort products based on selected option
  const sortProducts = (products: Product[]) => {
    if (!sortOption) return products;
    
    return [...products].sort((a, b) => {
      switch (sortOption) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  };

  const filteredProducts = sortProducts(products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Don't filter by category if 'All' is selected or no category is selected
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || product.category === selectedCategory;
    
    console.log('Filtering product:', {
      productId: product._id,
      productName: product.name,
      productCategory: product.category,
      selectedCategory,
      matchesCategory,
      matchesSearch
    });
    
    return matchesSearch && matchesCategory;
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Get the actual category IDs from the fetched categories
  const categoryMap = categories.reduce((acc, cat) => {
    console.log('Mapping category:', cat.name, 'with ID:', cat._id);
    acc[cat.name.toLowerCase()] = cat._id;
    return acc;
  }, {} as Record<string, string>);

  // Log the complete category mapping
  console.log('Category ID mapping:', categoryMap);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-xl overflow-hidden">
        <Image
          src="/images/hero-banner.jpg"
          alt="Fresh groceries delivered to your doorstep"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Fresh Groceries Delivered to Your Doorstep
            </h1>
            <p className="text-xl text-white mb-8">
              Shop from a wide range of fresh fruits, vegetables, and daily essentials
            </p>
            <Link
              href="/customer"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <LucideSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Sort Filter */}
        <div className="w-48">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            <option value="">Sort by price</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="relative bg-white shadow-sm rounded-lg">
        <div className="overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex space-x-4 px-4 py-4 min-w-full">
            {[
              { id: null, name: 'All', icon: 'all.png', bg: 'bg-gray-100' },
              ...Array.from(new Set(products.map(p => p.category))).map(cat => ({
                id: cat,
                name: cat,
                icon: getCategoryIcon(cat),
                bg: getCategoryBgColor(cat)
              }))
            ].map(category => (
              <button
                key={category.id ?? 'all'}
                onClick={() => {
                  console.log('Selected category:', category.name);
                  setSelectedCategory(category.name);
                }}
                className={`flex flex-col items-center space-y-1.5 min-w-[68px] transition-all ${
                  selectedCategory === category.name ? 'text-green-600 scale-105' : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <div className={`w-14 h-14 ${category.bg} rounded-full flex items-center justify-center shadow-sm`}>
                  <Image
                    src={`/icons/${category.icon}`}
                    alt={category.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-center leading-tight">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      {(!selectedCategory || selectedCategory === 'All') && (
        <section className="relative">
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          <div className="relative overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex animate-infinite-scroll">
                {/* First set of products */}
                {filteredProducts.map((product) => (
                  <div key={`first-${product._id}`} className="flex-none w-[280px] px-2">
                    <Link
                      href={`/customer/products/${product._id}`}
                      className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative h-48">
                        <Image
                          src={product.image || product.imageUrl || '/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-600">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {product.unit}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
                {/* Duplicate set for infinite scroll */}
                {filteredProducts.map((product) => (
                  <div key={`second-${product._id}`} className="flex-none w-[280px] px-2">
                    <Link
                      href={`/customer/products/${product._id}`}
                      className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative h-48">
                        <Image
                          src={product.image || product.imageUrl || '/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-600">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {product.unit}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
          </div>
        </section>
      )}

      {/* Category-wise Product Sections */}
      {(!selectedCategory || selectedCategory === 'All') ? (
        Array.from(new Set(products.map(p => p.category))).map(categoryName => {
          const categoryProducts = products.filter(p => p.category === categoryName);
          if (categoryProducts.length === 0) return null;

          return (
            <section key={categoryName} className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{categoryName}</h2>
              </div>
              
              <div className="relative">
                <div className="overflow-x-auto hide-scrollbar">
                  <div className="flex space-x-4 pb-4">
                    {categoryProducts.slice(0, 6).map((product) => (
                      <div key={product._id} className="flex-none w-[280px]">
                        <Link
                          href={`/customer/products/${product._id}`}
                          className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                        >
                          <div className="relative h-48">
                            <Image
                              src={product.image || product.imageUrl || '/placeholder.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-green-600">
                                ₹{product.price.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {product.unit}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
              </div>
            </section>
          );
        })
      ) : (
        // Show filtered products in a grid when a specific category is selected
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">{selectedCategory} Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                href={`/customer/products/${product._id}`}
                className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <div className="relative h-48">
                  <Image
                    src={product.image || product.imageUrl || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.unit}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-8 text-center">Why Choose KiranaStore?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fresh Products</h3>
            <p className="text-gray-600">
              We source fresh products directly from local vendors and farmers
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Get your orders delivered within 30 minutes of placing them
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-600">
              Competitive prices with regular deals and discounts
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 