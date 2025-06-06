import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import User from "@/lib/models/User";

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    console.log('GET request - Token:', token);
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);
    
    if (!decoded || !decoded.email) {
      console.log('Invalid token or no email in token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findOne({ email: decoded.email });
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the user data with the correct structure
    const response = {
      name: user.name,
      email: user.email,
      phone: user.profile?.phone || '',
      address: user.profile?.address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
    };
    console.log('Sending response:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/customer/settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    console.log('PUT request - Token:', token);
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);
    
    if (!decoded || !decoded.email) {
      console.log('Invalid token or no email in token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Update data:', data);
    
    const { phone, address } = data;

    // Validate required fields
    if (!phone || !address) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate address fields
    const { street, city, state, pincode } = address;
    if (!street || !city || !state || !pincode) {
      console.log('Missing required address fields');
      return NextResponse.json(
        { error: 'Missing required address fields' },
        { status: 400 }
      );
    }

    console.log('Updating user with email:', decoded.email);
    console.log('Update data:', {
      'profile.phone': phone,
      'profile.address': {
        street,
        city,
        state,
        pincode,
      }
    });

    // First, find the user to check current state
    const existingUser = await User.findOne({ email: decoded.email });
    console.log('Existing user before update:', existingUser);

    // Update the user
    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      {
        $set: {
          'profile.phone': phone,
          'profile.address': {
            street,
            city,
            state,
            pincode,
          },
        },
      },
      { new: true, runValidators: true }
    );
    console.log('Updated user:', user);

    if (!user) {
      console.log('User not found after update');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the update
    const verifyUser = await User.findOne({ email: decoded.email });
    console.log('Verification - User after update:', verifyUser);

    const response = {
      name: user.name,
      email: user.email,
      phone: user.profile?.phone || '',
      address: user.profile?.address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
    };
    console.log('Sending response:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in PUT /api/customer/settings:', error);
    return NextResponse.json(
      { error: 'Failed to update customer settings' },
      { status: 500 }
    );
  }
} 