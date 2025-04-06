"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Search, Filter, ArrowUpDown, AlertTriangle, Edit, Truck, PackageCheck, Plus, Loader2
} from "lucide-react"
import { getToken } from "@/lib/auth"
import AddProductModal, { ProductData } from "./components/AddProductModal"

// Define types for our product data
interface Product {
  _id: string;
  name: string;
  category: string;
  stock: number;
  imageUrl: string;
  price: number;
  unit: string;
  description: string;
  lastRestocked: string;
  vendorId: string;
}

export default function VendorInventoryProductsPage() {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showLowStock, setShowLowStock] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ["All", "Fruits", "Vegetables", "Dairy", "Bakery", "Grains"];
  const units = ["kg", "g", "pack", "bundle", "dozen", "piece", "liter"];

  // Fetch inventory data from API
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/vendor/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch inventory data');
      }

      const data = await response.json();
      setInventory(data);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new product
  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  // Handle submitting a new product
  const handleSubmitNewProduct = async (productData: ProductData) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('/api/vendor/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }
      
      const result = await response.json();
      
      // Add the new product to the inventory
      setInventory([...inventory, result.product]);
      
      // Close the modal
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error('Error adding product:', err);
      alert(`Error: ${err.message}`);
      throw err; // Rethrow to be handled by the modal
    }
  };

  // Open the restock modal for a product
  const openRestockModal = (product: Product) => {
    setSelectedProduct(product);
    setRestockAmount("");
    setIsRestockModalOpen(true);
  };

  // Open the edit modal for a product
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditedProduct({ ...product });
    setIsEditModalOpen(true);
  };

  // Handle restocking a product
  const handleRestock = async () => {
    if (!selectedProduct || !restockAmount) return;
    
    try {
      const newStock = selectedProduct.stock + parseInt(restockAmount);
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/vendor/inventory?id=${selectedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stock: newStock })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restock product');
      }
      
      // Update the local state
      setInventory(inventory.map(item => 
        item._id === selectedProduct._id ? { ...item, stock: newStock, lastRestocked: new Date().toISOString().split('T')[0] } : item
      ));
      
      setIsRestockModalOpen(false);
    } catch (err: any) {
      console.error('Error restocking product:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle saving product edits
  const handleSaveEdit = async () => {
    if (!editedProduct) return;
    
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/vendor/inventory?id=${editedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedProduct)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }
      
      // Update the local state
      setInventory(inventory.map(item => 
        item._id === editedProduct._id ? editedProduct : item
      ));
      
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error('Error updating product:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Fetch inventory data on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter inventory based on search, category, and low stock
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesLowStock = showLowStock ? item.stock <= 5 : true;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Calculate inventory statistics
  const totalProducts = inventory.length;
  const lowStockCount = inventory.filter(item => item.stock <= 5).length;
  const outOfStockCount = inventory.filter(item => item.stock === 0).length;
  const restockedTodayCount = inventory.filter(item => 
    item.lastRestocked === new Date().toISOString().split('T')[0]
  ).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading inventory...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Error Loading Inventory</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => fetchInventory()}
            className="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <div/>
        <button 
          onClick={handleAddProduct}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all dark:bg-green-500 dark:hover:bg-green-600"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500 dark:border-green-400 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Products</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800 dark:text-gray-100">{totalProducts}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
              <PackageCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500 dark:border-red-400 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Low Stock Items</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800 dark:text-gray-100">{lowStockCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500 dark:border-blue-400 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Restocked Today</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800 dark:text-gray-100">{restockedTodayCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-500 dark:border-yellow-400 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Out of Stock</p>
              <h3 className="font-bold text-2xl mt-1 text-gray-800 dark:text-gray-100">{outOfStockCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mb-6 border border-gray-100 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="lowStock"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              <label htmlFor="lowStock" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Low Stock Only
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Inventory Items ({filteredInventory.length})</h2>
          
          {filteredInventory.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => {}}>
                      <div className="flex items-center">
                        Category
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => {}}>
                      <div className="flex items-center">
                        Stock
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => {}}>
                      <div className="flex items-center">
                        Price
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Restocked
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInventory.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            <Image
                              className="h-10 w-10 rounded-full object-cover"
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              width={40}
                              height={40}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{product.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          product.stock <= 0 
                            ? "text-red-600 dark:text-red-400 font-medium" 
                            : product.stock <= 5 
                              ? "text-yellow-600 dark:text-yellow-400 font-medium" 
                              : "text-gray-900 dark:text-gray-100"
                        }`}>
                          {product.stock <= 0 
                            ? "Out of stock" 
                            : product.stock <= 5 
                              ? `${product.stock} - Low Stock!` 
                              : product.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">₹{product.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {product.lastRestocked || "Not recorded"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openRestockModal(product)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Restock"
                          >
                            <Truck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 animate-slideUp">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Restock: {selectedProduct.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Current stock: <span className="font-semibold">{selectedProduct.stock}</span></p>
              
              <div className="mb-4">
                <label htmlFor="restockAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Add Stock
                </label>
                <input
                  type="number"
                  id="restockAmount"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  min="1"
                  placeholder="Enter amount to add"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setIsRestockModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  onClick={handleRestock}
                  disabled={!restockAmount || parseInt(restockAmount) <= 0}
                >
                  Restock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl mx-4 animate-slideUp">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Edit Product</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2 flex items-center gap-4 mb-2">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
                    <Image 
                      src={editedProduct.imageUrl || "/placeholder.svg"} 
                      alt="Product image"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={editedProduct.imageUrl}
                      onChange={(e) => setEditedProduct({...editedProduct, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editedProduct.name}
                    onChange={(e) => setEditedProduct({...editedProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={editedProduct.category}
                    onChange={(e) => setEditedProduct({...editedProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  >
                    {categories.filter(cat => cat !== "All").map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={editedProduct.price}
                    onChange={(e) => setEditedProduct({...editedProduct, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={editedProduct.unit}
                    onChange={(e) => setEditedProduct({...editedProduct, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={editedProduct.stock}
                    onChange={(e) => setEditedProduct({...editedProduct, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    min="0"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editedProduct.description}
                    onChange={(e) => setEditedProduct({...editedProduct, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Product Modal */}
      <AddProductModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitNewProduct}
        categories={categories}
        units={units}
      />
    </div>
  );
}

