import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";

interface SessionUser {
  id?: string;
  name?: string;
  email?: string;
}

// GET /api/customer/profile - Get the current customer's profile
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate Customer - try both NextAuth and JWT
    let customerId: string | null = null;
    
    // Try with NextAuth session first
    const session = await getServerSession();
    if (session?.user && 'id' in session.user) {
      customerId = session.user.id as string;
    } else {
      // If no NextAuth session, try JWT
      const tokenCookie = request.cookies.get('token');
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

    // 2. Fetch customer from DB
    const db = await getDb();
    const customer = await db.collection(COLLECTIONS.CUSTOMERS).findOne({ _id: customerObjectId });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // 3. Remove sensitive information and return
    const { password, passwordResetToken, passwordResetExpires, ...customerData } = customer;
    
    return NextResponse.json(customerData);
  } catch (error: any) {
    console.error("Error fetching customer profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer profile", message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/customer/profile - Update the current customer's profile
export async function PUT(request: NextRequest) {
  try {
    // 1. Authenticate Customer - try both NextAuth and JWT
    let customerId: string | null = null;
    
    // Try with NextAuth session first
    const session = await getServerSession();
    if (session?.user && 'id' in session.user) {
      customerId = session.user.id as string;
    } else {
      // If no NextAuth session, try JWT
      const tokenCookie = request.cookies.get('token');
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

    // 2. Parse update data
    const updates = await request.json();

    // 3. Validate required fields
    if (!updates.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // 4. Don't allow updating sensitive fields
    const { email, password, role, _id, ...allowedUpdates } = updates;

    // 5. Add updatedAt timestamp
    const updateData = {
      ...allowedUpdates,
      updatedAt: new Date()
    };

    // 6. Update customer in DB
    const db = await getDb();
    const result = await db.collection(COLLECTIONS.CUSTOMERS).updateOne(
      { _id: customerObjectId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // 7. Return the updated customer
    const updatedCustomer = await db.collection(COLLECTIONS.CUSTOMERS).findOne(
      { _id: customerObjectId },
      { projection: { password: 0, passwordResetToken: 0, passwordResetExpires: 0 } }
    );

    return NextResponse.json(updatedCustomer);
  } catch (error: any) {
    console.error("Error updating customer profile:", error);
    return NextResponse.json(
      { error: "Failed to update customer profile", message: error.message },
      { status: 500 }
    );
  }
} 