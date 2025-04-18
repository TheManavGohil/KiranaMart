import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use https
});

interface UploadRequestBody {
  imageData: string; // Expecting base64 data URL string
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Customer - try both NextAuth and JWT
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
        return NextResponse.json({ message: 'Authentication token missing' }, { status: 401 });
      }

      try {
        const payload = verifyToken(token);
        if (!payload?._id || payload.role !== 'customer') {
          throw new Error('Invalid token or role');
        }
        customerId = payload._id;
      } catch (error) {
        return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
      }
    }

    if (!customerId) {
      return NextResponse.json({ message: 'Customer ID not found' }, { status: 401 });
    }

    let customerObjectId: ObjectId;
    try {
      customerObjectId = new ObjectId(customerId);
    } catch {
      return NextResponse.json({ message: 'Invalid Customer ID format' }, { status: 400 });
    }

    // 2. Get Image Data from Request Body
    const body: UploadRequestBody = await request.json();
    const imageData = body.imageData;

    if (!imageData || !imageData.startsWith('data:image')) {
      return NextResponse.json({ message: 'Invalid image data provided' }, { status: 400 });
    }

    // 3. Upload to Cloudinary
    console.log(`Uploading avatar for customer: ${customerId}...`);
    const uploadResult = await cloudinary.uploader.upload(imageData, {
      folder: 'customer_avatars', // Organize uploads in a folder
      public_id: customerId, // Use customerId as public_id to overwrite previous avatar
      overwrite: true,
      transformation: [ // Optional: Add transformations for consistency
        { width: 200, height: 200, crop: "fill", gravity: "face" },
      ]
    });
    console.log(`Cloudinary upload successful: ${uploadResult.secure_url}`);

    const avatarUrl = uploadResult.secure_url;

    // 4. Update Customer in DB
    const db = await getDb();
    const updateResult = await db.collection(COLLECTIONS.CUSTOMERS).updateOne(
      { _id: customerObjectId },
      { $set: { avatar: avatarUrl, updatedAt: new Date() } }
    );

    if (updateResult.matchedCount === 0) {
      console.error(`Customer not found during avatar URL update: ${customerId}`);
      return NextResponse.json({ message: 'Customer profile not found for update' }, { status: 404 });
    }

    // 5. Return Success Response with new URL
    return NextResponse.json({ message: 'Avatar uploaded successfully', avatarUrl: avatarUrl }, { status: 200 });

  } catch (error: any) {
    console.error('[API POST /customer/avatar/upload] Error:', error);
    // Check for specific Cloudinary errors
    if (error.http_code) {
      return NextResponse.json({ message: `Cloudinary error: ${error.message}` }, { status: error.http_code || 500 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 