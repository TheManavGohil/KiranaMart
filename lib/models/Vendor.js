import mongoose, { Schema, models } from 'mongoose';

const vendorAddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

const vendorSchema = new Schema({
  businessName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true },
  address: { type: vendorAddressSchema, required: true },
  description: { type: String },
  logoUrl: { type: String },
  // userAccount: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional: Link to a User account if vendors log in
  // products: [{ type: Schema.Types.ObjectId, ref: 'Product' }], // This is often redundant if Product has vendorId
  // rating: { type: Number },
}, {
  timestamps: true,
});

const Vendor = models.Vendor || mongoose.model('Vendor', vendorSchema);

export default Vendor; 