import mongoose, { Schema, models } from 'mongoose';

const deliveryAgentSchema = new Schema({
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true,
  },
  // Optional: Link to a User account if agents can log in
  // userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true }, 
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, // Consider uniqueness constraint
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'car', 'van', 'other'],
    default: 'bike',
  },
  vehicleDetails: { type: String }, // e.g., "MH 12 AB 1234"
  isActive: { type: Boolean, default: true, index: true }, // Index for filtering active agents
  // Add other fields like address, current location (if tracking), performance metrics etc.
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Ensure uniqueness for phone numbers scoped to a vendor (optional, adjust if phone must be globally unique)
// deliveryAgentSchema.index({ vendorId: 1, phone: 1 }, { unique: true });

const DeliveryAgent = models.DeliveryAgent || mongoose.model('DeliveryAgent', deliveryAgentSchema);

export default DeliveryAgent; 