import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import mongooseConnect from '@/lib/mongooseConnect'; // Import Mongoose connection utility
import DeliveryAgentModel, { IDeliveryAgent } from '@/models/DeliveryAgent'; // Import Mongoose model
import { Types } from 'mongoose'; // Import Types for ObjectId validation
// Assume DeliveryAgent interface is defined in lib/db.ts or models.ts
// If defined locally in lib/db.ts, we might need to redefine or import it carefully.
// For simplicity, let's assume it's accessible or redefine relevant parts.

// Interface for the POST request body
interface CreateAgentRequestBody {
  name: string;
  phone: string;
  vehicleType: 'Bike' | 'Car' | 'Scooter' | 'Other';
  isActive?: boolean;
}

// GET handler: Fetch all agents for the vendor using Mongoose
export async function GET(request: NextRequest) {
  try {
    await mongooseConnect(); // Ensure Mongoose connection

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload?._id || !Types.ObjectId.isValid(payload._id)) {
      return NextResponse.json({ message: 'Authentication failed: Invalid token or vendor ID' }, { status: 401 });
    }
    if (payload.role !== 'vendor') {
      return NextResponse.json({ message: 'Forbidden: Access restricted to vendors' }, { status: 403 });
    }

    const vendorId = payload._id;

    // Use Mongoose model to find agents
    const agents = await DeliveryAgentModel.find({ vendorId: new Types.ObjectId(vendorId) }).lean(); // Use .lean() for plain JS objects

    // Mongoose documents (even with .lean()) might still need ObjectId conversion for frontend if not handled there
    // const formattedAgents = agents.map(agent => ({
    //     ...agent,
    //     _id: agent._id.toString(),
    //     vendorId: agent.vendorId.toString()
    // }));
    // Returning lean objects might be sufficient

    return NextResponse.json(agents, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching delivery agents:', error);
     // Handle potential Mongoose CastError for invalid IDs if needed, though payload._id is checked
     if (error.name === 'CastError') {
       return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
     }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// POST handler: Create a new delivery agent using Mongoose
export async function POST(request: NextRequest) {
  try {
    await mongooseConnect(); // Ensure Mongoose connection

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

     if (!payload?._id || !Types.ObjectId.isValid(payload._id)) {
      return NextResponse.json({ message: 'Authentication failed: Invalid token or vendor ID' }, { status: 401 });
    }
    if (payload.role !== 'vendor') {
      return NextResponse.json({ message: 'Forbidden: Access restricted to vendors' }, { status: 403 });
    }

    const vendorId = payload._id;
    const body: CreateAgentRequestBody = await request.json();

    // Basic validation
    if (!body.name || !body.phone || !body.vehicleType) {
      return NextResponse.json({ message: 'Missing required fields (name, phone, vehicleType)' }, { status: 400 });
    }

    const agentData = {
      ...body,
      vendorId: new Types.ObjectId(vendorId), // Ensure vendorId is ObjectId for Mongoose
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    // Use Mongoose model to create the agent
    const newAgent = await DeliveryAgentModel.create(agentData);

    // Return the newly created agent's document (Mongoose handles _id)
    return NextResponse.json({
        message: 'Delivery agent created successfully',
        // agentId: newAgent._id.toString(), // Redundant if sending whole agent back
        agent: newAgent // Send back the created Mongoose document
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating delivery agent:', error);
     if (error instanceof SyntaxError) { // Handle JSON parsing error
       return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
     }
     // Handle Mongoose validation errors
     if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        return NextResponse.json({ message: 'Validation failed', errors: messages }, { status: 400 });
     }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 