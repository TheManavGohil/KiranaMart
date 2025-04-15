import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import DeliveryModel from '@/lib/models/Delivery'; // Changed from @/models/Delivery
// import '@/models/DeliveryAgent'; // REMOVED: Import DeliveryAgent model - Causes error as file doesn't exist yet
// import dbConnect from '@/lib/dbConnect'; // REMOVED: Connection handled by model import/usage
import mongooseConnect from '@/lib/mongooseConnect'; // Import the connection helper
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await mongooseConnect(); // Ensure Mongoose connection

    // Authentication & Authorization (simplified check)
    const tokenCookie = request.cookies.get('token');
    const token = tokenCookie?.value;
    if (!token) return NextResponse.json({ message: 'Authentication token missing' }, { status: 401 });

    let payload: any;
    try {
        payload = verifyToken(token);
        if (!payload?._id) throw new Error('Invalid token payload');
    } catch (error) {
        return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    if (payload.role !== 'vendor') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const vendorId = payload._id;
    let vendorObjectId: mongoose.Types.ObjectId;
    try {
        vendorObjectId = new mongoose.Types.ObjectId(vendorId);
    } catch (error) {
        return NextResponse.json({ message: 'Invalid Vendor ID format' }, { status: 400 });
    }

    // await dbConnect(); // REMOVED: Connection handled by model import/usage

    // Fetch deliveries using Mongoose Model WITHOUT population for now
    const deliveriesFromDb = await DeliveryModel.find({ vendorId: vendorObjectId })
        // .populate('assignedAgentId') // REMOVED: Population requires DeliveryAgent model
        .sort({ createdAt: -1 })
        .lean();

    // Format data for frontend
    const formattedDeliveries = deliveriesFromDb.map((d: any) => ({
        _id: d._id.toString(),
        deliveryId: d.deliveryId || `del-${d._id.toString().slice(-5)}`, // Fallback ID
        orderId: d.orderId.toString(), // Assuming orderId is stored
        customer: {
            name: d.customerName || 'N/A',
            address: `${d.customerAddress?.street || ''}, ${d.customerAddress?.city || ''}, ${d.customerAddress?.postalCode || ''}`.replace(/^, |, $/g, '').trim() || 'No Address Provided',
            phone: d.customerPhone
        },
        // Set agent to null since we are not populating
        agent: null,
        // agent: d.assignedAgentId ? { ... } : null, // Original population logic removed
        status: d.status,
        lastUpdate: d.updatedAt?.toLocaleString() || d.createdAt?.toLocaleString() || 'N/A',
        estimatedDelivery: d.estimatedDeliveryTime?.toLocaleString() || 'N/A',
        actualDelivery: d.actualDeliveryTime?.toLocaleString(),
        location: d.currentLocation,
        orderValue: d.orderValue,
        packageSize: d.packageSize
    }));


    return NextResponse.json(formattedDeliveries, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching deliveries (Mongoose):', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// POST could be added here later if vendors need to manually create deliveries 