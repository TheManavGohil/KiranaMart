import { useState, useMemo } from 'react';
import Image from 'next/image';
import { X, Search, ArrowLeft } from 'lucide-react';
import { BaseProduct, Variant } from '@/lib/predefinedProducts';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: BaseProduct[];
  onSelectProduct: (product: Variant, category: string) => void;
}

export default function CatalogModal({
  isOpen,
  onClose,
  catalog,
  onSelectProduct,
}: CatalogModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBaseProduct, setSelectedBaseProduct] = useState<BaseProduct | null>(null);

  const filteredBaseCatalog = useMemo(() => {
    if (!searchTerm) {
      return catalog;
    }
    return catalog.filter(base => 
      base.baseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      base.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      base.variants.some(variant => variant.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [catalog, searchTerm]);

  if (!isOpen) return null;

  const handleSelectBase = (baseProduct: BaseProduct) => {
    setSelectedBaseProduct(baseProduct);
    setSearchTerm('');
  };

  const handleSelectVariant = (variant: Variant) => {
    if (selectedBaseProduct) {
      onSelectProduct(variant, selectedBaseProduct.category);
      setSelectedBaseProduct(null);
      setSearchTerm('');
    }
  };

  const handleGoBack = () => {
    setSelectedBaseProduct(null);
    setSearchTerm('');
  };

  const getBaseProductImage = (baseProduct: BaseProduct): string => {
    return baseProduct.variants[0]?.imageUrl || '/placeholder.svg';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-slideUp border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 rounded-t-lg z-20">
          <div className="flex items-center">
            {selectedBaseProduct && (
              <button onClick={handleGoBack} className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {selectedBaseProduct ? `Select Variant for ${selectedBaseProduct.baseName}` : 'Select Product from Catalog'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        {!selectedBaseProduct && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-[69px] bg-white dark:bg-gray-800 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 w-full rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        {/* Content Area (Base Products or Variants) */}
        <div className="overflow-y-auto flex-grow p-4">
          {selectedBaseProduct ? (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Choose the specific size/package for <strong>{selectedBaseProduct.baseName}</strong>.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedBaseProduct.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleSelectVariant(variant)}
                    className="block border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 text-left p-3 bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="relative w-full h-24 mb-2 rounded overflow-hidden bg-gray-200 dark:bg-gray-600">
                      <Image
                        src={variant.imageUrl || '/placeholder.svg'}
                        alt={variant.name}
                        fill
                        className="object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'}}
                      />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate" title={variant.name}>{variant.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Unit: {variant.unit}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            filteredBaseCatalog.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredBaseCatalog.map((baseProduct) => (
                  <button
                    key={baseProduct.baseId}
                    onClick={() => handleSelectBase(baseProduct)}
                    disabled={baseProduct.variants.length === 0}
                    className="block border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 text-left p-3 bg-gray-50 dark:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="relative w-full h-24 mb-2 rounded overflow-hidden bg-gray-200 dark:bg-gray-600">
                      <Image
                        src={getBaseProductImage(baseProduct)}
                        alt={baseProduct.baseName}
                        fill
                        className="object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'}}
                      />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate" title={baseProduct.baseName}>{baseProduct.baseName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{baseProduct.category}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{baseProduct.variants.length} variant(s)</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No products found matching "{searchTerm}".</p>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm rounded-b-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {selectedBaseProduct ? 'Select the variant you want to add.' : 'Select a product to see available variants.'}
          </p>
        </div>
      </div>
    </div>
  );
} 