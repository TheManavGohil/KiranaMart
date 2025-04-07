import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
// import { updateDeliveryStatus } from '@/lib/db'; // Remove native driver function
import DeliveryModel, { IDelivery } from '@/models/Delivery'; // Import Mongoose model and interface
// import { ObjectId } from 'mongodb'; // No longer needed
import mongoose from 'mongoose'; // Import mongoose
import mongooseConnect from '@/lib/mongooseConnect'; // Import the connection helper

// Define allowed statuses (using type from IDelivery)
type DeliveryStatus = IDelivery['status'];
const allowedStatuses: DeliveryStatus[] = ['Pending Assignment', 'Assigned', 'Out for Delivery', 'Delivered', 'Attempted Delivery', 'Cancelled', 'Delayed'];

interface UpdateStatusBody {
    newStatus: DeliveryStatus;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { deliveryId: string } }
) {
    const deliveryId = params.deliveryId;

    try {
        await mongooseConnect(); // Ensure Mongoose connection

        // Auth & Validation
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

        if (!deliveryId || !mongoose.Types.ObjectId.isValid(deliveryId)) {
            return NextResponse.json({ message: 'Invalid Delivery ID provided' }, { status: 400 });
        }

        const { newStatus }: UpdateStatusBody = await request.json();

        if (!newStatus || !allowedStatuses.includes(newStatus)) {
             return NextResponse.json({ message: 'Invalid or missing newStatus provided' }, { status: 400 });
        }

        // await dbConnect(); // REMOVED: Connection handled by model import/usage

        // Prepare update data
        const updateData: Partial<IDelivery> = {
            status: newStatus,
            // Mongoose automatically handles updatedAt via timestamps: true
        };

        // Set actual delivery time if status is 'Delivered'
        if (newStatus === 'Delivered') {
            updateData.actualDeliveryTime = new Date();
        }

        // Find and update using Mongoose Model
        const updatedDelivery = await DeliveryModel.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(deliveryId),
                vendorId: new mongoose.Types.ObjectId(vendorId) // Ensure vendor owns this delivery
            },
            { $set: updateData },
            { new: true } // Return the updated document (optional)
        );

        if (!updatedDelivery) {
            // If null, either delivery not found OR vendorId didn't match
            return NextResponse.json({ message: 'Delivery not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Delivery status updated successfully', deliveryId: updatedDelivery._id, status: updatedDelivery.status }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating delivery status with Mongoose:', error);
        if (error instanceof mongoose.Error.CastError) {
             return NextResponse.json({ message: `Invalid ID format: ${error.message}` }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
} 