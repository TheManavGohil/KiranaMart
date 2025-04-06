import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise, { getDb, getVendorCollection, getCustomerCollection, COLLECTIONS } from '@/lib/mongodb';

export async function POST(req: Request) {
  console.log('Signin API route called');
  
  try {
    const { email, password, role } = await req.json();
    const cleanedEmail = email?.trim().toLowerCase();
    
    console.log(`Signin attempt for: ${cleanedEmail}, role: ${role}`);

    // Validate required fields
    if (!email || !password || !role) {
      console.log('Signin failed: Missing required fields');
      return NextResponse.json(
        { message: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'vendor' && role !== 'customer') {
      console.log(`Signin failed: Invalid role "${role}"`);
      return NextResponse.json(
        { message: 'Invalid role. Must be either "vendor" or "customer"' },
        { status: 400 }
      );
    }

    try {
      // Connect to the database
      console.log('Connecting to MongoDB...');
      const db = await getDb();
      
      // Select the appropriate collection based on role
      const collection = role === 'vendor' 
        ? await getVendorCollection()
        : await getCustomerCollection();
      
      // Find the user by email in the appropriate collection
      console.log(`Looking for ${role} with email: ${cleanedEmail}`);
      const user = await collection.findOne({ email: cleanedEmail });
      
      if (!user) {
        console.log(`Signin failed: No ${role} found with email ${cleanedEmail}`);
        return NextResponse.json(
          { message: `Invalid credentials for ${role}` },
          { status: 401 }
        );
      }

      // Compare passwords
      console.log('Comparing passwords...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        console.log('Signin failed: Invalid password');
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Create a JWT token (exclude password from the token payload)
      const { password: _, ...userWithoutPassword } = user;
      const secret = process.env.JWT_SECRET;
      
      if (!secret) {
        console.log('JWT_SECRET not found in environment variables');
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      
      console.log('Generating JWT token...');
      const token = jwt.sign(
        { 
          _id: user._id,
          role, // Include role in the token 
          ...userWithoutPassword
        },
        secret,
        { expiresIn: '7d' }
      );

      console.log('Signin successful');
      return NextResponse.json({ 
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role,
          ...userWithoutPassword
        }
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { message: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in signin route:', error);
    return NextResponse.json(
      { message: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 