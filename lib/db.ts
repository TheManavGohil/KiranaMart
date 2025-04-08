import clientPromise from "./mongodb"
import type { Product, Order, User, Vendor } from "./models"
import { ObjectId } from "mongodb"

// Import DB_NAME and COLLECTIONS from where they are defined
import { DB_NAME, COLLECTIONS, getDb } from "./mongodb"; // Adjusted import

// Helper to get database connection (using imported getDb)
// export async function getDatabase() {
//   const client = await clientPromise
//   return client.db(DB_NAME)
// } // REMOVE - Use getDb from mongodb.ts instead

// Interface for Delivery data (Add this)
interface Delivery {
  _id?: ObjectId;
  deliveryId?: string; // Optional user-friendly ID
  orderId: ObjectId;
  vendorId: ObjectId;
  customerId: ObjectId; // Assuming customer ID is stored
  customerName: string; // Denormalized for easier display
  customerAddress: { // Assuming structured address
    street: string;
    city: string;
    postalCode: string;
    // other fields
  };
  customerPhone?: string; // Optional phone
  assignedAgentId?: ObjectId | null; // Link to DeliveryAgent
  status: 'Pending Assignment' | 'Assigned' | 'Out for Delivery' | 'Delivered' | 'Attempted Delivery' | 'Cancelled' | 'Delayed'; // Added more specific statuses
  estimatedDeliveryTime?: Date | null;
  actualDeliveryTime?: Date | null;
  lastLocationUpdate?: Date | null;
  currentLocation?: { lat: number; lon: number } | null;
  deliveryNotes?: string;
  orderValue?: number;
  packageSize?: 'Small' | 'Medium' | 'Large';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeliveryAgent {
  _id?: string
  vendorId: string
  name: string
  phone: string
  vehicleType: 'bike' | 'scooter' | 'car' | 'van'
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Products
export async function getProducts(limit = 20, skip = 0, category?: string) {
  const db = await getDb()
  const query = category ? { category } : {}

  return db.collection(COLLECTIONS.PRODUCTS).find(query).skip(skip).limit(limit).toArray()
}

export async function getProductById(id: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.PRODUCTS).findOne({ _id: new ObjectId(id) })
}

export async function getProductsByVendor(vendorId: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.PRODUCTS).find({ vendorId }).toArray()
}

export async function createProduct(product: Product) {
  const db = await getDb()
  const { _id, ...productData } = product
  const result = await db.collection(COLLECTIONS.PRODUCTS).insertOne({
    ...productData,
    createdAt: new Date(),
  })

  return result
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.PRODUCTS).updateOne({ _id: new ObjectId(id) }, { $set: updates })

  return result
}

export async function deleteProduct(id: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.PRODUCTS).deleteOne({ _id: new ObjectId(id) })
}

// Orders
export async function getOrders(limit = 20, skip = 0) {
  const db = await getDb()
  return db.collection(COLLECTIONS.ORDERS).find({}).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray()
}

export async function getOrderById(id: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.ORDERS).findOne({ _id: new ObjectId(id) })
}

export async function getOrdersByUser(userId: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.ORDERS).find({ userId }).sort({ createdAt: -1 }).toArray()
}

export async function getOrdersByVendor(vendorId: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.ORDERS).find({ vendorId }).sort({ createdAt: -1 }).toArray()
}

export async function createOrder(order: Order) {
  const db = await getDb()
  const now = new Date()
  const { _id, ...orderData } = order
  const result = await db.collection(COLLECTIONS.ORDERS).insertOne({
    ...orderData,
    status: "Pending",
    createdAt: now,
    updatedAt: now,
  })

  return result
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
  vendorId: string
) {
  const db = await getDb()
  const vendorObjectId = new ObjectId(vendorId)

  const result = await db.collection(COLLECTIONS.ORDERS).updateOne(
    {
      _id: new ObjectId(id),
      vendorId: vendorObjectId
    },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    },
  )

  return result
}

// Users
export async function getUserById(id: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) })
}

export async function getUserByEmail(email: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.USERS).findOne({ email })
}

export async function createUser(user: User) {
  const db = await getDb()
  const { _id, ...userData } = user
  const result = await db.collection(COLLECTIONS.USERS).insertOne({
    ...userData,
    addresses: [],
    orderHistory: [],
    createdAt: new Date(),
  })

  return result
}

export async function updateUser(id: string, updates: Partial<User>) {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.USERS).updateOne({ _id: new ObjectId(id) }, { $set: updates })

  return result
}

// Vendors
export async function getVendorById(id: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.VENDORS).findOne({ _id: new ObjectId(id) })
}

export async function getVendorByEmail(email: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.VENDORS).findOne({ email })
}

export async function createVendor(vendor: Vendor) {
  const db = await getDb()
  const { _id, ...vendorData } = vendor
  const result = await db.collection(COLLECTIONS.VENDORS).insertOne({
    ...vendorData,
    products: [],
    createdAt: new Date(),
  })

  return result
}

