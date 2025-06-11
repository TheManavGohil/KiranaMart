import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET /api/customer/addresses - Get customer addresses
export async function GET(req: NextRequest) {
  try {
    // Authenticate Customer
    let customerId: string | null = null;
    
    const session = await getServerSession();
    if (session?.user && 'id' in session.user) {
      customerId = session.user.id as string;
    } else {
      const tokenCookie = req.cookies.get('token');
      const token = tokenCookie?.value;
      if (!token) {
        return NextResponse.json({ error: 'Authentication token missing' }, { status: 401 });
      }

      try {
        const payload = verifyToken(token);
        if (!payload?._id || payload.role !== 'customer') {
          throw new Error('Invalid token or role');
        }
        customerId = payload._id;
      } catch (error) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID not found' }, { status: 401 });
    }

    let customerObjectId: ObjectId;
    try {
      customerObjectId = new ObjectId(customerId);
    } catch {
      return NextResponse.json({ error: 'Invalid Customer ID format' }, { status: 400 });
    }

    const db = await getDb();
    
    // Find the customer and get their addresses
    const customer = await db.collection(COLLECTIONS.CUSTOMERS).findOne({
      _id: customerObjectId
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Return the addresses array from the customer document
    const addresses = customer.addresses || [];

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
    // Authenticate Customer - use the same pattern as phone routes
    let customerId: string | null = null;
    
    // Try with NextAuth session first
    const session = await getServerSession();
    if (session?.user && 'id' in session.user) {
      customerId = session.user.id as string;
    } else {
      // If no NextAuth session, try JWT
      const tokenCookie = req.cookies.get('token');
      const token = tokenCookie?.value;
      if (!token) {
        return NextResponse.json({ error: 'Authentication token missing' }, { status: 401 });
      }

      try {
        const payload = verifyToken(token);
        if (!payload?._id || payload.role !== 'customer') {
          throw new Error('Invalid token or role');
        }
        customerId = payload._id;
      } catch (error) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID not found' }, { status: 401 });
    }

    let customerObjectId: ObjectId;
    try {
      customerObjectId = new ObjectId(customerId);
    } catch {
      return NextResponse.json({ error: 'Invalid Customer ID format' }, { status: 400 });
    }

    const addressData = await req.json();
    
    // Validate required fields
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.postalCode) {
      return NextResponse.json(
        { error: "Missing required address fields (street, city, state, postalCode)" },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Find the customer
    const customer = await db.collection(COLLECTIONS.CUSTOMERS).findOne({
      _id: customerObjectId
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Add new address
    const newAddress = {
      _id: new ObjectId(),
      type: addressData.type || 'home',
      street: addressData.street.trim(),
      city: addressData.city.trim(),
      state: addressData.state.trim(),
      postalCode: addressData.postalCode.trim(),
      country: addressData.country || 'India',
      label: addressData.label || '',
      location: addressData.location || null,
      createdAt: new Date()
    };

    const result = await db.collection(COLLECTIONS.CUSTOMERS).updateOne(
      { _id: customerObjectId },
      { 
        $push: { 
          addresses: newAddress as any
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to add address' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Address added successfully',
        address: newAddress
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

 