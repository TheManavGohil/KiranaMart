import mongoose, { Schema, models } from 'mongoose';

const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  // Add label (e.g., 'Home', 'Work') if needed
}, { _id: false }); // Don't create separate IDs for addresses

const cartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  // password: { type: String, required: true }, // Store hashed password
  // phone: { type: String },
  addresses: [addressSchema],
  cart: [cartItemSchema],
  orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  // Add roles, email verification status, etc. if needed
}, {
  timestamps: true,
});

// Add methods if needed, e.g., for password hashing/comparison
// userSchema.methods.comparePassword = function(...) { ... };

const User = models.User || mongoose.model('User', userSchema, 'customers');

export default User; 