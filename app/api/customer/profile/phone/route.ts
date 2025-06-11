import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Authenticate Customer - try both NextAuth and JWT
    let customerId: string | null = null;
    
    // Try with NextAuth session first
    const session = await getServerSession();
    if (session?.user && 'id' in session.user) {
      customerId = session.user.id as string;
    } else {
      // If no NextAuth session, try JWT
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

    const { number, type = 'secondary' } = await request.json();

    if (!number) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Find the customer
    const customer = await db.collection(COLLECTIONS.CUSTOMERS).findOne({
      _id: customerObjectId
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Add new phone number
    const newPhone = {
      _id: new ObjectId(),
      number: number.trim(),
      type: type
    };

    const result = await db.collection(COLLECTIONS.CUSTOMERS).updateOne(
      { _id: customerObjectId },
      { 
        $push: { 
          phoneNumbers: newPhone as any
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to add phone number' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Phone number added successfully',
        phone: newPhone
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error adding phone number:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 