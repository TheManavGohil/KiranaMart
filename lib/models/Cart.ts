import mongoose, { Schema, Document, models, Model } from 'mongoose';

// Interface for a single item in the cart
export interface ICartItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
}

// Interface for the Cart document
export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
}, { _id: true }); // Use _id for cart items to allow easy update/delete if needed.

const cartSchema = new Schema<ICart>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    items: [cartItemSchema],
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
});

const Cart: Model<ICart> = models.Cart || mongoose.model<ICart>('Cart', cartSchema);

export default Cart; 