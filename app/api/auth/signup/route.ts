import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise, { getDb, getVendorCollection, getCustomerCollection, COLLECTIONS, DB_NAME } from '@/lib/mongodb';

export async function POST(req: Request) {
  console.log('Signup API route called');
  try {
    const { name, email, password, role } = await req.json();
    const cleanedEmail = email.trim().toLowerCase();
    
    console.log(`Signup attempt for: ${cleanedEmail}, role: ${role}`);

    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log('Signup failed: Missing required fields');
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'vendor' && role !== 'customer') {
      console.log(`Signup failed: Invalid role "${role}"`);
      return NextResponse.json(
        { message: 'Invalid role. Must be either "vendor" or "customer"' },
        { status: 400 }
      );
    }

    try {
      // Connect to the database
      console.log('Connecting to MongoDB...');
      const db = await getDb();
      
      // Choose collection based on role
      let collection;
      let userData;
      
      // Check if email already exists in either collection
      const vendorWithEmail = await db.collection(COLLECTIONS.VENDORS).findOne({ email: cleanedEmail });
      const customerWithEmail = await db.collection(COLLECTIONS.CUSTOMERS).findOne({ email: cleanedEmail });
      
      if (vendorWithEmail || customerWithEmail) {
        console.log(`Signup failed: Email ${cleanedEmail} already exists`);
        return NextResponse.json(
          { message: 'Email already exists' },
          { status: 409 }
        );
      }

      // Hash the password
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user data with role-specific fields
      if (role === 'vendor') {
        collection = await getVendorCollection();
        userData = {
          name,
          email: cleanedEmail,
          password: hashedPassword,
          storeInfo: {
            storeName: "", // To be filled later
            address: "",   // To be filled later
            phone: "",     // To be filled later
            categories: [] // Categories this vendor carries
          },
          isApproved: false, // Vendors might need approval
          analytics: {
            totalSales: 0,
            totalOrders: 0,
            totalProducts: 0
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else {
        collection = await getCustomerCollection();
        userData = {
          name,
          email: cleanedEmail,
          password: hashedPassword,
          profile: {
            address: "", // To be filled later
            phone: "",   // To be filled later
            preferences: [] // Customer preferences
          },
          orderHistory: [], // Will contain order IDs
          cart: [],         // Current cart items
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Insert the user into the appropriate collection
      console.log(`Inserting ${role} into database...`);
      const result = await collection.insertOne(userData);
      console.log(`${role} created with ID: ${result.insertedId}`);

      // Create a JWT token (exclude password from the token payload)
      const { password: _, ...userWithoutPassword } = userData;
      const secret = process.env.JWT_SECRET;
      
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      
      console.log('Generating JWT token...');
      const token = jwt.sign(
        { 
          _id: result.insertedId, 
          role, // Include role in the token
          ...userWithoutPassword 
        },
        secret,
        { expiresIn: '7d' }
      );

      console.log('Signup successful');
      return NextResponse.json({ 
        message: 'User created successfully',
        token, 
        user: {
          _id: result.insertedId,
          name,
          email: cleanedEmail,
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
    console.error('Error in signup route:', error);
    return NextResponse.json(
      { message: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 