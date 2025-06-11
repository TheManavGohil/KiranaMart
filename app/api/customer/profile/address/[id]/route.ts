import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate Customer
    let customerId: string | null = null;
    
    const session = await getServerSession();
    if (session?.user && 'id' in session.user) {
      customerId = session.user.id as string;
    } else {
      const tokenCookie = request.cookies.get('token');
      const token = tokenCookie?.value;
      if (!token) {
        return NextResponse.json({ error: 'Authentication token missing' }, { status: 401 });
      }

      try {
        const payload = verifyToken(token);
        if (!payload?._id || payload.role !== 'customer') {
          throw new Error('Invalid token or role');
        }
        customerId = payload._id;
      } catch (error) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID not found' }, { status: 401 });
    }

    let customerObjectId: ObjectId;
    try {
      customerObjectId = new ObjectId(customerId);
    } catch {
      return NextResponse.json({ error: 'Invalid Customer ID format' }, { status: 400 });
    }

    const addressId = params.id;

    if (!addressId || !ObjectId.isValid(addressId)) {
      return NextResponse.json(
        { error: 'Invalid address ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Remove the address
    const result = await db.collection(COLLECTIONS.CUSTOMERS).updateOne(
      { _id: customerObjectId },
      { 
        $pull: { 
          addresses: { _id: new ObjectId(addressId) } as any
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Address not found or failed to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Address deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 