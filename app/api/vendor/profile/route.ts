import { NextResponse } from 'next/server';
import { getVendorCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';

// GET vendor profile by ID (from JWT token)
export async function GET(req: Request) {
  try {
    // Verify token from Authorization header
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'vendor') {
      return NextResponse.json({ message: 'Unauthorized: Not a vendor account' }, { status: 403 });
    }

    const vendorId = decoded._id;
    
    // Get vendor from database
    const collection = await getVendorCollection();
    const vendor = await collection.findOne({ _id: new ObjectId(vendorId) });

    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    // Remove password before sending
    const { password, ...vendorData } = vendor;

    return NextResponse.json(vendorData);
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    return NextResponse.json(
      { message: `Error fetching vendor profile: ${error.message}` },
      { status: 500 }
    );
  }
}

// Update vendor profile
export async function PUT(req: Request) {
  try {
    // Verify token from Authorization header
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'vendor') {
      return NextResponse.json({ message: 'Unauthorized: Not a vendor account' }, { status: 403 });
    }

    const vendorId = decoded._id;
    const updateData = await req.json();
    
    // Prevent updating of secured fields
    const { password, _id, email, role, createdAt, ...safeUpdateData } = updateData;

    // Update vendor in database
    const collection = await getVendorCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(vendorId) },
      { 
        $set: {
          ...safeUpdateData,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      updated: result.modifiedCount > 0
    });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    return NextResponse.json(
      { message: `Error updating vendor profile: ${error.message}` },
      { status: 500 }
    );
  }
} 