import mongoose, { Schema, models } from 'mongoose';

const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
}, { _id: false }); // Don't create separate IDs for addresses

const cartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: addressSchema,
  cart: [cartItemSchema],
  orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
}, {
  timestamps: true,
});

// Add methods if needed, e.g., for password hashing/comparison
// userSchema.methods.comparePassword = function(...) { ... };

const User = models.User || mongoose.model('User', userSchema, 'customers');

export default User; 