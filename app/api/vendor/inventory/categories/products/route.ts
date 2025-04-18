import { NextResponse } from 'next/server';
import { getProductCollection } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET products by category ID
export async function GET(req: Request) {
  console.log('GET /api/vendor/inventory/categories/products endpoint called');
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('categoryId');
    
    if (!categoryId) {
      console.log('Missing category ID');
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }
    
    // Verify token from Authorization header
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.log('Missing authorization token');
      return NextResponse.json({ message: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'vendor') {
      console.log('Unauthorized: Not a vendor account');
      return NextResponse.json({ message: 'Unauthorized: Not a vendor account' }, { status: 403 });
    }

    const vendorId = decoded._id;
    console.log(`Fetching products for category ID: ${categoryId}, vendor ID: ${vendorId}`);
    
    // Get products collection
    const productCollection = await getProductCollection();
    
    // Get products for this category and vendor
    const products = await productCollection.find({ 
      categoryId: categoryId,
      vendorId: vendorId.toString()
    }).toArray();
    
    console.log(`Found ${products.length} products for category ID: ${categoryId}`);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return NextResponse.json(
      { message: `Error fetching products: ${error.message}` },
      { status: 500 }
    );
  }
}

// Add a product to a specific category
export async function POST(req: Request) {
  console.log('POST /api/vendor/inventory/categories/products endpoint called');
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('categoryId');
    
    if (!categoryId) {
      console.log('Missing category ID');
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }
    
    // Verify token from Authorization header
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.log('Missing authorization token');
      return NextResponse.json({ message: 'Missing authorization token' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'vendor') {
      console.log('Unauthorized: Not a vendor account');
      return NextResponse.json({ message: 'Unauthorized: Not a vendor account' }, { status: 403 });
    }

    const vendorId = decoded._id;
    const productData = await req.json();
    
    // Validate required fields
    if (!productData.name || !productData.price) {
      console.log('Missing required fields');
      return NextResponse.json(
        { message: 'Missing required fields: name and price are required' },
        { status: 400 }
      );
    }
    
    // Create product with category ID
    const newProduct = {
      ...productData,
      categoryId: categoryId,
      vendorId: vendorId.toString(),
      stock: productData.stock || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastRestocked: productData.stock > 0 ? new Date() : null
    };
    
    // Insert into database
    const productCollection = await getProductCollection();
    const result = await productCollection.insertOne(newProduct);
    
    console.log(`Product created with ID: ${result.insertedId} for category ID: ${categoryId}`);
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