import mongooseConnect from './mongooseConnect';
import Product from './models/Product';
import Order from './models/Order';
import User from './models/User';
import Vendor from './models/Vendor';
import Delivery from './models/Delivery';
import DeliveryAgent from './models/DeliveryAgent';
import mongoose from 'mongoose'; // Needed for ObjectId checks if required

// --- Database Functions (Refactored for Mongoose) --- 

// --- Product Functions ---
export async function getProducts(limit = 20, skip = 0, category?: string) {
  await mongooseConnect();
  const query = category ? { category } : {};
  try {
    return await Product.find(query).skip(skip).limit(limit).lean(); // Use .lean() for plain JS objects
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Product.findById(id).lean();
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
}

export async function getProductsByVendor(vendorId: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) return [];
    return await Product.find({ vendorId }).lean();
  } catch (error) {
    console.error("Error fetching products by vendor:", error);
    return [];
  }
}

export async function createProduct(productData: any) { // Use 'any' for now, or import/create a suitable type
  await mongooseConnect();
  try {
    const newProduct = new Product(productData);
    await newProduct.save();
    return JSON.parse(JSON.stringify(newProduct)); // Return plain object
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product"); // Re-throw or handle appropriately
  }
}

export async function updateProduct(id: string, updates: any) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid product ID");
    // Ensure vendorId isn't accidentally updated if passed
    if (updates.vendorId) delete updates.vendorId;
    // Ensure createdAt isn't updated
    if (updates.createdAt) delete updates.createdAt;
    
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true }).lean();
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product");
  }
}

export async function deleteProduct(id: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid product ID");
    await Product.findByIdAndDelete(id);
    return { deletedCount: 1 }; // Mimic native driver result structure if needed
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
}

// --- Order Functions ---
export async function getOrders(limit = 20, skip = 0) {
  await mongooseConnect();
  try {
    return await Order.find({}).skip(skip).limit(limit).sort({ createdAt: -1 }).populate('items.productId', 'name imageUrl').lean();
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function getOrderById(id: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    // Populate related fields as needed
    return await Order.findById(id).populate('customerId', 'name email').populate('vendorId', 'businessName').populate('items.productId').lean();
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return null;
  }
}

export async function getOrdersByUser(userId: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    return await Order.find({ customerId: userId }).sort({ createdAt: -1 }).populate('items.productId', 'name imageUrl').populate('vendorId', 'businessName').lean();
  } catch (error) {
    console.error("Error fetching orders by user:", error);
    return [];
  }
}

export async function getOrdersByVendor(vendorId: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) return [];
    return await Order.find({ vendorId }).sort({ createdAt: -1 }).populate('customerId', 'name email').populate('items.productId', 'name imageUrl').lean();
  } catch (error) {
    console.error("Error fetching orders by vendor:", error);
    return [];
  }
}

export async function createOrder(orderData: any) {
  await mongooseConnect();
  try {
    // Add validation or default setting if needed
    if (!orderData.status) orderData.status = 'Pending';
    const newOrder = new Order(orderData);
    await newOrder.save();
    // Optionally populate fields before returning
    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order");
  }
}

export async function updateOrderStatus(id: string, status: string, vendorId: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(vendorId)) {
      throw new Error("Invalid ID format");
    }
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, vendorId: vendorId }, // Ensure vendor owns the order
      { $set: { status } },
      { new: true }
    ).lean();
    
    if (!updatedOrder) {
        console.log(`Order ${id} not found or vendor ${vendorId} mismatch.`);
        // Depending on expected return type, return null or a specific structure
        return { acknowledged: true, matchedCount: 0, modifiedCount: 0 }; 
    }
    // Mimic native driver result if necessary, or just return the updated doc
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedId: null }; 
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error("Failed to update order status");
  }
}