export async function updateVendor(id: string, updates: Partial<Vendor>) {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.VENDORS).updateOne({ _id: new ObjectId(id) }, { $set: updates })

  return result
}

// Cart operations (using user's collection)
export async function addToCart(userId: string, product: { productId: string; quantity: number }) {
  const db = await getDb()
  const result = await db
    .collection(COLLECTIONS.USERS)
    .updateOne({ _id: new ObjectId(userId) }, { $push: { cart: product as any } })

  return result
}

export async function getCart(userId: string) {
  const db = await getDb()
  const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(userId) })

  return user?.cart || []
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.USERS).updateOne(
    {
      _id: new ObjectId(userId),
      "cart.productId": productId,
    },
    { $set: { "cart.$.quantity": quantity } },
  )

  return result
}

export async function removeFromCart(userId: string, productId: string) {
  const db = await getDb()
  const result = await db
    .collection(COLLECTIONS.USERS)
    .updateOne({ _id: new ObjectId(userId) }, { $pull: { cart: { productId } as any } })

  return result
}

export async function clearCart(userId: string) {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.USERS).updateOne({ _id: new ObjectId(userId) }, { $set: { cart: [] } })

  return result
}

// Seed dummy data for development
export async function seedDummyData() {
  const db = await getDb()

  // Check if data already exists
  const productsCount = await db.collection(COLLECTIONS.PRODUCTS).countDocuments()
  if (productsCount > 0) return

  // Sample vendors
  const vendors = [
    {
      businessName: "Fresh Farms Co.",
      email: "contact@freshfarms.com",
      address: "123 Farm Road, Green Valley",
      phone: "555-123-4567",
      products: [],
      createdAt: new Date(),
    },
    {
      businessName: "Organic Harvest",
      email: "info@organicharvest.com",
      address: "456 Garden Lane, Oakville",
      phone: "555-987-6543",
      products: [],
      createdAt: new Date(),
    },
  ]

  const vendorResults = await db.collection(COLLECTIONS.VENDORS).insertMany(vendors)
  const vendorIds = Object.values(vendorResults.insertedIds)

  // Sample products
  const products = [
    {
      name: "Organic Bananas",
      description: "Fresh organic bananas, perfect for smoothies or a quick snack.",
      category: "Fruits",
      price: 2.99,
      stock: 100,
      imageUrl:
        "https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
      vendorId: vendorIds[0].toString(),
      createdAt: new Date(),
    },
    {
      name: "Red Apples",
      description: "Crisp and sweet red apples, locally sourced from organic farms.",
      category: "Fruits",
      price: 3.49,
      stock: 75,
      imageUrl:
        "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      vendorId: vendorIds[0].toString(),
      createdAt: new Date(),
    },
    {
      name: "Avocados",
      description: "Ripe avocados, perfect for guacamole or toast.",
      category: "Fruits",
      price: 4.99,
      stock: 50,
      imageUrl:
        "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1375&q=80",
      vendorId: vendorIds[0].toString(),
      createdAt: new Date(),
    },
    {
      name: "Broccoli",
      description: "Fresh green broccoli florets, rich in vitamins and minerals.",
      category: "Vegetables",
      price: 2.49,
      stock: 60,
      imageUrl:
        "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      vendorId: vendorIds[1].toString(),
      createdAt: new Date(),
    },
    {
      name: "Spinach",
      description: "Organic baby spinach leaves, washed and ready to eat.",
      category: "Vegetables",
      price: 3.99,
      stock: 40,
      imageUrl:
        "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      vendorId: vendorIds[1].toString(),
      createdAt: new Date(),
    },
    {
      name: "Bell Peppers",
      description: "Colorful bell peppers - red, yellow, and green varieties.",
      category: "Vegetables",
      price: 4.29,
      stock: 55,
      imageUrl:
        "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
      vendorId: vendorIds[1].toString(),
      createdAt: new Date(),
    },
    {
      name: "Whole Milk",
      description: "Fresh whole milk from grass-fed cows, pasteurized and hormone-free.",
      category: "Dairy",
      price: 3.79,
      stock: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
      vendorId: vendorIds[0].toString(),
      createdAt: new Date(),
    },
    {
      name: "Eggs",
      description: "Farm-fresh eggs from free-range chickens, dozen pack.",
      category: "Dairy",
      price: 4.99,
      stock: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
      vendorId: vendorIds[0].toString(),
      createdAt: new Date(),
    },
    {
      name: "Whole Wheat Bread",
      description: "Freshly baked whole wheat bread, made with organic flour.",
      category: "Bakery",
      price: 3.49,
      stock: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1565181917578-a87bdd95422b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
      vendorId: vendorIds[1].toString(),
      createdAt: new Date(),
    },
    {
      name: "Brown Rice",
      description: "Organic brown rice, 2 lb bag, rich in fiber and nutrients.",
      category: "Grains",
      price: 5.99,
      stock: 35,
      imageUrl:
        "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      vendorId: vendorIds[1].toString(),
      createdAt: new Date(),
    },
    {
      name: "Almonds",
      description: "Raw unsalted almonds, 8 oz pack, great for snacking or baking.",
      category: "Nuts",
      price: 6.99,
      stock: 40,
      imageUrl:
        "https://images.unsplash.com/photo-1573851552153-816785fecf3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      vendorId: vendorIds[0].toString(),
      createdAt: new Date(),
    },
    {
      name: "Honey",
      description: "Raw organic honey, locally sourced, 12 oz jar.",
      category: "Condiments",
      price: 7.49,
      stock: 15,
      imageUrl:
        "https://images.unsplash.com/photo-1587049352851-8d4e89133924?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      vendorId: vendorIds[1].toString(),
      createdAt: new Date(),
    },
  ]

  await db.collection(COLLECTIONS.PRODUCTS).insertMany(products)

  // Sample users
  const users = [
    {
      username: "JohnDoe",
      email: "john@example.com",
      addresses: [
        {
          label: "Home",
          address: "789 Oak Street",
          city: "Springfield",
          state: "IL",
          zip: "62704",
        },
      ],
      cart: [],
      orderHistory: [],
      createdAt: new Date(),
    },
    {
      username: "JaneSmith",
      email: "jane@example.com",
      addresses: [
        {
          label: "Home",
          address: "101 Pine Avenue",
          city: "Riverdale",
          state: "NY",
          zip: "10471",
        },
        {
          label: "Work",
          address: "202 Maple Boulevard",
          city: "Riverdale",
          state: "NY",
          zip: "10471",
        },
      ],
      cart: [],
      orderHistory: [],
      createdAt: new Date(),
    },
  ]

  await db.collection(COLLECTIONS.USERS).insertMany(users)
}

