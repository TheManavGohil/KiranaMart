import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import Image from "next/image";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: ProductData) => Promise<void>;
  categories: string[];
  units: string[];
}

export interface ProductData {
  name: string;
  category: string;
  stock: number;
  imageUrl: string;
  price: number;
  unit: string;
  description: string;
}

const initialProductState: ProductData = {
  name: "",
  category: "Fruits",
  stock: 0,
  imageUrl: "/placeholder.svg",
  price: 0,
  unit: "kg",
  description: "",
};

export default function AddProductModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  units,
}: AddProductModalProps) {
  const [product, setProduct] = useState<ProductData>(initialProductState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("/placeholder.svg");

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "price") {
      setProduct({ ...product, [name]: parseFloat(value) || 0 });
    } else if (name === "stock") {
      setProduct({ ...product, [name]: parseInt(value) || 0 });
    } else if (name === "imageUrl") {
      setProduct({ ...product, [name]: value });
      setImagePreview(value || "/placeholder.svg");
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleSubmit = async () => {
    if (!product.name || product.price <= 0) return;

    try {
      setIsSubmitting(true);
      await onSubmit(product);
      setProduct(initialProductState);
      setImagePreview("/placeholder.svg");
    } catch (error) {
      console.error("Failed to add product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setProduct(initialProductState);
    setImagePreview("/placeholder.svg");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-4 animate-slideUp border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <Plus className="mr-2 h-5 w-5 text-green-500" /> Add New Product
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mb-2">
              <div className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                <Image 
                  src={imagePreview} 
                  alt="Product preview" 
                  fill 
                  className="object-cover"
                  onError={() => setImagePreview("/placeholder.svg")} 
                />
              </div>
              <div className="flex-grow">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  value={product.imageUrl}
                  onChange={handleChange}
                  className="form-input w-full rounded-lg"
                  placeholder="Enter image URL (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL for your product image
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Product Name*
              </label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                className="form-input w-full rounded-lg"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Category*
              </label>
              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                className="form-input w-full rounded-lg"
                required
              >
                {categories.filter((cat) => cat !== "All").map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Price*
              </label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                className="form-input w-full rounded-lg"
                min="0"
                step="0.01"
                placeholder="Enter price"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Unit*
              </label>
              <select
                name="unit"
                value={product.unit}
                onChange={handleChange}
                className="form-input w-full rounded-lg"
                required
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                className="form-input w-full rounded-lg"
                min="0"
                placeholder="Enter initial stock"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                className="form-input w-full rounded-lg min-h-[100px]"
                placeholder="Enter product description"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              * Required fields
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-800 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!product.name || product.price <= 0 || isSubmitting}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                !product.name || product.price <= 0 || isSubmitting
                  ? "bg-green-300 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </div>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 