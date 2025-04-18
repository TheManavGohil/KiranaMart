import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '@/lib/auth';

// Configure Cloudinary (ensure these are in your .env.local)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, 
});

interface UploadRequestBody {
    imageData: string; // Expecting base64 data URL string
}

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate Vendor (ensure user is a vendor)
        const tokenCookie = request.cookies.get('token');
        const token = tokenCookie?.value;
        if (!token) {
            return NextResponse.json({ message: 'Authentication token missing' }, { status: 401 });
        }

        let payload: any;
        try {
            payload = verifyToken(token);
            // IMPORTANT: Adjust role check if needed (e.g., allow admins too?)
            if (!payload?._id || payload.role !== 'vendor') { 
                throw new Error('Invalid token or unauthorized role');
            }
        } catch (error) {
            console.error("Token verification failed:", error);
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        }

        // 2. Get Image Data from Request Body
        const body: UploadRequestBody = await request.json();
        const imageData = body.imageData;

        if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image')) {
            return NextResponse.json({ message: 'Invalid or missing image data provided' }, { status: 400 });
        }

        // 3. Upload to Cloudinary
        console.log(`Uploading product image for vendor: ${payload._id}...`);
        const uploadResult = await cloudinary.uploader.upload(imageData, {
            folder: 'product_images', // Use a dedicated folder for product images
            // Let Cloudinary generate a unique public_id for products
            // public_id: -> Omit this so Cloudinary generates one
            overwrite: false, // Don't overwrite by default for product images
            // Optional: Add transformations if needed (e.g., resize, format)
            // transformation: [
            //     { width: 800, height: 800, crop: "limit" }, 
            //     { quality: "auto", fetch_format: "auto" }
            // ]
        });
        console.log(`Cloudinary product image upload successful: ${uploadResult.secure_url}`);

        // 4. Return ONLY the secure URL
        // We do NOT save it to the product here; that happens when the product form is submitted.
        return NextResponse.json({ secure_url: uploadResult.secure_url }, { status: 200 });

    } catch (error: any) {
        console.error('[API POST /products/upload-image] Error:', error);
        
        if (error.http_code) { // Cloudinary error
             return NextResponse.json({ message: `Cloudinary error: ${error.message}` }, { status: error.http_code || 500 });
        }
        if (error instanceof SyntaxError) { // Invalid JSON body
             return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
        }
        // General server error
        return NextResponse.json({ message: 'Internal server error during image upload', error: error.message }, { status: 500 });
    }
} 