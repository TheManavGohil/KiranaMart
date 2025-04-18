import { NextResponse } from 'next/server';
import { getProductCollection, getCategoryCollection } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET all categories with product counts
export async function GET(req: Request) {
  console.log('GET /api/vendor/inventory/categories endpoint called');
  try {
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
    console.log(`Fetching categories for vendor ID: ${vendorId}`);
    
    // Get collections
    const categoryCollection = await getCategoryCollection();
    const productCollection = await getProductCollection();
    
    // Get categories from database
    const categories = await categoryCollection.find({ 
      vendorId: vendorId.toString()
    }).toArray();
    
    // If no categories exist yet, return empty array
    if (categories.length === 0) {
      return NextResponse.json([]);
    }
    
    // Get product counts for each category
    const categoryIds = categories.map(c => c._id.toString());
    const productCounts = await productCollection.aggregate([
      { $match: { 
        vendorId: vendorId.toString(),
        categoryId: { $in: categoryIds }
      }},
      { $group: { _id: '$categoryId', count: { $sum: 1 } } }
    ]).toArray();
    
    // Create a map of category ID to count
    const countMap = productCounts.reduce((map, item) => {
      map[item._id] = item.count;
      return map;
    }, {});
    
    // Add product count to each category
    const categoriesWithCounts = categories.map(category => ({
      ...category,
      productCount: countMap[category._id.toString()] || 0
    }));
    
    console.log(`Found ${categories.length} categories`);
    return NextResponse.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: `Error fetching categories: ${error.message}` },
      { status: 500 }
    );
  }
}

// Create a new category
export async function POST(req: Request) {
  console.log('POST /api/vendor/inventory/categories endpoint called');
  try {
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
    console.log(`Creating category for vendor ID: ${vendorId}`);
    
    // Get data from request
    const categoryData = await req.json();
    
    // Validate required fields
    if (!categoryData.name) {
      console.log('Missing required fields');
      return NextResponse.json(
        { message: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Prepare category object
    const newCategory = {
      vendorId: vendorId.toString(),
      name: categoryData.name,
      color: categoryData.color || "text-blue-500",
      bgColor: categoryData.bgColor || "bg-blue-50",
      icon: categoryData.icon || "ShoppingBasket", // Store icon as string
      subcategories: categoryData.subcategories || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert category
    const categoryCollection = await getCategoryCollection();
    const result = await categoryCollection.insertOne(newCategory);
    
    console.log(`Category created with ID: ${result.insertedId}`);
    return NextResponse.json({
      ...newCategory,
      _id: result.insertedId,
      productCount: 0
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: `Error creating category: ${error.message}` },
      { status: 500 }
    );
  }
}

// Update a category by ID
export async function PUT(req: Request) {
  console.log('PUT /api/vendor/inventory/categories endpoint called');
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('id');
    
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
    console.log(`Updating category ID: ${categoryId} for vendor ID: ${vendorId}`);
    
    // Get data from request
    const updateData = await req.json();
    
    // Validate required fields
    if (!updateData) {
      console.log('Missing update data');
      return NextResponse.json({ message: 'Update data is required' }, { status: 400 });
    }
    
    // Prepare update object
    const updateFields: Record<string, any> = {};
    
    // Only include fields that were provided in the request
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.color !== undefined) updateFields.color = updateData.color;
    if (updateData.bgColor !== undefined) updateFields.bgColor = updateData.bgColor;
    if (updateData.icon !== undefined) updateFields.icon = updateData.icon;
    if (updateData.subcategories !== undefined) updateFields.subcategories = updateData.subcategories;
    
    // Add updated timestamp
    updateFields.updatedAt = new Date();
    
    // Update category
    const categoryCollection = await getCategoryCollection();
    const result = await categoryCollection.updateOne(
      { _id: new ObjectId(categoryId), vendorId: vendorId.toString() },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      console.log('Category not found or not authorized to update');
      return NextResponse.json(
        { message: 'Category not found or you do not have permission to update it' },
        { status: 404 }
      );
    }
    
    console.log(`Category updated successfully`);
    return NextResponse.json({ 
      message: 'Category updated successfully', 
      updated: result.modifiedCount > 0 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { message: `Error updating category: ${error.message}` },
      { status: 500 }
    );
  }
}

// Delete a category by ID
export async function DELETE(req: Request) {
  console.log('DELETE /api/vendor/inventory/categories endpoint called');
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('id');
    
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
    console.log(`Deleting category ID: ${categoryId} for vendor ID: ${vendorId}`);
    
    // Delete category
    const categoryCollection = await getCategoryCollection();
    const result = await categoryCollection.deleteOne({ 
      _id: new ObjectId(categoryId), 
      vendorId: vendorId.toString() 
    });
    
    if (result.deletedCount === 0) {
      console.log('Category not found or not authorized to delete');
      return NextResponse.json(
        { message: 'Category not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }
    
    console.log(`Category deleted successfully`);
    return NextResponse.json({ 
      message: 'Category deleted successfully', 
      deleted: true 
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { message: `Error deleting category: ${error.message}` },
      { status: 500 }
    );
  }
} 