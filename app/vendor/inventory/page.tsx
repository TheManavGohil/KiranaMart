"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Search, Filter, ArrowUpDown, AlertTriangle, Edit, Truck, PackageCheck, Plus, Loader2
} from "lucide-react"
import { getToken } from "@/lib/auth"

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

  // Handle adding a new product (placeholder for now)
  const handleAddProduct = () => {
    console.log("Add product clicked");
    // Will implement the add product modal later
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

      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md mb-6 border border-gray-100 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products in table..."
                className="form-input pl-10 w-full rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <div>
              <select
                className="form-input py-2 rounded-lg w-full md:w-auto"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    Category: {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="low-stock"
                className="mr-2 h-4 w-4 rounded text-green-600 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-green-500"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              <label htmlFor="low-stock" className="text-gray-700 dark:text-gray-300 text-sm">Low Stock Only</label>
            </div>
            <button className="btn-secondary flex items-center justify-center px-4 py-2 rounded-lg text-sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Image</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Product
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Category
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Price
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Stock
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                  <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Last Restocked
                    <ArrowUpDown className="ml-1 w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                      <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100">{item.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100">₹{item.price.toFixed(2)}/{item.unit}</td>
                  <td className="py-3 px-4">
                    <span className={`${item.stock <= 5 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"} font-medium`}>{item.stock}</span>
                    {item.stock <= 5 && (
                      <span className="ml-2 text-xs inline-block px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-full font-medium">
                        {item.stock === 0 ? "Out of Stock" : "Low Stock"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.lastRestocked || "N/A"}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => openRestockModal(item)}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-full transition-colors"
                        aria-label={`Restock ${item.name}`}
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <PackageCheck className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-lg font-medium">No inventory found matching your criteria.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 animate-slideUp border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                 <Truck className="mr-2 h-5 w-5 text-green-500"/> Restock Item
                </h2>
                <button onClick={() => setIsRestockModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-1">Product: <span className="font-semibold text-gray-800 dark:text-white">{selectedProduct.name}</span></p>
                <p className="text-gray-600 dark:text-gray-300 mb-3">Current Stock: <span className="font-semibold text-gray-800 dark:text-white">{selectedProduct.stock}</span></p>
                
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Add Stock</label>
                <input
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="form-input w-full rounded-lg"
                  min="1"
                  placeholder="Enter amount to add"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRestockModalOpen(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestock}
                  disabled={!restockAmount || parseInt(restockAmount) <= 0}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    !restockAmount || parseInt(restockAmount) <= 0
                      ? "bg-green-300 cursor-not-allowed text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  Restock Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && editedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-4 animate-slideUp border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                 <Edit className="mr-2 h-5 w-5 text-blue-500"/> Edit Product Details
                </h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editedProduct.name}
                    onChange={(e) => setEditedProduct({...editedProduct, name: e.target.value})}
                    className="form-input w-full rounded-lg"
                    placeholder="Product Name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={editedProduct.category}
                    onChange={(e) => setEditedProduct({...editedProduct, category: e.target.value})}
                    className="form-input w-full rounded-lg"
                  >
                    {categories.filter(cat => cat !== 'All').map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Price</label>
                  <input
                    type="number"
                    value={editedProduct.price}
                    onChange={(e) => setEditedProduct({...editedProduct, price: parseFloat(e.target.value)})}
                    className="form-input w-full rounded-lg"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <select
                    value={editedProduct.unit}
                    onChange={(e) => setEditedProduct({...editedProduct, unit: e.target.value})}
                    className="form-input w-full rounded-lg"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={editedProduct.stock}
                    onChange={(e) => setEditedProduct({...editedProduct, stock: parseInt(e.target.value)})}
                    className="form-input w-full rounded-lg"
                    min="0"
                    placeholder="Stock Level"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={editedProduct.imageUrl}
                    onChange={(e) => setEditedProduct({...editedProduct, imageUrl: e.target.value})}
                    className="form-input w-full rounded-lg"
                    placeholder="Image URL"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={editedProduct.description}
                    onChange={(e) => setEditedProduct({...editedProduct, description: e.target.value})}
                    className="form-input w-full rounded-lg min-h-[100px]"
                    placeholder="Product Description"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editedProduct.name || editedProduct.price <= 0}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    !editedProduct.name || editedProduct.price <= 0
                      ? "bg-blue-300 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