// --- User Functions ---
export async function getUserById(id: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    // Exclude password if it exists in the schema
    return await User.findById(id).select('-password').lean(); 
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  await mongooseConnect();
  try {
    return await User.findOne({ email }).select('-password').lean();
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function createUser(userData: any) {
  await mongooseConnect();
  try {
    // Add hashing for password here if implementing authentication
    const newUser = new User(userData);
    await newUser.save();
    const userObject = JSON.parse(JSON.stringify(newUser));
    // delete userObject.password; // Ensure password isn't returned
    return userObject;
  } catch (error) {
    console.error("Error creating user:", error);
    // Handle duplicate email error (code 11000)
    if ((error as any).code === 11000) {
      throw new Error("Email already exists");
    }
    throw new Error("Failed to create user");
  }
}

export async function updateUser(id: string, updates: any) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid user ID");
    // Prevent changing critical fields like email or password directly here
    if (updates.email) delete updates.email;
    // if (updates.password) delete updates.password; // Handle password changes separately
    if (updates.createdAt) delete updates.createdAt; 

    const updatedUser = await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).select('-password').lean();
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

// --- Vendor Functions ---
export async function getVendorById(id: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Vendor.findById(id).lean();
  } catch (error) {
    console.error("Error fetching vendor by ID:", error);
    return null;
  }
}

export async function getVendorByEmail(email: string) {
  await mongooseConnect();
  try {
    return await Vendor.findOne({ email }).lean();
  } catch (error) {
    console.error("Error fetching vendor by email:", error);
    return null;
  }
}

export async function createVendor(vendorData: any) {
  await mongooseConnect();
  try {
    const newVendor = new Vendor(vendorData);
    await newVendor.save();
    return JSON.parse(JSON.stringify(newVendor));
  } catch (error) {
    console.error("Error creating vendor:", error);
    if ((error as any).code === 11000) {
      throw new Error("Vendor email already exists");
    }
    throw new Error("Failed to create vendor");
  }
}

export async function updateVendor(id: string, updates: any) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid vendor ID");
    if (updates.email) delete updates.email; // Prevent email change this way
    if (updates.createdAt) delete updates.createdAt;

    const updatedVendor = await Vendor.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    return updatedVendor;
  } catch (error) {
    console.error("Error updating vendor:", error);
    throw new Error("Failed to update vendor");
  }
}

// --- Cart Functions ---
export async function getCart(userId: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    // Fetch the user, select the cart, and populate product details within the cart
    const user = await User.findById(userId)
                           .select('cart')
                           .populate('cart.productId', 'name price imageUrl') // Populate product details
                           .lean(); 

    // Type assertion: Tell TypeScript that user (if found) should have a cart property matching the expected structure
    type CartItem = { productId: { _id: mongoose.Types.ObjectId; name: string; price: number; imageUrl?: string }; quantity: number };
    return (user as { cart: CartItem[] } | null)?.cart || [];

  } catch (error) {
    console.error("Error getting cart:", error);
    return [];
  }
}

export async function addToCart(userId: string, productInfo: { productId: string; quantity: number }) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productInfo.productId)) {
      throw new Error("Invalid ID format");
    }
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Explicitly type the item in the callback
    const itemIndex = user.cart.findIndex((item: { productId: mongoose.Types.ObjectId; quantity: number }) => 
        item.productId.toString() === productInfo.productId
    );

    if (itemIndex > -1) {
      // Update quantity
      user.cart[itemIndex].quantity += productInfo.quantity;
    } else {
      // Add new item
      user.cart.push({ productId: productInfo.productId as any, quantity: productInfo.quantity });
    }
    await user.save();
    // Return updated cart or success status
    return { success: true };
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw new Error("Failed to add item to cart");
  }
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid ID format");
    }
    if (quantity <= 0) {
        return removeFromCart(userId, productId); // Delegate to remove function if quantity is zero or less
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Explicitly type the item in the callback
    const itemIndex = user.cart.findIndex((item: { productId: mongoose.Types.ObjectId; quantity: number }) => 
        item.productId.toString() === productId
    );
    if (itemIndex > -1) {
      user.cart[itemIndex].quantity = quantity;
      await user.save();
      return { success: true };
    } else {
      throw new Error("Product not found in cart");
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw new Error("Failed to update cart item");
  }
}

