export interface Variant {
    id: string;             // Unique ID for this specific variant
    name: string;           // Full variant name (e.g., "Parle-G Biscuit 70g")
    unit: string;           // Unit of measurement (e.g., pack, kg, bottle)
    description?: string;   // A short description of the variant
    imageUrl?: string;      // Path to product image
  }
  
  export interface BaseProduct {
    baseId: string;         // Unique ID for the base product group
    baseName: string;       // Name of the product group (e.g., "Parle-G Biscuit")
    category: string;       // Category (e.g., Biscuits & Snacks, Beverages)
    variants: Variant[];    // List of variants of the base product
  }
  
  export const predefinedProductCatalog: BaseProduct[] = [
    {
      baseId: 'base-parle-g',
      baseName: 'Parle-G Biscuit',
      category: 'Biscuits & Snacks',
      variants: [
        {
          id: 'pdp-001',
          name: 'Parle-G Biscuit 70g',
          unit: 'pack',
          description: 'Classic Parle-G glucose biscuits.',
          imageUrl: '/images/catalog/parle-g.jpg'
        },
        {
          id: 'pdp-101',
          name: 'Parle-G Biscuit Family Pack 250g',
          unit: 'pack',
          description: 'Family pack of Parle-G biscuits for sharing.',
          imageUrl: '/images/catalog/parle-g.jpg'
        }
      ]
    },
    {
      baseId: 'base-good-day',
      baseName: 'Britannia Good Day Cashew',
      category: 'Biscuits & Snacks',
      variants: [
        {
          id: 'pdp-002',
          name: 'Britannia Good Day Cashew 60g',
          unit: 'pack',
          description: 'Buttery cookies with cashew bits for a crunchy treat.',
          imageUrl: '/images/catalog/good-day.jpg'
        },
        {
          id: 'pdp-202',
          name: 'Britannia Good Day Cashew 120g',
          unit: 'pack',
          description: 'Double the delight – Good Day Cashew in a larger pack.',
          imageUrl: '/images/catalog/good-day.jpg'
        }
      ]
    },
    {
      baseId: 'base-lays-classic',
      baseName: 'Lays Classic Salted Chips',
      category: 'Biscuits & Snacks',
      variants: [
        {
          id: 'pdp-003',
          name: 'Lays Classic Salted 52g',
          unit: 'pack',
          description: 'Crispy, classic salted potato chips.',
          imageUrl: '/images/catalog/lays.jpg'
        },
        {
          id: 'pdp-103',
          name: 'Lays Classic Salted Party Pack 150g',
          unit: 'pack',
          description: 'Party-sized pack of Lays Classic Salted.',
          imageUrl: '/images/catalog/lays.jpg'
        }
      ]
    },
    {
      baseId: 'base-aloo-bhujia',
      baseName: "Haldiram's Aloo Bhujia",
      category: 'Biscuits & Snacks',
      variants: [
        {
          id: 'pdp-004',
          name: "Haldiram's Aloo Bhujia 150g",
          unit: 'pack',
          description: 'Spicy and crunchy potato noodle snack.',
          imageUrl: '/images/catalog/aloo-bhujia.jpg'
        },
        {
          id: 'pdp-104',
          name: "Haldiram's Aloo Bhujia 300g",
          unit: 'pack',
          description: 'Double the crunch with a 300g pack of Aloo Bhujia.',
          imageUrl: '/images/catalog/aloo-bhujia.jpg'
        }
      ]
    },
    {
      baseId: 'base-coke',
      baseName: 'Coca-Cola',
      category: 'Beverages',
      variants: [
        {
          id: 'pdp-005',
          name: 'Coca-Cola Can 300ml',
          unit: 'can',
          description: 'Classic Coca-Cola soft drink in a can.',
          imageUrl: '/images/catalog/coke-can.jpg'
        },
        {
          id: 'pdp-105',
          name: 'Coca-Cola Bottle 500ml',
          unit: 'bottle',
          description: 'Refreshing Coca-Cola in a 500ml bottle.',
          imageUrl: '/images/catalog/coke-bottle.jpg'
        },
        {
          id: 'pdp-205',
          name: 'Coca-Cola Bottle 1.25L',
          unit: 'bottle',
          description: 'Large bottle of classic Coca-Cola for parties.',
          imageUrl: '/images/catalog/coke-bottle-large.jpg'
        }
      ]
    },
    {
      baseId: 'base-pepsi',
      baseName: 'Pepsi',
      category: 'Beverages',
      variants: [
        {
          id: 'pdp-006',
          name: 'Pepsi Can 300ml',
          unit: 'can',
          description: 'Refreshing Pepsi in a 300ml can.',
          imageUrl: '/images/catalog/pepsi-can.jpg'
        },
        {
          id: 'pdp-106',
          name: 'Pepsi Bottle 500ml',
          unit: 'bottle',
          description: 'Classic Pepsi soft drink in a 500ml bottle.',
          imageUrl: '/images/catalog/pepsi-bottle.jpg'
        }
      ]
    },
    {
      baseId: 'base-aashirvaad-atta',
      baseName: 'Aashirvaad Atta',
      category: 'Staples & Groceries',
      variants: [
        {
          id: 'pdp-009',
          name: 'Aashirvaad Atta 1kg',
          unit: 'kg',
          description: 'Whole wheat flour ideal for daily cooking.',
          imageUrl: '/images/catalog/aashirvaad-atta.jpg'
        },
        {
          id: 'pdp-109',
          name: 'Aashirvaad Atta 5kg',
          unit: 'kg',
          description: 'Value pack of Aashirvaad Atta for family use.',
          imageUrl: '/images/catalog/aashirvaad-atta.jpg'
        }
      ]
    },
    {
      baseId: 'base-amul-milk',
      baseName: 'Amul Milk',
      category: 'Dairy & Beverages',
      variants: [
        {
          id: 'pdp-007',
          name: 'Amul Full Cream Milk 1L',
          unit: 'liter',
          description: 'Fresh full-cream milk.',
          imageUrl: 'amul-butter-295.jpeg'
        },
        {
          id: 'pdp-107',
          name: 'Amul Skimmed Milk 1L',
          unit: 'liter',
          description: 'Fresh skimmed milk with reduced fat.',
          imageUrl: 'amul-butter-295.jpeg'
        }
      ]
    },
    {
      baseId: 'base-fresho-apple',
      baseName: 'Fresho Apple',
      category: 'Fresh Produce',
      variants: [
        {
          id: 'pdp-008',
          name: 'Fresho Red Apple (1kg)',
          unit: 'kg',
          description: 'Crisp and juicy red apples.',
          imageUrl: '/images/catalog/red-apple.jpg'
        },
        {
          id: 'pdp-108',
          name: 'Fresho Green Apple (1kg)',
          unit: 'kg',
          description: 'Fresh and tangy green apples.',
          imageUrl: '/images/catalog/green-apple.jpg'
        }
      ]
    },
    {
      baseId: 'base-himalaya-soap',
      baseName: 'Himalaya Soap',
      category: 'Personal Care',
      variants: [
        {
          id: 'pdp-010',
          name: 'Himalaya Neem Soap 100g',
          unit: 'bar',
          description: 'Herbal soap with neem extracts, perfect for skin cleansing.',
          imageUrl: '/images/catalog/himalaya-soap.jpg'
        },
        {
          id: 'pdp-110',
          name: 'Himalaya Face Wash 150ml',
          unit: 'bottle',
          description: 'Gentle face wash for a refreshing cleanse.',
          imageUrl: '/images/catalog/himalaya-facewash.jpg'
        }
      ]
    }
  ];