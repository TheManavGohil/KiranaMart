import { MongoClient } from "mongodb"

// Check if MongoDB URI is provided
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {
  connectTimeoutMS: 10000, // Timeout in ms
  socketTimeoutMS: 45000,  // Timeout in ms
  maxPoolSize: 10,         // Maximum connections in pool
  minPoolSize: 0           // Minimum connections in pool
}

// Define database name
export const DB_NAME = "kiranastore"

// Define collection names
export const COLLECTIONS = {
  VENDORS: "vendors",
  CUSTOMERS: "customers",
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  CATEGORIES: "categories",
  INVENTORY: "inventory",
  DELIVERY_AGENTS: "deliveryAgents",
  DELIVERIES: "deliveries",
}

let client
let clientPromise: Promise<MongoClient>

// Log connection attempt
console.log(`Attempting to connect to MongoDB: ${uri.substring(0, 20)}...`)

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
      .then(client => {
        console.log("Connected to MongoDB (development mode)")
        return client
      })
      .catch(err => {
        console.error("Failed to connect to MongoDB:", err)
        throw err
      })
  } else {
    console.log("Using existing MongoDB connection (development mode)")
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
    .then(client => {
      console.log("Connected to MongoDB (production mode)")
      return client
    })
    .catch(err => {
      console.error("Failed to connect to MongoDB:", err)
      throw err
    })
}

// Helper function to verify connection and get DB instance
export async function getDb(dbName: string = DB_NAME) {
  try {
    const client = await clientPromise
    const db = client.db(dbName)
    await db.command({ ping: 1 }) // Test the connection
    return db
  } catch (error) {
    console.error("Database connection error:", error)
    throw new Error("Failed to connect to database")
  }
}

// Helper to get vendor collection
export async function getVendorCollection() {
  const db = await getDb()
  return db.collection(COLLECTIONS.VENDORS)
}

// Helper to get customer collection
export async function getCustomerCollection() {
  const db = await getDb()
  return db.collection(COLLECTIONS.CUSTOMERS)
}

// Helper to get products collection
export async function getProductCollection() {
  const db = await getDb()
  return db.collection(COLLECTIONS.PRODUCTS)
}

// Helper to get orders collection
export async function getOrderCollection() {
  const db = await getDb()
  return db.collection(COLLECTIONS.ORDERS)
}

// Helper to get inventory collection
export async function getInventoryCollection() {
  const db = await getDb()
  return db.collection(COLLECTIONS.INVENTORY)
}

// Get the categories collection
export async function getCategoryCollection() {
  const db = await getDb();
  return db.collection(COLLECTIONS.CATEGORIES);
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

