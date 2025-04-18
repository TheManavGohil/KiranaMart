import { NextResponse } from 'next/server';
import { getVendorCollection, getDb } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET vendor settings
export async function GET(req: Request) {
  console.log('GET /api/vendor/settings endpoint called');
  try {
    // Verify token from Authorization header
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.log('Missing authorization token');
      return NextResponse.json({ message: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'vendor') {
      console.log('Unauthorized: Not a vendor account');
      return NextResponse.json({ message: 'Unauthorized: Not a vendor account' }, { status: 403 });
    }

    const vendorId = decoded._id;
    console.log(`Fetching settings for vendor ID: ${vendorId}`);
    
    // Get vendor from database
    const collection = await getVendorCollection();
    const vendor = await collection.findOne({ _id: new ObjectId(vendorId) });

    if (!vendor) {
      console.log('Vendor not found');
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    // Return only necessary store settings
    const storeSettings = {
      storeName: vendor.storeName || "",
      storeId: vendor.storeId || `STORE-${vendorId.toString().substring(0, 5)}`,
      storeDescription: vendor.storeDescription || "",
      phoneNumber: vendor.phoneNumber || "",
      email: vendor.email || "",
      address: vendor.address || "",
      businessHours: vendor.businessHours || [
        { day: "Monday", open: "08:00", close: "22:00", enabled: true },
        { day: "Tuesday", open: "08:00", close: "22:00", enabled: true },
        { day: "Wednesday", open: "08:00", close: "22:00", enabled: true },
        { day: "Thursday", open: "08:00", close: "22:00", enabled: true },
        { day: "Friday", open: "08:00", close: "22:00", enabled: true },
        { day: "Saturday", open: "09:00", close: "20:00", enabled: true },
        { day: "Sunday", open: "10:00", close: "18:00", enabled: false },
      ],
      deliverySettings: vendor.deliverySettings || {
        deliveryRadius: 5,
        freeDelivery: true,
        freeDeliveryThreshold: 500,
        expressDelivery: false,
        expressDeliveryTime: 30,
      },
      location: vendor.location || null,
    };

    console.log('Successfully retrieved vendor settings');
    return NextResponse.json(storeSettings);
  } catch (error) {
    console.error('Error fetching vendor settings:', error);
    return NextResponse.json(
      { message: `Error fetching vendor settings: ${error.message}` },
      { status: 500 }
    );
  }
}

// Update vendor settings
export async function PUT(req: Request) {
  console.log('PUT /api/vendor/settings endpoint called');
  try {
    // Verify token from Authorization header
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.log('Missing authorization token');
      return NextResponse.json({ message: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'vendor') {
      console.log('Unauthorized: Not a vendor account');
      return NextResponse.json({ message: 'Unauthorized: Not a vendor account' }, { status: 403 });
    }

    const vendorId = decoded._id;
    console.log(`Updating settings for vendor ID: ${vendorId}`);
    
    // Get update data from request body
    const updateData = await req.json();
    
    // Validate required fields
    if (!updateData) {
      console.log('Missing update data');
      return NextResponse.json({ message: 'Missing update data' }, { status: 400 });
    }
    
    // Prepare update object
    const updateFields: Record<string, any> = {};
    
    // Only include fields that were provided in the request
    if (updateData.storeName !== undefined) updateFields.storeName = updateData.storeName;
    if (updateData.storeDescription !== undefined) updateFields.storeDescription = updateData.storeDescription;
    if (updateData.phoneNumber !== undefined) updateFields.phoneNumber = updateData.phoneNumber;
    if (updateData.email !== undefined) updateFields.email = updateData.email;
    if (updateData.address !== undefined) updateFields.address = updateData.address;
    if (updateData.businessHours !== undefined) updateFields.businessHours = updateData.businessHours;
    if (updateData.deliverySettings !== undefined) updateFields.deliverySettings = updateData.deliverySettings;
    if (updateData.location !== undefined) updateFields.location = updateData.location;
    
    // Add updated timestamp
    updateFields.updatedAt = new Date();
    
    // Update vendor in database
    const collection = await getVendorCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(vendorId) },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      console.log('Vendor not found');
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }
    
    console.log('Vendor settings updated successfully');
    return NextResponse.json({ 
      message: 'Settings updated successfully', 
      updated: result.modifiedCount > 0 
    });
  } catch (error) {
    console.error('Error updating vendor settings:', error);
    return NextResponse.json(
      { message: `Error updating vendor settings: ${error.message}` },
      { status: 500 }
    );
  }
} 