export async function removeFromCart(userId: string, productId: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid ID format");
    }
    await User.findByIdAndUpdate(userId, { $pull: { cart: { productId: productId } } });
    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw new Error("Failed to remove item from cart");
  }
}

export async function clearCart(userId: string) {
  await mongooseConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });
    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw new Error("Failed to clear cart");
  }
}

// --- Delivery Functions (Using reference to DeliveryAgent) ---
export async function getDeliveriesByVendor(vendorId: string) {
    await mongooseConnect();
    try {
        if (!mongoose.Types.ObjectId.isValid(vendorId)) return [];
        // Fetch deliveries and populate related fields
        return await Delivery.find({ vendorId })
                            .populate('orderId', 'orderId totalAmount') 
                            .populate('customerId', 'name email')
                            .populate('deliveryAgentId', 'name phone vehicleType') // Populate agent details
                            .sort({ createdAt: -1 })
                            .lean();
    } catch (e) {
        console.error("Error fetching deliveries by vendor:", e);
        return [];
    }
}

export async function updateDeliveryStatus(deliveryId: string, newStatus: string, vendorId: string) {
    await mongooseConnect();
    try {
        if (!mongoose.Types.ObjectId.isValid(deliveryId) || !mongoose.Types.ObjectId.isValid(vendorId)) {
          throw new Error("Invalid ID format");
        }

        const updateData: any = { status: newStatus };
        if (newStatus === 'Delivered') {
            updateData.actualDeliveryTime = new Date();
        }
        // If unassigning via status change (e.g., back to Pending Assignment), clear agentId
        if (newStatus === 'Pending Assignment') {
            updateData.deliveryAgentId = null;
        }

        const updatedDelivery = await Delivery.findOneAndUpdate(
            { _id: deliveryId, vendorId: vendorId }, 
            { $set: updateData },
            { new: true }
        ).lean();

        if (!updatedDelivery) {
            console.log(`Delivery ${deliveryId} not found or vendor ${vendorId} mismatch.`);
            return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
        }
        return { acknowledged: true, matchedCount: 1, modifiedCount: 1 }; 
    } catch (e) {
        console.error("Error updating delivery status:", e);
        throw new Error("Failed to update delivery status");
    }
}

// Modified to assign the agent's ID reference
export async function assignAgentToDelivery(deliveryId: string, agentId: string | null, vendorId: string) {
    await mongooseConnect();
    try {
        if (!mongoose.Types.ObjectId.isValid(deliveryId) || !mongoose.Types.ObjectId.isValid(vendorId)) {
            throw new Error("Invalid Delivery/Vendor ID format");
        }
        
        const agentObjectId = agentId ? new mongoose.Types.ObjectId(agentId) : null;
        if (agentId && !mongoose.Types.ObjectId.isValid(agentId)) {
             throw new Error("Invalid Agent ID format");
        }

        // Optional: Verify the agent exists and belongs to the vendor before assigning
        if (agentObjectId) {
            const agentExists = await DeliveryAgent.findOne({ _id: agentObjectId, vendorId: vendorId });
            if (!agentExists) {
                throw new Error(`Agent ${agentId} not found or does not belong to vendor ${vendorId}`);
            }
        }

        const updatedDelivery = await Delivery.findOneAndUpdate(
            { _id: deliveryId, vendorId: vendorId }, 
            { 
                $set: { 
                    deliveryAgentId: agentObjectId, // Set the agent ID reference
                    status: agentObjectId ? 'Assigned' : 'Pending Assignment', 
                }
            },
            { new: true } 
        ).lean();

        if (!updatedDelivery) {
             console.log(`Delivery ${deliveryId} not found or vendor ${vendorId} mismatch.`);
            return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
        }
        return { acknowledged: true, matchedCount: 1, modifiedCount: 1 }; 
    } catch (e) {
        console.error("Error assigning agent to delivery:", e);
        // Ensure the error message is passed up
        throw new Error(`Failed to assign agent: ${(e as Error).message}`); 
    }
}

