import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/db";
import { getToken, decodeToken } from "@/lib/auth";

// GET /api/customer/orders - Get the current customer's orders with pagination
export async function GET(req: NextRequest) {
  try {
    // Support both NextAuth and JWT authentication
    let customerId: string | undefined;
    
    // First try getting customer ID from NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      customerId = session.user.id;
    } else {
      // Try JWT token if NextAuth session not available
      const token = getToken(req);
      if (token) {
        const decodedToken = decodeToken(token);
        if (decodedToken && decodedToken.id) {
          customerId = decodedToken.id;
        }
      }
    }
    
    if (!customerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get pagination parameters from query
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || undefined;

    // Get orders from the database
    const { orders, totalOrders } = await getCustomerOrders(customerId, {
      page, 
      limit,
      status
    });

    // For now, return mock data since we need to implement getCustomerOrders in db.ts
    const mockOrders = [
      {
        _id: "order1",
        orderId: "KM-2023001",
        date: "2023-05-15",
        status: "Delivered",
        total: 450.75,
        items: 5,
        imageUrl: "/placeholder.svg"
      },
      {
        _id: "order2",
        orderId: "KM-2023002",
        date: "2023-05-20",
        status: "Processing",
        total: 320.50,
        items: 3,
        imageUrl: "/placeholder.svg"
      },
      {
        _id: "order3",
        orderId: "KM-2023003",
        date: "2023-05-23",
        status: "Cancelled",
        total: 150.25,
        items: 2,
        imageUrl: "/placeholder.svg"
      }
    ];

    // If limit parameter is provided, return only that many orders
    const limitedOrders = searchParams.has("limit") 
      ? mockOrders.slice(0, limit) 
      : mockOrders;

    return NextResponse.json(limitedOrders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer orders" },
      { status: 500 }
    );
  }
} 