import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
// import { assignAgentToDelivery } from '@/lib/db'; // Remove native driver function
import DeliveryModel from '@/lib/models/Delivery'; // Corrected import path
// import { ObjectId } from 'mongodb'; // No longer needed
import mongoose from 'mongoose'; // Import mongoose
import mongooseConnect from '@/lib/mongooseConnect'; // Import the connection helper

interface AssignAgentBody {
    agentId: string | null; // Agent's MongoDB _id (as string from JSON), or null to unassign
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

        const { agentId }: AssignAgentBody = await request.json();

        // Validate agentId format if it's not null
        if (agentId && !mongoose.Types.ObjectId.isValid(agentId)) {
            return NextResponse.json({ message: 'Invalid Agent ID format provided' }, { status: 400 });
        }

        // await dbConnect(); // REMOVED: Connection handled by model import/usage

        const agentObjectId = agentId ? new mongoose.Types.ObjectId(agentId) : null;

        // TODO Optional: Verify agent belongs to the vendor before assigning
        // This would require fetching the agent document first

        // Prepare update data
        const updateData: Partial<IDelivery> = {
            assignedAgentId: agentObjectId,
            status: agentObjectId ? 'Assigned' : 'Pending Assignment', // Update status
             // Mongoose automatically handles updatedAt via timestamps: true
        };

        // Find and update using Mongoose Model
        const updatedDelivery = await DeliveryModel.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(deliveryId),
                vendorId: new mongoose.Types.ObjectId(vendorId) // Ensure vendor owns this delivery
            },
            { $set: updateData },
            { new: true } // Return updated document
        );

        if (!updatedDelivery) {
            return NextResponse.json({ message: 'Delivery not found or access denied' }, { status: 404 });
        }

        return NextResponse.json(
            { message: 'Agent assigned successfully', delivery: updatedDelivery },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error assigning agent with Mongoose:', error);
        if (error instanceof mongoose.Error.CastError) {
             return NextResponse.json({ message: `Invalid ID format: ${error.message}` }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
} 