// --- Delivery Agent Functions ---
export async function createDeliveryAgent(agentData: any) {
    await mongooseConnect();
    try {
        const newAgent = new DeliveryAgent(agentData);
        await newAgent.save();
        return JSON.parse(JSON.stringify(newAgent));
    } catch (error: any) { // Catch as any to inspect properties
        console.error("Error creating delivery agent:", error); // Log the full error for details

        // Check for Mongoose Validation Error
        if (error.name === 'ValidationError') {
            let errorMessages = Object.values(error.errors).map((el: any) => el.message).join(', ');
            throw new Error(`Validation failed: ${errorMessages}`);
        } 
        // Check for duplicate key error (already handled, but kept for clarity)
        else if (error.code === 11000) {
            // Extract conflicting field (Mongoose error message usually indicates it)
            const field = Object.keys(error.keyPattern)[0];
            throw new Error(`Delivery agent with this ${field} already exists for this vendor.`);
        }
        // Throw generic error for other cases
        throw new Error("Failed to create delivery agent. Please check server logs for details.");
    }
}

export async function getDeliveryAgentsByVendor(vendorId: string) {
    await mongooseConnect();
    try {
        if (!mongoose.Types.ObjectId.isValid(vendorId)) return [];
        return await DeliveryAgent.find({ vendorId }).lean();
    } catch (e) {
        console.error("Error fetching delivery agents by vendor:", e);
        return [];
    }
}

export async function getDeliveryAgentById(agentId: string, vendorId: string) {
    await mongooseConnect();
    try {
        if (!mongoose.Types.ObjectId.isValid(agentId) || !mongoose.Types.ObjectId.isValid(vendorId)) return null;
        // Ensure agent belongs to the specified vendor for security
        return await DeliveryAgent.findOne({ _id: agentId, vendorId: vendorId }).lean();
    } catch (e) {
        console.error("Error fetching delivery agent by ID:", e);
        return null;
    }
}

export async function updateDeliveryAgent(agentId: string, vendorId: string, updates: any) {
    await mongooseConnect();
    try {
        if (!mongoose.Types.ObjectId.isValid(agentId) || !mongoose.Types.ObjectId.isValid(vendorId)) {
            throw new Error("Invalid ID format");
        }
        // Prevent changing vendorId
        if (updates.vendorId) delete updates.vendorId; 
        if (updates.createdAt) delete updates.createdAt;

        const updatedAgent = await DeliveryAgent.findOneAndUpdate(
            { _id: agentId, vendorId: vendorId }, // Match agent AND vendor
            { $set: updates },
            { new: true }
        ).lean();
        
        if (!updatedAgent) {
            throw new Error(`Agent ${agentId} not found or does not belong to vendor ${vendorId}`);
        }
        return updatedAgent;
    } catch (e) {
        console.error("Error updating delivery agent:", e);
        throw new Error(`Failed to update delivery agent: ${(e as Error).message}`);
    }
}

export async function deleteDeliveryAgent(agentId: string, vendorId: string) {
    await mongooseConnect();
    try {
        if (!mongoose.Types.ObjectId.isValid(agentId) || !mongoose.Types.ObjectId.isValid(vendorId)) {
            throw new Error("Invalid ID format");
        }
        const result = await DeliveryAgent.deleteOne({ _id: agentId, vendorId: vendorId });
        
        if (result.deletedCount === 0) {
             throw new Error(`Agent ${agentId} not found or does not belong to vendor ${vendorId}`);
        }
        // Optional: Unassign this agent from any deliveries they were assigned to
        // await Delivery.updateMany({ deliveryAgentId: agentId }, { $set: { deliveryAgentId: null, status: 'Pending Assignment' } });
        
        return { deletedCount: result.deletedCount };
    } catch (e) {
        console.error("Error deleting delivery agent:", e);
       throw new Error(`Failed to delete delivery agent: ${(e as Error).message}`);
    }
}

// Seed function removed - better handled in a dedicated script.
