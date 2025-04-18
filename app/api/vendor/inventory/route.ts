import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import mongooseConnect from '@/lib/mongooseConnect';
// Import db functions using Mongoose models
import {
    getProductsByVendor,
    createProduct,
    updateProduct,
    deleteProduct // Assuming you might want delete later
} from '@/lib/db';
import mongoose from 'mongoose';

// GET all products for the logged-in vendor
export async function GET(request: NextRequest) {
    await mongooseConnect();
    const tokenPayload = verifyToken(request.headers.get('Authorization')?.split(' ')[1]);

    if (!tokenPayload || tokenPayload.role !== 'vendor') {
        return NextResponse.json({ message: 'Unauthorized or Invalid Role' }, { status: 401 });
    }

    try {
        const products = await getProductsByVendor(tokenPayload._id);
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching vendor inventory:", error);
        return NextResponse.json({ message: 'Failed to fetch inventory', error: (error as Error).message }, { status: 500 });
    }
}

// POST - Add a new product for the logged-in vendor
export async function POST(request: NextRequest) {
    await mongooseConnect();
    const tokenPayload = verifyToken(request.headers.get('Authorization')?.split(' ')[1]);

    if (!tokenPayload || tokenPayload.role !== 'vendor') {
        return NextResponse.json({ message: 'Unauthorized or Invalid Role' }, { status: 401 });
    }

    try {
        const productData = await request.json();

        // Basic validation (can add more using Zod if desired)
        if (!productData.name || !productData.category || productData.price == null || !productData.unit) {
            return NextResponse.json({ message: 'Missing required fields: name, category, price, unit' }, { status: 400 });
        }

        // Prepare data, ensuring vendorId is set correctly
        const dataToSave = {
            ...productData,
            vendorId: tokenPayload._id, // Use the ObjectId from token
            stock: productData.stock ?? 0, // Default stock to 0 if not provided
            // Dates should be handled correctly if sent from frontend
        };

        const newProduct = await createProduct(dataToSave);
        return NextResponse.json({ message: 'Product created successfully', product: newProduct }, { status: 201 });

    } catch (error) {
        console.error("Error creating product:", error);
        // Forward specific validation errors if db function throws them
        return NextResponse.json({ message: 'Failed to create product', error: (error as Error).message }, { status: 500 });
    }
}

// PUT - Update a product for the logged-in vendor
export async function PUT(request: NextRequest) {
    await mongooseConnect();
    const tokenPayload = verifyToken(request.headers.get('Authorization')?.split(' ')[1]);

    if (!tokenPayload || tokenPayload.role !== 'vendor') {
        return NextResponse.json({ message: 'Unauthorized or Invalid Role' }, { status: 401 });
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get('id');

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return NextResponse.json({ message: 'Valid Product ID is required as query parameter' }, { status: 400 });
    }

    try {
        const updateData = await request.json();
        
        // Remove fields that shouldn't be directly updated this way
        delete updateData._id; 
        delete updateData.vendorId;
        delete updateData.createdAt;
        delete updateData.updatedAt; // Let Mongoose handle updatedAt

        // Call the update function from db.ts
        // Note: updateProduct in db.ts might need adjustment if it doesn't
        // explicitly handle vendor ownership check, or we do it here.
        
        // We need to ensure the vendor owns the product before updating.
        // Let's assume updateProduct in db.ts handles this or fetch first.
        // For safety, let's modify updateProduct call slightly or add check:
        
        const updatedProduct = await updateProduct(productId, updateData);

        // Check if product was found and updated (updateProduct should ideally throw if not found/authorized)
        if (!updatedProduct) {
             return NextResponse.json({ message: 'Product not found or update failed' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Product updated successfully', product: updatedProduct });

    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ message: 'Failed to update product', error: (error as Error).message }, { status: 500 });
    }
}

// Optional: Add DELETE handler if needed
// export async function DELETE(request: NextRequest) { ... } 