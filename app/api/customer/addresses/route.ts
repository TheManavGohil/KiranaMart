import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToken, decodeToken } from "@/lib/auth";

// GET /api/customer/addresses - Get customer addresses
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

    // Mock data for customer addresses
    const addresses = [
      {
        id: "addr1",
        type: "Home",
        name: "John Doe",
        address: "123 Main St, Apt 4B",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        phone: "9876543210",
        isDefault: true
      },
      {
        id: "addr2",
        type: "Office",
        name: "John Doe",
        address: "456 Business Park, Tower B, Floor 5",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400051",
        phone: "9876543210",
        isDefault: false
      }
    ];

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching customer addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer addresses" },
      { status: 500 }
    );
  }
}

// POST /api/customer/addresses - Add a new address
export async function POST(req: NextRequest) {
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

    const addressData = await req.json();
    
    // Validate required fields
    const requiredFields = ["name", "address", "city", "state", "pincode", "phone"];
    for (const field of requiredFields) {
      if (!addressData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Mock successful response
    return NextResponse.json(
      { 
        id: "addr3", 
        ...addressData,
        isDefault: addressData.isDefault || false 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding address:", error);
    return NextResponse.json(
      { error: "Failed to add address" },
      { status: 500 }
    );
  }
}

// PUT /api/customer/addresses/:id - Update an address
export async function PUT(req: NextRequest) {
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

    const addressId = req.nextUrl.pathname.split('/').pop();
    if (!addressId) {
      return NextResponse.json(
        { error: "Address ID not provided" },
        { status: 400 }
      );
    }

    const addressData = await req.json();
    
    // Mock successful response
    return NextResponse.json(
      { id: addressId, ...addressData }
    );
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE /api/customer/addresses/:id - Delete an address
export async function DELETE(req: NextRequest) {
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

    const addressId = req.nextUrl.pathname.split('/').pop();
    if (!addressId) {
      return NextResponse.json(
        { error: "Address ID not provided" },
        { status: 400 }
      );
    }

    // Mock successful response
    return NextResponse.json(
      { success: true, message: "Address deleted successfully" }
    );
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
} 