import { useState, useRef, useEffect } from "react";
import { Loader2, Plus, X, Upload } from "lucide-react";
import Image from "next/image";
import { apiCall } from "@/lib/api";
import { toast } from "sonner";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: ProductData) => Promise<void>;
  categories: string[];
  units: string[];
  initialData?: Partial<ProductData> | null;
}

export interface ProductData {
  name: string;
  category: string;
  stock: number;
  imageUrl: string;
  price: number;
  unit: string;
  description: string;
  manufacturingDate?: string;
  expiryDate?: string;
}

const initialProductState: ProductData = {
  name: "",
  category: "Fruits",
  stock: 0,
  imageUrl: "/placeholder.svg",
  price: 0,
  unit: "kg",
  description: "",
  manufacturingDate: "",
  expiryDate: "",
};

export default function AddProductModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  units,
  initialData
}: AddProductModalProps) {
  if (!isOpen) return null;

  const [product, setProduct] = useState<ProductData>({
    ...initialProductState,
    ...(initialData || {}),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || initialProductState.imageUrl);
  const [productImageBase64, setProductImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCatalogMode = !!initialData;

  useEffect(() => {
    setProduct({
      ...initialProductState,
      ...(initialData || {}),
    });
    setImagePreview(initialData?.imageUrl || initialProductState.imageUrl);
    setProductImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (e.target.type === 'file') return;

    if (name === "price") {
      setProduct({ ...product, [name]: parseFloat(value) || 0 });
    } else if (name === "stock") {
      setProduct({ ...product, [name]: parseInt(value) || 0 });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image file is too large. Max size is 2MB.");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Invalid file type. Please select an image.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setImagePreview(imageDataUrl);
        setProductImageBase64(imageDataUrl);
      };
      reader.onerror = () => {
        toast.error("Failed to read the image file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!product.name || product.price <= 0 || (isCatalogMode && product.stock < 0)) {
      toast.warning("Please fill in required fields (Name, Price, Stock >= 0).");
      return;
    }
    
    let finalImageUrl = isCatalogMode && !productImageBase64 ? product.imageUrl : initialProductState.imageUrl;
    
    setIsSubmitting(true);
    
    if (productImageBase64) {
        setIsUploadingImage(true);
        try {
            const uploadResponse = await apiCall<{ secure_url: string }>('/api/products/upload-image', {
                method: 'POST',
                body: JSON.stringify({ imageData: productImageBase64 }),
            });
            finalImageUrl = uploadResponse.secure_url;
            toast.success("Product image uploaded successfully!");
        } catch (uploadError: any) {
            console.error("Failed to upload product image:", uploadError);
            toast.error(`Image upload failed: ${uploadError.message || 'Unknown error'}`);
            setIsUploadingImage(false);
            setIsSubmitting(false);
            return;
        } finally {
            setIsUploadingImage(false);
        }
    } else if (!finalImageUrl) {
        finalImageUrl = initialProductState.imageUrl;
    }

    const productToSubmit = {
      ...product,
      imageUrl: finalImageUrl,
      ...(product.manufacturingDate && { manufacturingDate: new Date(product.manufacturingDate) }),
      ...(product.expiryDate && { expiryDate: new Date(product.expiryDate) }),
    };

    try {
      await onSubmit(productToSubmit as any); 
      toast.success("Product added successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to add product details:", error);
      toast.error(`Failed to add product: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-4 animate-slideUp border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <Plus className="mr-2 h-5 w-5 text-green-500" /> {isCatalogMode ? 'Add Stock for Catalog Item' : 'Add New Product'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2 flex flex-col md:flex-row gap-4 items-center mb-2">
                <div 
                    className={`relative w-24 h-24 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 flex-shrink-0 ${isCatalogMode ? 'cursor-default' : 'cursor-pointer group'}`} 
                    onClick={!isCatalogMode ? triggerFileInput : undefined}
                    title={isCatalogMode ? product.name : "Click to upload image"}
                >
                    <Image 
                      src={imagePreview} 
                      alt="Product Image Preview" 
                      fill 
                      className={`object-cover transition-opacity duration-300 ${isUploadingImage ? 'opacity-50' : 'group-hover:opacity-70'}`}
                      onError={() => setImagePreview("/placeholder.svg")} 
                    />
                    {!isCatalogMode && !productImageBase64 && !isUploadingImage && (
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-40">
                             <Upload className="w-6 h-6 text-white" />
                         </div>
                    )}
                    {isUploadingImage && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                         </div>
                    )}
                </div>
                <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    disabled={isCatalogMode}
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                   {isCatalogMode ? `Image for ${product.name}` : `Click the image preview to upload a new product image.<br/>
                   Max size: 2MB. Recommended: Square aspect ratio.`}
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
                disabled={isCatalogMode}
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
                disabled={isCatalogMode}
              >
                {isCatalogMode ? <option value={product.category}>{product.category}</option> : categories.filter((cat) => cat !== "All").map((category) => (
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
                disabled={isCatalogMode}
              >
                {isCatalogMode ? <option value={product.unit}>{product.unit}</option> : units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                {isCatalogMode ? 'Quantity to Add*' : 'Initial Stock'}
              </label>
              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                className="form-input w-full rounded-lg"
                min="0"
                placeholder={isCatalogMode ? 'Enter quantity' : 'Enter initial stock'}
                required={isCatalogMode}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Manufacturing Date
              </label>
              <input
                type="date"
                name="manufacturingDate"
                value={product.manufacturingDate}
                onChange={handleChange}
                className="form-input w-full rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={product.expiryDate}
                onChange={handleChange}
                className="form-input w-full rounded-lg"
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
                disabled={isCatalogMode}
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
              disabled={isSubmitting || isUploadingImage}
              className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!product.name || product.price <= 0 || isSubmitting || isUploadingImage}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
                !product.name || product.price <= 0 || isSubmitting || isUploadingImage
                  ? "bg-green-300 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {(isSubmitting || isUploadingImage) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isUploadingImage ? 'Uploading Image...' : isSubmitting ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 