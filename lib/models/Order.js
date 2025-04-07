import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', // Assuming you have a Product model
    required: true 
  },
  name: { type: String, required: true }, // Store name for easy display
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Price at the time of order
  unit: { type: String },
});

const orderSchema = new mongoose.Schema({
  orderId: { // Custom, more user-friendly ID
    type: String, 
    required: true, 
    unique: true 
  }, 
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Assuming a User model for customers
    required: true 
  },
  customerName: { type: String, required: true }, // Store name for easy display
  vendorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Assuming a User model for vendors
    required: true 
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
    required: true 
  },
  orderDate: { type: Date, default: Date.now },
  deliveryAddress: { // Assuming delivery details might be needed
    street: String,
    city: String,
    postalCode: String,
    // Add other address fields as needed
  },
  // Timestamps for tracking creation and updates
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` field on save
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure the model is only compiled once
export default mongoose.models.Order || mongoose.model('Order', orderSchema); 