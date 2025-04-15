import mongoose, { Schema, models } from 'mongoose';

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String }, // e.g., 'kg', 'piece', 'litre'
  category: { type: String, required: true, index: true }, // Added index for faster category lookups
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true }, // Added index
  stock: { type: Number, required: true, default: 0 },
  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true },
  tags: [{ type: String }],
  manufacturingDate: { type: Date, required: false },
  expiryDate: { type: Date, required: false },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// Index for text search on name and description (optional, but useful)
productSchema.index({ name: 'text', description: 'text' });

const Product = models.Product || mongoose.model('Product', productSchema);

export default Product; 