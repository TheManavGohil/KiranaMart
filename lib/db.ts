import clientPromise from "./mongodb"
// import type { Product, Order, User, Vendor } from "./models" // REMOVE problematic import
import { ObjectId } from "mongodb"

// Import DB_NAME and COLLECTIONS from where they are defined
import { DB_NAME, COLLECTIONS, getDb } from "./mongodb"; // Adjusted import

// --- Interface Definitions --- 

// Define Product interface locally
export interface Product {
  _id?: ObjectId | string; 
  name: string;
  description: string;
  price: number;
  unit: string; 
  category: string; 
  vendorId: ObjectId | string;
  stock: number;
  imageUrl?: string;
  isAvailable: boolean;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Define Order interface locally
export interface Order {
  _id?: ObjectId | string;
  userId: ObjectId | string; 
  vendorId: ObjectId | string;
  items: Array<{ productId: ObjectId | string; name: string; quantity: number; price: number }>;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: { street: string; city: string; state: string; postalCode: string; country: string };
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  createdAt?: Date;
  updatedAt?: Date;
}

// Define User interface locally
export interface User {
  _id?: ObjectId | string;
  name: string;
  email: string;
  // password hash should NOT typically be in the main user object returned to client
  // Add other fields like phone, etc. if needed
  addresses: Array<{ street: string; city: string; state: string; postalCode: string; country: string }>;
  cart: Array<{ productId: string; quantity: number }>; // Define cart structure
  orderHistory: Array<ObjectId | string>; // Array of Order IDs
  createdAt?: Date;
  updatedAt?: Date;
}

// Define Vendor interface locally
export interface Vendor {
  _id?: ObjectId | string;
  businessName: string;
  email: string;
  phone: string;
  address: { street: string; city: string; state: string; postalCode: string; country: string };
  description?: string;
  logoUrl?: string;
  // products field might be redundant if using vendorId in Product collection
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Delivery data (keep existing)
interface Delivery {
  _id?: ObjectId | string;
  deliveryId?: string; 
  orderId: ObjectId | string;
  vendorId: ObjectId | string;
  customerId: ObjectId | string; 
  customerName: string; 
  customerAddress: { 
    street: string;
    city: string;
    postalCode: string;
    // other fields
  };
  customerPhone?: string; 
  assignedAgentId?: ObjectId | string | null; 
  status: 'Pending Assignment' | 'Assigned' | 'Out for Delivery' | 'Delivered' | 'Attempted Delivery' | 'Cancelled' | 'Delayed'; 
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

// DeliveryAgent interface (keep existing)
export interface DeliveryAgent {
  _id?: ObjectId | string;
  vendorId: ObjectId | string;
  name: string;
  phone: string;
  vehicleType: 'bike' | 'scooter' | 'car' | 'van';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// --- Database Functions --- 

// Products - Example with explicit generic type
export async function getProducts(limit = 20, skip = 0, category?: string) {
  const db = await getDb()
  const query: any = category ? { category } : {}
  // Use the defined Product interface
  return db.collection<Product>(COLLECTIONS.PRODUCTS).find(query).skip(skip).limit(limit).toArray()
}

export async function getProductById(id: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.PRODUCTS).findOne({ _id: new ObjectId(id) })
}

export async function getProductsByVendor(vendorId: string) {
  const db = await getDb()
  // Assuming vendorId in PRODUCTS collection is stored as ObjectId if it comes from VENDORS _id
  // If vendorId is stored as a string matching vendor._id.toString(), adjust query
  try {
    const vendorObjectId = new ObjectId(vendorId);
    return db.collection<Product>(COLLECTIONS.PRODUCTS).find({ vendorId: vendorObjectId as any }).toArray(); // Cast needed if Product interface expects ObjectId
  } catch (e) {
    console.error("Invalid vendorId format for ObjectId:", vendorId, e);
    // Fallback or alternative query if vendorId is stored as string:
    // return db.collection<Product>(COLLECTIONS.PRODUCTS).find({ vendorId: vendorId }).toArray();
    return []; // Return empty array if ID is invalid and no fallback
  }
}

export async function createProduct(product: Product) {
  const db = await getDb()
  const { _id, ...productData } = product
  const result = await db.collection(COLLECTIONS.PRODUCTS).insertOne({
    ...productData,
    // Ensure vendorId is stored correctly (ObjectId or string based on schema)
    vendorId: new ObjectId(productData.vendorId), // Convert to ObjectId if needed
    createdAt: new Date(),
    updatedAt: new Date(), // Add updatedAt on creation
  })

  return result
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const db = await getDb()
  // Ensure vendorId isn't accidentally updated if passed
  if (updates.vendorId) delete updates.vendorId;
  const result = await db.collection(COLLECTIONS.PRODUCTS).updateOne(
    { _id: new ObjectId(id) }, 
    { 
      $set: {
        ...updates, 
        updatedAt: new Date()
      } 
    }
  )

  return result
}

export async function deleteProduct(id: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.PRODUCTS).deleteOne({ _id: new ObjectId(id) })
}

// Orders - Example with explicit generic type
export async function getOrders(limit = 20, skip = 0) {
  const db = await getDb()
  // Use the defined Order interface
  return db.collection<Order>(COLLECTIONS.ORDERS).find({}).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray()
}

export async function getOrderById(id: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.ORDERS).findOne({ _id: new ObjectId(id) })
}

export async function getOrdersByUser(userId: string) {
  const db = await getDb()
  try {
    const userObjectId = new ObjectId(userId);
    return db.collection<Order>(COLLECTIONS.ORDERS).find({ userId: userObjectId as any }).sort({ createdAt: -1 }).toArray()
  } catch (e) {
    console.error("Invalid userId format for ObjectId:", userId, e);
    return [];
  }
}

export async function getOrdersByVendor(vendorId: string) {
  const db = await getDb()
  try {
    const vendorObjectId = new ObjectId(vendorId);
    return db.collection<Order>(COLLECTIONS.ORDERS).find({ vendorId: vendorObjectId as any }).sort({ createdAt: -1 }).toArray()
  } catch (e) {
     console.error("Invalid vendorId format for ObjectId:", vendorId, e);
    return [];
  }
}

export async function createOrder(order: Order) {
  const db = await getDb()
  const now = new Date()
  const { _id, ...orderData } = order
  const result = await db.collection(COLLECTIONS.ORDERS).insertOne({
    ...orderData,
    // Ensure IDs are ObjectIds if needed by schema
    userId: new ObjectId(orderData.userId),
    vendorId: new ObjectId(orderData.vendorId),
    status: "Pending",
    createdAt: now,
    updatedAt: now,
  })

  return result
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
  vendorId: string // Keep vendorId for authorization check
) {
  const db = await getDb()
  try {
    const orderObjectId = new ObjectId(id);
    const vendorObjectId = new ObjectId(vendorId);

    const result = await db.collection<Order>(COLLECTIONS.ORDERS).updateOne(
      {
        _id: orderObjectId, // Use ObjectId directly in filter
        vendorId: vendorObjectId // Use ObjectId directly
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )
    return result;
  } catch(e) {
    console.error("Error updating order status:", e);
    return { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
  }
}

// Users - Example with explicit generic type
export async function getUserById(id: string) {
  const db = await getDb()
  try {
      // Use the defined User interface
      return db.collection<User>(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) });
  } catch (e) {
      console.error("Invalid id format for ObjectId:", id, e);
      return null;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb()
  return db.collection<User>(COLLECTIONS.USERS).findOne({ email })
}

export async function createUser(user: User) {
  const db = await getDb()
  const { _id, ...userData } = user
  // Ensure required fields for your User model are present before insertion
  const result = await db.collection(COLLECTIONS.USERS).insertOne({
    ...userData,
    // Assuming email is required and unique (add index in MongoDB)
    // Assuming default empty arrays for addresses/history if applicable
    addresses: [],
    orderHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return result
}

export async function updateUser(id: string, updates: Partial<User>) {
  const db = await getDb()
  // Prevent changing email this way if it's used for login
  if (updates.email) delete updates.email;
  // REMOVE password check/delete
  // if (updates.password) delete updates.password; 
  try {
    const result = await db.collection<User>(COLLECTIONS.USERS).updateOne(
        { _id: new ObjectId(id) }, 
        { 
          $set: { ...updates, updatedAt: new Date() } 
        }
    );
    return result;
  } catch (e) {
    console.error("Error updating user:", e);
    return { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
  }
}

// Vendors - Example with explicit generic type
export async function getVendorById(id: string) {
  const db = await getDb()
  try {
    // Use the defined Vendor interface
    return db.collection<Vendor>(COLLECTIONS.VENDORS).findOne({ _id: new ObjectId(id) });
  } catch (e) {
    console.error("Invalid id format for ObjectId:", id, e);
    return null;
  }
}

export async function getVendorByEmail(email: string) {
  const db = await getDb()
  return db.collection<Vendor>(COLLECTIONS.VENDORS).findOne({ email })
}

export async function createVendor(vendor: Vendor) {
  const db = await getDb()
  const { _id, ...vendorData } = vendor
  // Ensure required fields for Vendor are present
  const result = await db.collection(COLLECTIONS.VENDORS).insertOne({
    ...vendorData,
    products: [], // Assuming products is an array of ObjectIds or embedded docs
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return result
}

export async function updateVendor(id: string, updates: Partial<Vendor>) {
  const db = await getDb()
  // Prevent changing email if used for login
  if (updates.email) delete updates.email;
  try {
    const result = await db.collection(COLLECTIONS.VENDORS).updateOne(
        { _id: new ObjectId(id) }, 
        { 
          $set: { ...updates, updatedAt: new Date() } 
        }
    );
    return result;
  } catch(e) {
    console.error("Error updating vendor:", e);
    return { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
  }
}

// Cart operations 
export async function getCart(userId: string) {
  const db = await getDb()
  try {
    const userObjectId = new ObjectId(userId);
    // Use defined User interface
    const user = await db.collection<User>(COLLECTIONS.USERS).findOne(
        { _id: userObjectId }, 
        { projection: { cart: 1, _id: 0 } } // Only fetch the cart
    );
    // Type assertion might be needed if projection makes TS unsure
    return (user as unknown as Pick<User, 'cart'>)?.cart || []; 
  } catch (e) {
    console.error("Error getting cart:", e);
    return [];
  }
}

export async function addToCart(userId: string, product: { productId: string; quantity: number }) {
  const db = await getDb()
  // Optional: Check if product exists and stock is available before adding
  try {
    const userObjectId = new ObjectId(userId);
    // Check if item already in cart to update quantity instead of pushing duplicates
    const user = await db.collection<User>(COLLECTIONS.USERS).findOne({ _id: userObjectId, 'cart.productId': product.productId });

    if (user) {
      // Update quantity
      const result = await db.collection<User>(COLLECTIONS.USERS).updateOne(
        { _id: userObjectId, 'cart.productId': product.productId },
        { $inc: { 'cart.$.quantity': product.quantity } } // Increment quantity
      );
      return result;
    } else {
      // Add new item
      const result = await db.collection<User>(COLLECTIONS.USERS).updateOne(
        { _id: userObjectId }, 
        { $push: { cart: product as any } } // Cast needed if cart expects specific type
      );
      return result;
    }
  } catch (e) {
    console.error("Error adding to cart:", e);
    return { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
  }
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const db = await getDb()
  if (quantity <= 0) {
    return removeFromCart(userId, productId);
  } else {
    try {
      const userObjectId = new ObjectId(userId);
      // Assuming productId in cart is stored as string
      const result = await db.collection<User>(COLLECTIONS.USERS).updateOne(
        {
          _id: userObjectId,
          "cart.productId": productId, 
        },
        { $set: { "cart.$.quantity": quantity } }, 
      )
      return result;
    } catch (e) {
      console.error("Error updating cart item:", e);
      return { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
    }
  }
}

export async function removeFromCart(userId: string, productId: string) {
  const db = await getDb()
  try {
    const userObjectId = new ObjectId(userId);
    const result = await db
      .collection<User>(COLLECTIONS.USERS)
      .updateOne({ _id: userObjectId }, { $pull: { cart: { productId } as any } })
    return result;
  } catch (e) {
    console.error("Error removing from cart:", e);
    return { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
  }
}

export async function clearCart(userId: string) {
  const db = await getDb()
  try {
    const userObjectId = new ObjectId(userId);
    const result = await db.collection<User>(COLLECTIONS.USERS).updateOne({ _id: userObjectId }, { $set: { cart: [] } })
    return result;
  } catch (e) {
    console.error("Error clearing cart:", e);
    return { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
  }
}

// Seed dummy data for development
// Consider moving this to a separate script or conditional execution
export async function seedDummyData() {
  const db = await getDb()

  // Check if data already exists (example for products)
  const productsCount = await db.collection(COLLECTIONS.PRODUCTS).countDocuments()
  if (productsCount > 0) {
    console.log('Dummy data already exists. Skipping seed.');
    return;
  }

  console.log('Seeding dummy data...');

  // Sample vendors
  const vendors = [
    {
      businessName: "Fresh Farms Co.",
      email: "contact@freshfarms.com",
      address: { street: "123 Farm Road", city: "Green Valley", state: "CA", postalCode: "90210" }, // Make address structured
      phone: "555-123-4567",
      // products: [], // Products will be linked via vendorId
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      businessName: "Organic Harvest",
      email: "info@organicharvest.com",
      address: { street: "456 Garden Lane", city: "Oakville", state: "CA", postalCode: "90211" },
      phone: "555-987-6543",
      // products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const vendorResults = await db.collection(COLLECTIONS.VENDORS).insertMany(vendors as any);
  const vendorIds = Object.values(vendorResults.insertedIds);
  console.log(`Inserted ${vendorIds.length} vendors.`);

  // Sample products (ensure they match the Product interface if defined locally)
  const products = [
    {
      name: "Organic Bananas",
      description: "Fresh organic bananas, perfect for smoothies or a quick snack.",
      category: "Fruits",
      price: 2.99,
      unit: "lb",
      stock: 100,
      imageUrl:
        "https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
      vendorId: vendorIds[0], // Use ObjectId directly
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Red Apples",
      description: "Crisp and sweet red apples, locally sourced from organic farms.",
      category: "Fruits",
      price: 3.49,
      unit: "lb",
      stock: 75,
      imageUrl:
        "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      vendorId: vendorIds[0],
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
     {
      name: "Broccoli",
      description: "Fresh green broccoli florets, rich in vitamins and minerals.",
      category: "Vegetables",
      price: 2.49,
      unit: "head",
      stock: 60,
      imageUrl:
        "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      vendorId: vendorIds[1],
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Add more sample products...
  ]

  const productResult = await db.collection(COLLECTIONS.PRODUCTS).insertMany(products as any);
  console.log(`Inserted ${productResult.insertedCount} products.`);

  // Sample users
  const users = [
    {
      name: "John Doe", // Add name field if needed by User interface
      email: "john@example.com",
      // password: await bcrypt.hash('password123', 10), // Example: Hash password before storing
      addresses: [
        {
          street: "789 Oak Street",
          city: "Springfield",
          state: "IL",
          postalCode: "62704",
          country: "USA"
        },
      ],
      cart: [],
      orderHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
     {
      name: "Jane Smith",
      email: "jane@example.com",
      // password: await bcrypt.hash('password456', 10),
      addresses: [
        {
          street: "101 Pine Avenue",
          city: "Riverdale",
          state: "NY",
          postalCode: "10471",
          country: "USA"
        },
      ],
      cart: [],
      orderHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const userResult = await db.collection(COLLECTIONS.USERS).insertMany(users as any);
  console.log(`Inserted ${userResult.insertedCount} users.`);

  console.log('Dummy data seeding complete.');
}

// Delivery functions
export async function getDeliveriesByVendor(vendorId: string) {
  const db = await getDb();
  try {
      const vendorObjectId = new ObjectId(vendorId);
      const pipeline = [
        { $match: { vendorId: vendorObjectId } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: COLLECTIONS.DELIVERY_AGENTS,
            localField: "assignedAgentId",
            foreignField: "_id",
            as: "agentDetails"
          }
        },
        {
          $unwind: {
            path: "$agentDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        // Optional: Add lookup for customer details if needed
        {
            $lookup: {
                from: COLLECTIONS.CUSTOMERS, // Assuming a CUSTOMERS collection
                localField: "customerId",
                foreignField: "_id",
                as: "customerDetails"
            }
        },
        {
            $unwind: {
                path: "$customerDetails",
                preserveNullAndEmptyArrays: true // Keep delivery even if customer not found
            }
        }
      ];
      return db.collection<Delivery>(COLLECTIONS.DELIVERIES).aggregate(pipeline).toArray();
  } catch (e) {
      console.error("Error fetching deliveries by vendor:", e);
      return [];
  }
}

// Update status of a specific delivery, ensuring vendor ownership
export async function updateDeliveryStatus(
  deliveryId: string, // MongoDB _id
  newStatus: Delivery['status'],
  vendorId: string
) {
  const db = await getDb();
  try {
    const deliveryObjectId = new ObjectId(deliveryId);
    const vendorObjectId = new ObjectId(vendorId);

    const updateData: Partial<Delivery> = {
      status: newStatus,
      updatedAt: new Date()
    };

    if (newStatus === 'Delivered') {
      updateData.actualDeliveryTime = new Date();
    }

    const result = await db.collection<Delivery>(COLLECTIONS.DELIVERIES).updateOne(
      { _id: deliveryObjectId, vendorId: vendorObjectId }, // Match delivery AND vendor
      { $set: updateData }
    );
    return result;
  } catch (e) {
     console.error("Error updating delivery status:", e);
    return { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
  }
}

// Assign an agent to a specific delivery, ensuring vendor ownership
export async function assignAgentToDelivery(
  deliveryId: string, // MongoDB _id
  agentId: string | null, // Agent's MongoDB _id, or null to unassign
  vendorId: string
) {
  const db = await getDb();
  try {
    const deliveryObjectId = new ObjectId(deliveryId);
    const vendorObjectId = new ObjectId(vendorId);
    const agentObjectId = agentId ? new ObjectId(agentId) : null;

    // Optional: Verify the agent exists and belongs to the vendor
    if (agentObjectId) {
        const agent = await db.collection(COLLECTIONS.DELIVERY_AGENTS).findOne({ _id: agentObjectId, vendorId: vendorObjectId });
        if (!agent) {
            console.error(`Agent ${agentId} not found or does not belong to vendor ${vendorId}`);
            // Return a failure-like result
            return { acknowledged: true, matchedCount: 0, modifiedCount: 0 }; 
        }
    }

    const result = await db.collection<Delivery>(COLLECTIONS.DELIVERIES).updateOne(
      { _id: deliveryObjectId, vendorId: vendorObjectId }, // Match delivery AND vendor
      {
        $set: {
          assignedAgentId: agentObjectId,
          status: agentObjectId ? 'Assigned' : 'Pending Assignment',
          updatedAt: new Date()
        }
      }
    );
    return result;
  } catch (e) {
     console.error("Error assigning agent to delivery:", e);
    return { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
  }
}

// Delivery Agent Functions
export async function createDeliveryAgent(agentData: Omit<DeliveryAgent, '_id' | 'createdAt' | 'updatedAt'>) {
    const db = await getDb();
    try {
        const result = await db.collection(COLLECTIONS.DELIVERY_AGENTS).insertOne({
            ...agentData,
            vendorId: new ObjectId(agentData.vendorId), // Store as ObjectId
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return result;
    } catch (e) {
        console.error("Error creating delivery agent:", e);
        return { acknowledged: false, insertedId: null };
    }
}

export async function getDeliveryAgentsByVendor(vendorId: string) {
    const db = await getDb();
    try {
        const vendorObjectId = new ObjectId(vendorId);
        return db.collection<DeliveryAgent>(COLLECTIONS.DELIVERY_AGENTS).find({ vendorId: vendorObjectId as any }).toArray();
    } catch (e) {
        console.error("Error fetching delivery agents by vendor:", e);
        return [];
    }
}

export async function getDeliveryAgentById(agentId: string) {
    const db = await getDb();
    try {
        return db.collection<DeliveryAgent>(COLLECTIONS.DELIVERY_AGENTS).findOne({ _id: new ObjectId(agentId) });
    } catch (e) {
        console.error("Invalid agentId format for ObjectId:", agentId, e);
        return null;
    }
}

export async function updateDeliveryAgent(agentId: string, vendorId: string, data: Partial<Omit<DeliveryAgent, '_id' | 'vendorId'>>) {
  const db = await getDb()
  try {
      const agentObjectId = new ObjectId(agentId);
      const vendorObjectId = new ObjectId(vendorId);
      const result = await db.collection(COLLECTIONS.DELIVERY_AGENTS).updateOne(
        { _id: agentObjectId, vendorId: vendorObjectId as any }, // Ensure agent belongs to vendor
        { 
          $set: { ...data, updatedAt: new Date() } 
        }
      )
      return result
  } catch (e) {
      console.error("Error updating delivery agent:", e);
      return { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
  }
}

export async function deleteDeliveryAgent(agentId: string, vendorId: string) {
  const db = await getDb()
  try {
      const agentObjectId = new ObjectId(agentId);
      const vendorObjectId = new ObjectId(vendorId);
      const result = await db.collection(COLLECTIONS.DELIVERY_AGENTS).deleteOne({
        _id: agentObjectId,
        vendorId: vendorObjectId as any // Ensure agent belongs to vendor
      })
      return result
  } catch (e) {
      console.error("Error deleting delivery agent:", e);
      return { acknowledged: false, deletedCount: 0 };
  }
}
