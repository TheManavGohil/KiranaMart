import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/authOptions";
import { verifyToken } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import Cart from "@/lib/models/Cart";
import Product from "@/lib/models/Product";

// Helper function to extract user ID from session or token
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      if ('id' in session.user && session.user.id) {
        return session.user.id;
      } else if (session.user.email) {
        const user = await getUserByEmail(session.user.email);
        return (user as any)?._id?.toString() || null;
      }
    }

    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (token) {
        const decoded = verifyToken(token);
        if (decoded && (decoded as any)._id) {
            return (decoded as any)._id.toString();
        }
    }
    return null;
}

// GET /api/customer/cart-v2 - Fetch user's cart
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const cart = await Cart.findOne({ userId: userObjectId }).populate({
            path: 'items.productId',
            model: Product,
            select: 'name price imageUrl'
        });

        if (!cart) {
            return NextResponse.json([]);
        }

        return NextResponse.json(cart.items);
    } catch (error) {
        console.error("[CART V2 GET]", error);
        return NextResponse.json({ message: "Failed to fetch cart" }, { status: 500 });
    }
}

// POST /api/customer/cart-v2 - Add item to cart
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { productId, quantity } = await req.json();
        if (!productId || typeof quantity !== 'number' || quantity <= 0) {
            return NextResponse.json({ message: "Invalid input: productId and quantity > 0 are required." }, { status: 400 });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const productObjectId = new mongoose.Types.ObjectId(productId);

        let cart = await Cart.findOne({ userId: userObjectId });

        if (!cart) {
            cart = new Cart({ userId: userObjectId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.equals(productObjectId));

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId: productObjectId, quantity });
        }

        await cart.save();

        const updatedCart = await Cart.findOne({ userId: userObjectId }).populate({
            path: 'items.productId',
            model: Product,
            select: 'name price imageUrl'
        });
        
        return NextResponse.json(updatedCart.items, { status: 201 });

    } catch (error) {
        console.error("[CART V2 POST]", error);
        return NextResponse.json({ message: "Failed to add item to cart" }, { status: 500 });
    }
}

// PUT /api/customer/cart-v2 - Update item quantity
export async function PUT(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { productId, quantity } = await req.json();
        if (!productId || typeof quantity !== 'number' || quantity < 0) {
            return NextResponse.json({ message: "Invalid input: productId and quantity >= 0 are required." }, { status: 400 });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const productObjectId = new mongoose.Types.ObjectId(productId);

        const cart = await Cart.findOne({ userId: userObjectId });

        if (!cart) {
            return NextResponse.json({ message: "Cart not found" }, { status: 404 });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.equals(productObjectId));

        if (itemIndex === -1) {
            return NextResponse.json({ message: "Item not found in cart" }, { status: 404 });
        }

        if (quantity === 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        
        const updatedCart = await Cart.findOne({ userId: userObjectId }).populate({
            path: 'items.productId',
            model: Product,
            select: 'name price imageUrl'
        });

        return NextResponse.json(updatedCart.items);

    } catch (error) {
        console.error("[CART V2 PUT]", error);
        return NextResponse.json({ message: "Failed to update cart" }, { status: 500 });
    }
}

// DELETE /api/customer/cart-v2 - Remove item from cart
export async function DELETE(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { productId } = await req.json();
        if (!productId) {
            return NextResponse.json({ message: "Invalid input: productId is required." }, { status: 400 });
        }
        
        await Cart.updateOne(
            { userId: new mongoose.Types.ObjectId(userId) },
            { $pull: { items: { productId: new mongoose.Types.ObjectId(productId) } } }
        );

        const updatedCart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) }).populate({
            path: 'items.productId',
            model: Product,
            select: 'name price imageUrl'
        });
        
        if (!updatedCart) {
            return NextResponse.json([]);
        }

        return NextResponse.json(updatedCart.items);

    } catch (error) {
        console.error("[CART V2 DELETE]", error);
        return NextResponse.json({ message: "Failed to remove item from cart" }, { status: 500 });
    }
} 