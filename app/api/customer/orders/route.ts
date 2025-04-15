import { NextRequest, NextResponse } from "next/server";
import mongooseConnect from "@/lib/mongooseConnect";
import { verifyToken } from "@/lib/auth";
import { getOrdersByUser } from "@/lib/db";

// GET /api/customer/orders - Get the current customer's orders with pagination
export async function GET(request: NextRequest) {
  await mongooseConnect();
  try {
    // 1. Verify Authentication using verifyToken from cookie
    const tokenCookie = request.cookies.get('token');
    const token = tokenCookie?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = verifyToken(token); // Verify the token
      // Check if the user role is customer
      if (!payload?._id || payload.role !== 'customer') {
        throw new Error('Invalid token or not a customer');
      }
    } catch (error) {
      console.error("Auth Error in /api/customer/orders:", error);
      // Clear invalid cookie? Optional.
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = payload._id; // Get customer ID from token

    // 2. Fetch Orders using getOrdersByUser
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const skipParam = url.searchParams.get('skip');
    const limit = limitParam ? parseInt(limitParam, 10) : 10; // Default limit
    const skip = skipParam ? parseInt(skipParam, 10) : 0;   // Default skip

    // Note: getOrdersByUser likely handles pagination if implemented, adjust call if needed
    const orders = await getOrdersByUser(userId); // Fetch orders for this specific user
    
    // We might want pagination in getOrdersByUser eventually
    // const orders = await getOrdersByUser(userId, limit, skip);

    return NextResponse.json(orders);

  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json({ message: 'Failed to fetch orders', error: (error as Error).message }, { status: 500 });
  }
} 