import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createDeliveryAgent, getDeliveryAgentsByVendor } from '@/lib/db';
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

// GET handler: Fetch all agents for the vendor
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload?._id) {
      return NextResponse.json({ message: 'Authentication failed: Invalid token' }, { status: 401 });
    }
    if (payload.role !== 'vendor') {
      return NextResponse.json({ message: 'Forbidden: Access restricted to vendors' }, { status: 403 });
    }

    const vendorId = payload._id;
    const agents = await getDeliveryAgentsByVendor(vendorId);

    // Add _id string conversion if needed by frontend
    const formattedAgents = agents.map(agent => ({
        ...agent,
        _id: agent._id.toString(),
        vendorId: agent.vendorId.toString() // Ensure vendorId is also string if needed
    }));

    return NextResponse.json(formattedAgents, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching delivery agents:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// POST handler: Create a new delivery agent
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

     if (!payload?._id) {
      return NextResponse.json({ message: 'Authentication failed: Invalid token' }, { status: 401 });
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
      vendorId: vendorId, // Add vendorId from token payload
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    const result = await createDeliveryAgent(agentData);

    if (!result.insertedId) {
       throw new Error("Failed to create delivery agent in database.");
    }

    // Return the newly created agent's ID and data
    return NextResponse.json({
        message: 'Delivery agent created successfully',
        agentId: result.insertedId.toString(),
        agent: { ...agentData, _id: result.insertedId.toString() } // Send back created agent info
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating delivery agent:', error);
     if (error instanceof SyntaxError) { // Handle JSON parsing error
       return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
     }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 