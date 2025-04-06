import { NextResponse } from 'next/server';
import { getProductCollection } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET all products for this vendor
export async function GET(req: Request) {
  try {
    // Verify token from Authorization header
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'vendor') {
      return NextResponse.json({ message: 'Unauthorized: Not a vendor account' }, { status: 403 });
    }

    const vendorId = decoded._id;
    
    // Get products from database
    const collection = await getProductCollection();
    const products = await collection.find({ vendorId: vendorId.toString() }).toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { message: `Error fetching inventory: ${error.message}` },
      { status: 500 }
    );
  }
}

// Add a new product
export async function POST(req: Request) {
  try {
    // Verify token from Authorization header
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'vendor') {
      return NextResponse.json({ message: 'Unauthorized: Not a vendor account' }, { status: 403 });
    }

    const vendorId = decoded._id;
    const productData = await req.json();
    
    // Validate required fields
    if (!productData.name || !productData.category || !productData.price) {
      return NextResponse.json(
        { message: 'Missing required fields: name, category, and price are required' },
        { status: 400 }
      );
    }
    
    // Create new product object
    const newProduct = {
      ...productData,
      vendorId: vendorId.toString(),
      stock: productData.stock || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastRestocked: productData.stock > 0 ? new Date() : null
    };
    
    // Insert into database
    const collection = await getProductCollection();
    const result = await collection.insertOne(newProduct);
    
    return NextResponse.json({ 
      message: 'Product created successfully',
      productId: result.insertedId,
      product: {
        ...newProduct,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: `Error creating product: ${error.message}` },
      { status: 500 }
    );
  }
}

// Update product by ID
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('id');
    
    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Verify token from Authorization header
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'vendor') {
      return NextResponse.json({ message: 'Unauthorized: Not a vendor account' }, { status: 403 });
    }

    const vendorId = decoded._id;
    const updateData = await req.json();
    
    // Get collection and find product
    const collection = await getProductCollection();
    const existingProduct = await collection.findOne({ 
      _id: new ObjectId(productId),
      vendorId: vendorId.toString()
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found or you do not have permission to update it' },
        { status: 404 }
      );
    }
    
    // Check if this is a restock operation
    let isRestock = false;
    if (updateData.stock !== undefined && updateData.stock > existingProduct.stock) {
      isRestock = true;
    }
    
    // Update the product
    const result = await collection.updateOne(
      { _id: new ObjectId(productId), vendorId: vendorId.toString() },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date(),
          ...(isRestock ? { lastRestocked: new Date() } : {})
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Product not found or you do not have permission to update it' },
        { status: 404 }
      );
    }
    
    // Fetch the updated product
    const updatedProduct = await collection.findOne({ _id: new ObjectId(productId) });
    
    return NextResponse.json({
      message: 'Product updated successfully',
      updated: result.modifiedCount > 0,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: `Error updating product: ${error.message}` },
      { status: 500 }
    );
  }
} 