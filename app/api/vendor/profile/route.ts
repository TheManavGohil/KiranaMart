import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/lib/mongodb'; // Using native driver helpers
import { ObjectId } from 'mongodb';

// Interface for expected PUT request body (fields from the form)
interface UpdateVendorProfileBody {
    name?: string; // Combined First + Last Name
    phoneNumber?: string;
    // Note: email and role are typically not updated here.
}

// GET vendor profile by ID (from JWT token)
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate Vendor
    const tokenCookie = request.cookies.get('token');
    const token = tokenCookie?.value;
    if (!token) return NextResponse.json({ message: 'Authentication token missing' }, { status: 401 });

    let payload: any;
    try {
      payload = verifyToken(token);
      if (!payload?._id || payload.role !== 'vendor') {
        throw new Error('Invalid token or role');
      }
    } catch (error) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const vendorId = payload._id;
    let vendorObjectId: ObjectId;
    try {
      vendorObjectId = new ObjectId(vendorId);
    } catch {
      return NextResponse.json({ message: 'Invalid Vendor ID format' }, { status: 400 });
    }

    // 2. Fetch Vendor Data from DB
    const db = await getDb();
    const vendor = await db.collection(COLLECTIONS.VENDORS).findOne(
      { _id: vendorObjectId },
      {
        // Specify fields needed for the profile form
        projection: {
          password: 0, // Exclude sensitive/unnecessary fields
          isApproved: 0,
          analytics: 0,
          // Keep: name, email, phoneNumber, role (if exists)
        }
      }
    );

    if (!vendor) {
      return NextResponse.json({ message: 'Vendor profile not found' }, { status: 404 });
    }

    // 3. Return Profile Data (including name, email, phoneNumber, role)
    return NextResponse.json(vendor, { status: 200 });

  } catch (error: any) {
    console.error('[API GET /vendor/profile] Error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// Update vendor profile
export async function PUT(request: NextRequest) {
  try {
    // 1. Authenticate Vendor (Same as GET)
    const tokenCookie = request.cookies.get('token');
    const token = tokenCookie?.value;
    if (!token) return NextResponse.json({ message: 'Authentication token missing' }, { status: 401 });

    let payload: any;
    try {
      payload = verifyToken(token);
      if (!payload?._id || payload.role !== 'vendor') {
        throw new Error('Invalid token or role');
      }
    } catch (error) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const vendorId = payload._id;
    let vendorObjectId: ObjectId;
    try {
      vendorObjectId = new ObjectId(vendorId);
    } catch {
      return NextResponse.json({ message: 'Invalid Vendor ID format' }, { status: 400 });
    }

    // 2. Get Update Data from Request Body
    const body: UpdateVendorProfileBody = await request.json();

    // 3. Construct Update Object (Only include editable fields present in the body)
    const updateFields: { [key: string]: any } = {};
    if (body.name !== undefined) {
      updateFields.name = body.name.trim(); // Update the 'name' field
    }
    if (body.phoneNumber !== undefined) {
      updateFields.phoneNumber = body.phoneNumber.trim(); // Update the 'phoneNumber' field
    }
    // Add other updatable fields derived from the frontend form if needed

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ message: 'No update fields provided' }, { status: 400 });
    }

    updateFields.updatedAt = new Date(); // Manually update timestamp

    // 4. Update Vendor in DB
    const db = await getDb();
    const result = await db.collection(COLLECTIONS.VENDORS).updateOne(
      { _id: vendorObjectId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Vendor profile not found' }, { status: 404 });
    }

    // 5. Return Success Response (Optionally return updated vendor data)
    // Fetching the updated data to return it
    const updatedVendor = await db.collection(COLLECTIONS.VENDORS).findOne(
      { _id: vendorObjectId },
      {
        projection: { password: 0, isApproved: 0, analytics: 0 }
      }
    );

    return NextResponse.json({
      message: 'Profile updated successfully',
      vendor: updatedVendor
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API PUT /vendor/profile] Error:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 