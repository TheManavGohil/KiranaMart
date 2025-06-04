import { NextRequest, NextResponse } from "next/server";
import { addToCart, getUserByEmail } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
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

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await req.json();
    if (!productId || !quantity) {
       return NextResponse.json({ error: "Missing productId or quantity" }, { status: 400 });
    }

    await addToCart(userId, { productId, quantity });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: error.message || "Failed to add to cart" }, { status: 500 });
  }
} 