// Deliveries (using native driver for now)
export async function getDeliveriesByVendor(vendorId: string) {
  const db = await getDb();
  const vendorObjectId = new ObjectId(vendorId);

  // Use aggregation pipeline to potentially lookup agent details
  const pipeline = [
    { $match: { vendorId: vendorObjectId } },
    { $sort: { createdAt: -1 } }, // Sort by creation date, newest first
    // Optional: Lookup agent details if assignedAgentId exists
    {
      $lookup: {
        from: COLLECTIONS.DELIVERY_AGENTS,
        localField: "assignedAgentId",
        foreignField: "_id",
        as: "agentDetails"
      }
    },
    // Deconstruct the agentDetails array (it will have 0 or 1 element)
    {
      $unwind: {
        path: "$agentDetails",
        preserveNullAndEmptyArrays: true // Keep deliveries even if agent isn't found/assigned
      }
    }
    // Add more stages if needed (e.g., projecting fields)
  ];

  return db.collection<Delivery>(COLLECTIONS.DELIVERIES).aggregate(pipeline).toArray();
}

// Update status of a specific delivery, ensuring vendor ownership
export async function updateDeliveryStatus(
  deliveryId: string, // MongoDB _id
  newStatus: Delivery['status'],
  vendorId: string
) {
  const db = await getDb();
  const deliveryObjectId = new ObjectId(deliveryId);
  const vendorObjectId = new ObjectId(vendorId);

  const updateData: Partial<Delivery> = {
    status: newStatus,
    updatedAt: new Date()
  };

  // Set actual delivery time if status is 'Delivered'
  if (newStatus === 'Delivered') {
    updateData.actualDeliveryTime = new Date();
  }

  const result = await db.collection<Delivery>(COLLECTIONS.DELIVERIES).updateOne(
    { _id: deliveryObjectId, vendorId: vendorObjectId },
    { $set: updateData }
  );
  return result;
}

// Assign an agent to a specific delivery, ensuring vendor ownership
export async function assignAgentToDelivery(
  deliveryId: string, // MongoDB _id
  agentId: string | null, // Agent's MongoDB _id, or null to unassign
  vendorId: string
) {
  const db = await getDb();
  const deliveryObjectId = new ObjectId(deliveryId);
  const vendorObjectId = new ObjectId(vendorId);
  const agentObjectId = agentId ? new ObjectId(agentId) : null;

  // Optional: Verify the agent actually belongs to the vendor before assigning
  // (Could be done here or rely on UI only showing valid agents)

  const result = await db.collection<Delivery>(COLLECTIONS.DELIVERIES).updateOne(
    { _id: deliveryObjectId, vendorId: vendorObjectId },
    {
      $set: {
        assignedAgentId: agentObjectId,
        status: agentObjectId ? 'Assigned' : 'Pending Assignment', // Update status based on assignment
        updatedAt: new Date()
      }
    }
  );
  return result;
}

export async function updateDeliveryAgent(vendorId: string, agentId: string, data: Partial<DeliveryAgent>) {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.DELIVERY_AGENTS).updateOne(
    { _id: new ObjectId(agentId), vendorId },
    { $set: data }
  )
  return result
}

export async function deleteDeliveryAgent(vendorId: string, agentId: string) {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.DELIVERY_AGENTS).deleteOne({
    _id: new ObjectId(agentId),
    vendorId
  })
  return result
}

