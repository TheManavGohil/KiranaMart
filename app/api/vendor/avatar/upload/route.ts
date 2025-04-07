import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/lib/mongodb'; // Using native driver helpers
import { ObjectId } from 'mongodb';

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
        // 1. Authenticate Vendor
        const tokenCookie = request.cookies.get('token');
        const token = tokenCookie?.value;
        if (!token) return NextResponse.json({ message: 'Authentication token missing' }, { status: 401 });

        let payload: any;
        try {
            payload = verifyToken(token);
            if (!payload?._id || payload.role !== 'vendor') {
                throw new Error('Invalid token or role');
            }
        } catch (error) {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        }

        const vendorId = payload._id;
        let vendorObjectId: ObjectId;
        try {
            vendorObjectId = new ObjectId(vendorId);
        } catch {
            return NextResponse.json({ message: 'Invalid Vendor ID format' }, { status: 400 });
        }

        // 2. Get Image Data from Request Body
        const body: UploadRequestBody = await request.json();
        const imageData = body.imageData;

        if (!imageData || !imageData.startsWith('data:image')) {
            return NextResponse.json({ message: 'Invalid image data provided' }, { status: 400 });
        }

        // 3. Upload to Cloudinary
        console.log(`Uploading avatar for vendor: ${vendorId}...`);
        const uploadResult = await cloudinary.uploader.upload(imageData, {
            folder: 'vendor_avatars', // Optional: Organize uploads in a folder
            public_id: vendorId, // Use vendorId as public_id to overwrite previous avatar
            overwrite: true,
            transformation: [ // Optional: Add transformations for consistency
                { width: 200, height: 200, crop: "fill", gravity: "face" },
            ]
            // Add more options like resource_type: 'image' if needed
        });
        console.log(`Cloudinary upload successful: ${uploadResult.secure_url}`);

        const avatarUrl = uploadResult.secure_url;

        // 4. Update Vendor in DB
        const db = await getDb();
        const updateResult = await db.collection(COLLECTIONS.VENDORS).updateOne(
            { _id: vendorObjectId },
            { $set: { avatarUrl: avatarUrl, updatedAt: new Date() } }
        );

        if (updateResult.matchedCount === 0) {
            // This shouldn't happen if authentication passed, but handle defensively
            console.error(`Vendor not found during avatar URL update: ${vendorId}`);
            return NextResponse.json({ message: 'Vendor profile not found for update' }, { status: 404 });
        }

        // 5. Return Success Response with new URL
        return NextResponse.json({ message: 'Avatar uploaded successfully', avatarUrl: avatarUrl }, { status: 200 });

    } catch (error: any) {
        console.error('[API POST /vendor/avatar/upload] Error:', error);
        // Check for specific Cloudinary errors if needed
        if (error.http_code) { // Basic check for Cloudinary error structure
             return NextResponse.json({ message: `Cloudinary error: ${error.message}` }, { status: error.http_code || 500 });
        }
         if (error instanceof SyntaxError) {
             return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
} 