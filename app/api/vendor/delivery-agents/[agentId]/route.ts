import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { updateDeliveryAgent, deleteDeliveryAgent } from '@/lib/db';
import { ObjectId } from 'mongodb';
// Assume DeliveryAgent interface is accessible

// Interface for the PUT request body
interface UpdateAgentRequestBody {
  name?: string;
  phone?: string;
  vehicleType?: 'Bike' | 'Car' | 'Scooter' | 'Other';
  isActive?: boolean;
}


// PUT handler: Update a specific delivery agent
export async function PUT(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const agentId = params.agentId;

  try {
     // Authentication & Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?._id) return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
    if (payload.role !== 'vendor') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const vendorId = payload._id;

    // Validate agentId
    if (!agentId || !ObjectId.isValid(agentId)) {
         return NextResponse.json({ message: 'Invalid Agent ID provided' }, { status: 400 });
    }

    const updates: UpdateAgentRequestBody = await request.json();

    // Basic validation for updates
     if (Object.keys(updates).length === 0) {
       return NextResponse.json({ message: 'No update fields provided' }, { status: 400 });
     }
     // Add more specific validation if needed (e.g., phone format)


    const result = await updateDeliveryAgent(agentId, vendorId, updates);

    if (result.matchedCount === 0) {
       return NextResponse.json({ message: 'Agent not found or access denied' }, { status: 404 });
    }
     if (result.modifiedCount === 0 && result.matchedCount > 0) {
        // Matched but didn't change (e.g., same data sent)
        return NextResponse.json({ message: 'Agent data unchanged', agentId: agentId }, { status: 200 });
    }


    return NextResponse.json({ message: 'Delivery agent updated successfully', agentId: agentId }, { status: 200 });

  } catch (error: any) {
    console.error(`Error updating delivery agent ${agentId}:`, error);
     if (error instanceof SyntaxError) {
       return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
     }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}


// DELETE handler: Delete a specific delivery agent
export async function DELETE(
  request: NextRequest, // request object might not be strictly needed but good practice to include
  { params }: { params: { agentId: string } }
) {
    const agentId = params.agentId;

  try {
    // Authentication & Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?._id) return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
    if (payload.role !== 'vendor') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const vendorId = payload._id;

     // Validate agentId
    if (!agentId || !ObjectId.isValid(agentId)) {
         return NextResponse.json({ message: 'Invalid Agent ID provided' }, { status: 400 });
    }

    const result = await deleteDeliveryAgent(agentId, vendorId);

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Agent not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Delivery agent deleted successfully' }, { status: 200 });

  } catch (error: any) {
    console.error(`Error deleting delivery agent ${agentId}:`, error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 