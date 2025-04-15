export interface Variant {
  id: string; // Unique ID for this specific variant
  name: string; // Full variant name (e.g., "Parle-G Biscuit 70g")
  unit: string;
  description?: string;
  imageUrl?: string; 
  // Add other variant-specific fields if needed (e.g., barcode, size)
}

export interface BaseProduct {
  baseId: string; // Unique ID for the base product group
  baseName: string; // Name of the product group (e.g., "Parle-G Biscuit")
  category: string;
  variants: Variant[];
}

// Sample Catalog with nested variants
export const predefinedProductCatalog: BaseProduct[] = [
  {
    baseId: 'base-parle-g',
    baseName: 'Parle-G Biscuit',
    category: 'Biscuits & Snacks',
    variants: [
      { id: 'pdp-001', name: 'Parle-G Biscuit 70g', unit: 'pack', description: 'Classic Parle-G glucose biscuits.', imageUrl: '/images/catalog/parle-g.jpg' },
      { id: 'pdp-101', name: 'Parle-G Biscuit Family Pack 250g', unit: 'pack', description: 'Classic Parle-G glucose biscuits - Family Pack.', imageUrl: '/images/catalog/parle-g.jpg' },
    ]
  },
  {
    baseId: 'base-good-day',
    baseName: 'Britannia Good Day Cashew',
    category: 'Biscuits & Snacks',
    variants: [
      { id: 'pdp-002', name: 'Britannia Good Day Cashew 60g', unit: 'pack', description: 'Buttery cookies with cashew.', imageUrl: '/images/catalog/good-day.jpg' },
      // Add other Good Day variants if available
    ]
  },
  {
    baseId: 'base-lays-classic',
    baseName: 'Lays Classic Salted Chips',
    category: 'Biscuits & Snacks',
    variants: [
      { id: 'pdp-003', name: 'Lays Classic Salted 52g', unit: 'pack', description: 'Classic salted potato chips.', imageUrl: '/images/catalog/lays.jpg' },
      { id: 'pdp-103', name: 'Lays Classic Salted Party Pack 150g', unit: 'pack', description: 'Classic salted potato chips - Party Pack.', imageUrl: '/images/catalog/lays.jpg' },
    ]
  },
  {
    baseId: 'base-aloo-bhujia',
    baseName: "Haldiram's Aloo Bhujia",
    category: 'Biscuits & Snacks',
    variants: [
      { id: 'pdp-004', name: "Haldiram's Aloo Bhujia 150g", unit: 'pack', description: 'Spicy potato noodle snack.', imageUrl: '/images/catalog/aloo-bhujia.jpg' },
      // Add other sizes if available
    ]
  },
  {
    baseId: 'base-coke',
    baseName: 'Coca-Cola',
    category: 'Beverages',
    variants: [
      { id: 'pdp-005', name: 'Coca-Cola Can 300ml', unit: 'can', description: 'Classic Coca-Cola soft drink.', imageUrl: '/images/catalog/coke-can.jpg' },
      { id: 'pdp-105', name: 'Coca-Cola Bottle 500ml', unit: 'bottle', description: 'Classic Coca-Cola soft drink.', imageUrl: '/images/catalog/coke-bottle.jpg' },
      { id: 'pdp-205', name: 'Coca-Cola Bottle 1.25L', unit: 'bottle', description: 'Classic Coca-Cola soft drink.', imageUrl: '/images/catalog/coke-bottle-large.jpg' },
    ]
  },
  {
    baseId: 'base-pepsi',
    baseName: 'Pepsi',
    category: 'Beverages',
    variants: [
        { id: 'pdp-006', name: 'Pepsi Can 300ml', unit: 'can', description: 'Classic Pepsi soft drink.', imageUrl: '/images/catalog/pepsi-can.jpg' },
        { id: 'pdp-106', name: 'Pepsi Bottle 500ml', unit: 'bottle', description: 'Classic Pepsi soft drink.', imageUrl: '/images/catalog/pepsi-bottle.jpg' },
        // Add other Pepsi sizes
    ]
  },
  // ... Add other base products and their variants following this structure ...
  {
    baseId: 'base-aashirvaad-atta',
    baseName: 'Aashirvaad Atta',
    category: 'Staples & Groceries',
    variants: [
      { id: 'pdp-009', name: 'Aashirvaad Atta 1kg', unit: 'kg', description: 'Whole wheat flour.', imageUrl: '/images/catalog/aashirvaad-atta.jpg' },
      { id: 'pdp-109', name: 'Aashirvaad Atta 5kg', unit: 'kg', description: 'Whole wheat flour - 5kg pack.', imageUrl: '/images/catalog/aashirvaad-atta.jpg' },
    ]
  },
];

// Exporting the types for use elsewhere if needed
// export type { Variant, BaseProduct }; 