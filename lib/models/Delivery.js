import mongoose, { Schema, models } from 'mongoose';

// REMOVED: Embedded delivery agent schema is no longer needed
/*
const deliveryAgentSchema = new Schema({
    // You might want to ref instead if you make DeliveryAgent its own collection
    agentId: { type: Schema.Types.ObjectId, ref: 'User' }, // Or ref: 'DeliveryAgent' if you create a dedicated collection
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleDetails: { type: String },
}, { _id: false });
*/

const deliverySchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Picked Up', 'In Transit', 'Delivered', 'Delayed', 'Failed', 'Pending Assignment', 'Assigned'], // Ensure 'Assigned' is included
        default: 'Pending Assignment',
        required: true,
        index: true, // Index status for faster filtering
    },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // Added index
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true }, // Added index
    customerAddress: { // Replicating address here might be good for historical data
        street: String,
        city: String,
        postalCode: String,
        // Add other fields as needed
    },
    scheduledPickupTime: { type: Date },
    actualPickupTime: { type: Date },
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    // Changed deliveryAgent to a reference to the DeliveryAgent model
    deliveryAgentId: {
        type: Schema.Types.ObjectId,
        ref: 'DeliveryAgent', // Reference the new model
        index: true, // Index for finding deliveries by agent
        default: null, // Default to null (unassigned)
    },
    deliveryNotes: { type: String },
    // Add location tracking if needed
    // currentLocation: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: [0, 0] } },
}, {
    timestamps: true,
});

// Optional: Index for geospatial queries if using location
// deliverySchema.index({ currentLocation: '2dsphere' });

const Delivery = models.Delivery || mongoose.model('Delivery', deliverySchema);

export default Delivery; 