import mongoose, { Schema, Document, Types, Model } from 'mongoose';

// Interface representing a Delivery Agent document
export interface IDeliveryAgent extends Document {
  vendorId: Types.ObjectId; // Link to the Vendor who employs the agent
  name: string;
  phone: string;
  vehicleType: 'Bike' | 'Car' | 'Scooter' | 'Other';
  isActive: boolean; // To mark if the agent is currently active/available
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryAgentSchema: Schema<IDeliveryAgent> = new Schema(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor', // Link to your Vendor model
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      // Consider adding validation for phone format if needed
    },
    vehicleType: {
      type: String,
      enum: ['Bike', 'Car', 'Scooter', 'Other'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    collection: 'deliveryAgents', // Explicitly set collection name
  }
);

// Add compound index for efficient lookups by vendor and active status
DeliveryAgentSchema.index({ vendorId: 1, isActive: 1 });

// Prevent model overwrite during HMR
const DeliveryAgentModel: Model<IDeliveryAgent> = 
    mongoose.models.DeliveryAgent || 
    mongoose.model<IDeliveryAgent>('DeliveryAgent', DeliveryAgentSchema);

export default DeliveryAgentModel; 