import mongoose, { Schema, Document, Types, Model } from 'mongoose';

// Interface representing the structure of a Delivery document
// Note: This aligns with the interface previously used in lib/db.ts
export interface IDelivery extends Document {
  deliveryId?: string; // Optional user-friendly ID
  orderId: Types.ObjectId; // Reference to Order
  vendorId: Types.ObjectId; // Reference to Vendor
  customerId: Types.ObjectId; // Reference to Customer (User model?)
  customerName: string;
  customerAddress: {
    street: string;
    city: string;
    postalCode: string;
    // Add other potential address fields if needed
  };
  customerPhone?: string;
  assignedAgentId?: Types.ObjectId | null; // Reference to DeliveryAgent
  status: 'Pending Assignment' | 'Assigned' | 'Out for Delivery' | 'Delivered' | 'Attempted Delivery' | 'Cancelled' | 'Delayed';
  estimatedDeliveryTime?: Date | null;
  actualDeliveryTime?: Date | null;
  lastLocationUpdate?: Date | null;
  currentLocation?: {
    lat: number;
    lon: number;
  } | null;
  deliveryNotes?: string;
  orderValue?: number;
  packageSize?: 'Small' | 'Medium' | 'Large';
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema: Schema<IDelivery> = new Schema(
  {
    deliveryId: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple documents to have null/missing deliveryId
        // Consider adding a default value or pre-save hook to generate this if needed
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order', // Assuming an Order model exists
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor', // Assuming a Vendor model exists
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Assuming a User model for customers
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      // Add other address fields here if needed
    },
    customerPhone: {
        type: String,
    },
    assignedAgentId: {
      type: Schema.Types.ObjectId,
      ref: 'DeliveryAgent', // Assuming a DeliveryAgent model will exist or is defined elsewhere
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending Assignment', 'Assigned', 'Out for Delivery', 'Delivered', 'Attempted Delivery', 'Cancelled', 'Delayed'],
      required: true,
      default: 'Pending Assignment',
      index: true,
    },
    estimatedDeliveryTime: {
      type: Date,
      default: null,
    },
    actualDeliveryTime: {
      type: Date,
      default: null,
    },
    lastLocationUpdate: {
      type: Date,
      default: null,
    },
    currentLocation: {
      lat: { type: Number },
      lon: { type: Number },
    },
    deliveryNotes: {
        type: String,
    },
    orderValue: {
        type: Number,
    },
    packageSize: {
        type: String,
        enum: ['Small', 'Medium', 'Large'],
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    collection: 'deliveries', // Explicitly set the collection name
  }
);

// Add index for efficient querying by vendor and status
DeliverySchema.index({ vendorId: 1, status: 1 });
DeliverySchema.index({ vendorId: 1, createdAt: -1 });

// Prevent model overwrite during HMR (Hot Module Replacement) in development
const DeliveryModel: Model<IDelivery> = mongoose.models.Delivery || mongoose.model<IDelivery>('Delivery', DeliverySchema);

export default DeliveryModel; 