import clientPromise from "./mongodb"
import type { Product, Order, User, Vendor } from "./models"
import { ObjectId } from "mongodb"

// Database and collections names
const DB_NAME = "kirnamart"
const COLLECTIONS = {
  PRODUCTS: "products",
  ORDERS: "orders",
  USERS: "users",
  VENDORS: "vendors",
}

// Helper to get database connection
export async function getDatabase() {
  const client = await clientPromise
  return client.db(DB_NAME)
}

// Products
export async function getProducts(limit = 20, skip = 0, category?: string) {
  const db = await getDatabase()
  const query = category ? { category } : {}

  return db.collection(COLLECTIONS.PRODUCTS).find(query).skip(skip).limit(limit).toArray()
}

export async function getProductById(id: string) {
  const db = await getDatabase()
  return db.collection(COLLECTIONS.PRODUCTS).findOne({ _id: new ObjectId(id) })
}

export async function getProductsByVendor(vendorId: string) {
  const db = await getDatabase()
  return db.collection(COLLECTIONS.PRODUCTS).find({ vendorId }).toArray()
}

export async function createProduct(product: Product) {
  const db = await getDatabase()
  const result = await db.collection(COLLECTIONS.PRODUCTS).insertOne({
    ...product,
    createdAt: new Date(),
  })

  return result
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const db = await getDatabase()
  const result = await db.collection(COLLECTIONS.PRODUCTS).updateOne({ _id: new ObjectId(id) }, { $set: updates })

  return result
}

export async function deleteProduct(id: string) {
  const db = await getDatabase()
  return db.collection(COLLECTIONS.PRODUCTS).deleteOne({ _id: new ObjectId(id) })
}

// Orders
export async function getOrders(limit = 20, skip = 0) {
  const db = await getDatabase()
  return db.collection(COLLECTIONS.ORDERS).find({}).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray()
}

export async function getOrderById(id: string) {
  const db = await getDatabase()
  return db.collection(COLLECTIONS.ORDERS).findOne({ _id: new ObjectId(id) })
}

export async function getOrdersByUser(userId: string) {
  const db = await getDatabase()
  return db.collection(COLLECTIONS.ORDERS).find({ userId }).sort({ createdAt: -1 }).toArray()
}

export async function getOrdersByVendor(vendorId: string) {
  const db = await getDatabase()
  return db.collection(COLLECTIONS.ORDERS).find({ vendorId }).sort({ createdAt: -1 }).toArray()
}

export async function createOrder(order: Order) {
  const db = await getDatabase()
  const now = new Date()
  const result = await db.collection(COLLECTIONS.ORDERS).insertOne({
    ...order,
    status: "Pending",
    createdAt: now,
    updatedAt: now,
  })

  return result
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const db = await getDatabase()
  const result = await db.collection(COLLECTIONS.ORDERS).updateOne(
    { _id: new ObjectId(id) },
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
  const db = await getDatabase()
  return db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) })
}

export async function getUserByEmail(email: string) {
  const db = await getDatabase()
  return db.collection(COLLECTIONS.USERS).findOne({ email })
}

export async function createUser(user: User) {
  const db = await getDatabase()
  const result = await db.collection(COLLECTIONS.USERS).insertOne({
    ...user,
    addresses: [],
    orderHistory: [],
    createdAt: new Date(),
  })

  return result
}

export async function updateUser(id: string, updates: Partial<User>) {
  const db = await getDatabase()
  const result = await db.collection(COLLECTIONS.USERS).updateOne({ _id: new ObjectId(id) }, { $set: updates })

  return result
}

// Vendors
export async function getVendorById(id: string) {
  const db = await getDatabase()
  return db.collection(COLLECTIONS.VENDORS).findOne({ _id: new ObjectId(id) })
}

export async function getVendorByEmail(email: string) {
  const db = await getDatabase()
  return db.collection(COLLECTIONS.VENDORS).findOne({ email })
}

export async function createVendor(vendor: Vendor) {
  const db = await getDatabase()
  const result = await db.collection(COLLECTIONS.VENDORS).insertOne({
    ...vendor,
    products: [],
    createdAt: new Date(),
  })

  return result
}

export async function updateVendor(id: string, updates: Partial<Vendor>) {
  const db = await getDatabase()
  const result = await db.collection(COLLECTIONS.VENDORS).updateOne({ _id: new ObjectId(id) }, { $set: updates })

  return result
}

// Cart operations (using user's collection)
export async function addToCart(userId: string, product: { productId: string; quantity: number }) {
  const db = await getDatabase()
  // Assuming cart is stored as a subdocument in the user document
  const result = await db
    .collection(COLLECTIONS.USERS)
    .updateOne({ _id: new ObjectId(userId) }, { $push: { cart: product } })

  return result
}

export async function getCart(userId: string) {
  const db = await getDatabase()
  const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(userId) })

  return user?.cart || []
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const db = await getDatabase()
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
  const db = await getDatabase()
  const result = await db
    .collection(COLLECTIONS.USERS)
    .updateOne({ _id: new ObjectId(userId) }, { $pull: { cart: { productId } } })

  return result
}

export async function clearCart(userId: string) {
  const db = await getDatabase()
  const result = await db.collection(COLLECTIONS.USERS).updateOne({ _id: new ObjectId(userId) }, { $set: { cart: [] } })

  return result
}

// Seed dummy data for development
export async function seedDummyData() {
  const db = await getDatabase()

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

