import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getOrdersByVendor, updateOrderStatus } from '@/lib/db'; // Use functions from lib/db.ts
import { ObjectId } from 'mongodb'; // Import ObjectId

// Define the structure of the order data expected in the PUT request
interface UpdateOrderStatusRequest {
  newStatus: string;
}

// GET handler to fetch orders for the authenticated vendor
export async function GET(request: NextRequest) {
  try {
    // 1. Get token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication required: Missing or invalid Authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const payload = verifyToken(token); // Use verifyToken
    if (!payload || !payload._id) {
      // verifyToken returns null on failure, or payload might lack _id
      return NextResponse.json({ message: 'Authentication failed: Invalid token or missing user ID (_id)' }, { status: 401 });
    }

    // 3. Check role (as before)
    if (payload.role !== 'vendor') {
      return NextResponse.json({ message: 'Forbidden: Access restricted to vendors' }, { status: 403 });
    }

    const vendorId = payload._id;

    // Fetch orders using the existing function from lib/db.ts
    const ordersFromDb = await getOrdersByVendor(vendorId);

    // Format the orders for the frontend
    const formattedOrders = ordersFromDb.map((order: any) => ({ // Add 'any' type temporarily if Order type isn't perfect match
      _id: order._id.toString(),
      id: order.orderId || `ord-${order._id.toString().slice(-4)}`, // Use orderId if present, fallback to derived ID
      customer: order.customerName || 'Unknown Customer', // Use customerName if present
      date: (order.orderDate || order.createdAt || new Date()).toISOString().split('T')[0], // Use orderDate or createdAt
      items: order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0, // Safely calculate total items
      total: (order.totalAmount || 0).toFixed(2),
      status: order.status || 'Unknown',
    }));

    return NextResponse.json(formattedOrders, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching vendor orders:', error);
    // Simplify error handling, specific auth errors are handled above
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// PUT handler to update the status of an order
export async function PUT(request: NextRequest) {
  try {
    // 1. Get token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication required: Missing or invalid Authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const payload = verifyToken(token); // Use verifyToken
    if (!payload || !payload._id) {
      return NextResponse.json({ message: 'Authentication failed: Invalid token or missing user ID (_id)' }, { status: 401 });
    }

    // 3. Check role (as before)
    if (payload.role !== 'vendor') {
      return NextResponse.json({ message: 'Forbidden: Access restricted to vendors' }, { status: 403 });
    }

    const vendorId = payload._id;

    // Get the MongoDB _id from query parameters
    const { searchParams } = new URL(request.url);
    const orderMongoId = searchParams.get('mongoId'); // Expecting the MongoDB _id

    if (!orderMongoId || !ObjectId.isValid(orderMongoId)) {
      return NextResponse.json({ message: 'Valid Order MongoDB ID (_id) is required in query parameters' }, { status: 400 });
    }

    // Get the new status from the request body
    const { newStatus }: UpdateOrderStatusRequest = await request.json();

    if (!newStatus) {
      return NextResponse.json({ message: 'New status is required in the request body' }, { status: 400 });
    }

    // Validate the new status against allowed values
    const allowedStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(newStatus)) {
      return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
    }

    // Use a function (to be added in lib/db.ts) to update the status
    // This function should verify vendor ownership internally
    const result = await updateOrderStatus(orderMongoId, newStatus, vendorId);

    if (!result || result.modifiedCount === 0) {
        // Check if the order was not found or didn't belong to the vendor
        // getOrderById might be useful here to check existence vs ownership
        return NextResponse.json({ message: 'Order not found, status not updated, or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order status updated successfully', order: { _id: orderMongoId, status: newStatus } }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating order status:', error);
    // Simplify error handling
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
