import { NextRequest, NextResponse } from "next/server";
import { addToCart, getUserByEmail, getCart } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";
import { User, Cart } from "@/lib/db";

// Helper function to extract user ID from session or token
async function getUserIdFromRequest(req: NextRequest) {
    // Try to get user ID from NextAuth session
    const session = await getServerSession(authOptions);
    let userId = undefined;
    if (session?.user) {
      // Try id, fallback to email
      if ('id' in session.user && session.user.id) {
        userId = session.user.id;
      } else if (session.user.email) {
        const user = await getUserByEmail(session.user.email);
        userId = (user as any)?._id?.toString();
      }
    }

    // If not found, try JWT (custom auth)
    if (!userId) {
      const token = req.headers.get("Authorization")?.split(" ")[1];
      if (token) {
        const decoded = verifyToken(token);
        if (decoded && (decoded as any)._id) {
          userId = (decoded as any)._id.toString();
        }
      }
    }
  return userId;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await req.json();
    if (!productId || !quantity) {
       return NextResponse.json({ error: "Missing productId or quantity" }, { status: 400 });
    }

    console.log("[API /cart] User ID extracted:", userId);
    await addToCart(userId, { productId, quantity });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: error.message || "Failed to add to cart" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await getCart(userId);
    return NextResponse.json(cart);
  } catch (error: any) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch cart" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, quantity } = await request.json();
    
    if (!itemId || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid request. itemId and quantity (>= 1) are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the cart item and update its quantity
    const cartItem = await Cart.findOneAndUpdate(
      { 
        userId: user._id,
        _id: itemId // This is the cart item's ID, not the product ID
      },
      { $set: { quantity } },
      { new: true } // Return the updated document
    ).populate('productId');

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $pull: { items: { productId: new mongoose.Types.ObjectId(productId) } } },
      { new: true }
    );

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found or item not in cart' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
} 