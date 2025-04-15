import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import mongooseConnect from '@/lib/mongooseConnect';
import {
    createDeliveryAgent,
    getDeliveryAgentsByVendor,
    updateDeliveryAgent,
    deleteDeliveryAgent,
    getDeliveryAgentById
} from '@/lib/db';
import mongoose from 'mongoose';

// GET /api/vendor/delivery-agents - Fetch all agents for the logged-in vendor
export async function GET(request: NextRequest) {
    await mongooseConnect();
    const tokenPayload = verifyToken(request.cookies.get('token')?.value);
    if (!tokenPayload || tokenPayload.role !== 'vendor') {
        return NextResponse.json({ message: 'Unauthorized or Invalid Role' }, { status: 401 });
    }

    try {
        const agents = await getDeliveryAgentsByVendor(tokenPayload._id);
        return NextResponse.json(agents);
    } catch (error) {
        console.error("Error fetching delivery agents:", error);
        return NextResponse.json({ message: 'Failed to fetch delivery agents', error: (error as Error).message }, { status: 500 });
    }
}

// POST /api/vendor/delivery-agents - Create a new agent for the logged-in vendor
export async function POST(request: NextRequest) {
    await mongooseConnect();
    const tokenPayload = verifyToken(request.cookies.get('token')?.value);
    if (!tokenPayload || tokenPayload.role !== 'vendor') {
        return NextResponse.json({ message: 'Unauthorized or Invalid Role' }, { status: 401 });
    }

    try {
        const body = await request.json();
        // Validate required fields (name, phone)
        if (!body.name || !body.phone) {
            return NextResponse.json({ message: 'Missing required fields: name and phone' }, { status: 400 });
        }

        // Normalize vehicleType to lowercase if provided
        if (body.vehicleType && typeof body.vehicleType === 'string') {
            body.vehicleType = body.vehicleType.toLowerCase();
        }

        // Ensure vendorId is set correctly
        const agentData = { ...body, vendorId: tokenPayload._id }; 

        const newAgent = await createDeliveryAgent(agentData);
        return NextResponse.json(newAgent, { status: 201 });
    } catch (error) {
        console.error("Error creating delivery agent:", error);
        return NextResponse.json({ message: 'Failed to create delivery agent', error: (error as Error).message }, { status: 500 });
    }
}

// Note: For PUT and DELETE on specific agents, you'd typically use a dynamic route like
// /api/vendor/delivery-agents/[agentId]/route.ts 