import { NextResponse } from 'next/server';
import { getProductCollection } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET a specific product by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    
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
    
    // Get product from database
    const collection = await getProductCollection();
    const product = await collection.findOne({ 
      _id: new ObjectId(productId),
      vendorId: vendorId.toString()  // Only fetch if belongs to this vendor
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found or you do not have permission to view it' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: `Error fetching product: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE a product by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    
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
    
    // Delete product from database
    const collection = await getProductCollection();
    const result = await collection.deleteOne({ 
      _id: new ObjectId(productId),
      vendorId: vendorId.toString()  // Only delete if belongs to this vendor
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Product not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Product deleted successfully',
      deleted: true
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: `Error deleting product: ${error.message}` },
      { status: 500 }
    );
  }
} 