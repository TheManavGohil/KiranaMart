import { NextResponse } from 'next/server';
import { getVendorCollection, getProductCollection, getOrderCollection, COLLECTIONS } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

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
    
    // Get vendor from database
    const vendorCollection = await getVendorCollection();
    const vendor = await vendorCollection.findOne({ _id: new ObjectId(vendorId) });

    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    // Get products for this vendor
    const productCollection = await getProductCollection();
    const products = await productCollection.find({ vendorId: vendorId.toString() }).toArray();
    
    // Get orders for this vendor
    const orderCollection = await getOrderCollection();
    const orders = await orderCollection.find({ 
      "items.vendorId": vendorId.toString() 
    }).toArray();

    // Calculate dashboard statistics
    const totalProducts = products.length;
    
    // For revenue, sum up all order items that belong to this vendor
    let totalRevenue = 0;
    let orderCount = 0;
    const orderSet = new Set();
    const customerSet = new Set();
    
    for (const order of orders) {
      orderSet.add(order._id.toString());
      if (order.customerId) customerSet.add(order.customerId);
      
      // Only count items from this vendor
      for (const item of order.items) {
        if (item.vendorId === vendorId.toString()) {
          totalRevenue += (item.price * item.quantity);
        }
      }
    }
    
    orderCount = orderSet.size;
    const customerCount = customerSet.size;
    
    // Get sales data for chart (last 6 months)
    const salesData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      // Calculate sales for this month
      let monthlySales = 0;
      for (const order of orders) {
        const orderDate = new Date(order.createdAt);
        if (orderDate >= month && orderDate <= monthEnd) {
          for (const item of order.items) {
            if (item.vendorId === vendorId.toString()) {
              monthlySales += (item.price * item.quantity);
            }
          }
        }
      }
      
      salesData.push({
        name: monthNames[month.getMonth()],
        sales: monthlySales
      });
    }
    
    // Get recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(order => ({
        id: order._id.toString(),
        customer: order.customerName || 'Customer',
        date: new Date(order.createdAt).toISOString().split('T')[0],
        total: order.items
          .filter(item => item.vendorId === vendorId.toString())
          .reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: order.status
      }));
    
    // Get low stock products (5 or fewer)
    const lowStockProducts = products
      .filter(product => product.stock <= 5)
      .slice(0, 3)
      .map(product => ({
        id: product._id.toString(),
        name: product.name,
        stock: product.stock
      }));
    
    // Prepare response data
    const dashboardData = {
      stats: {
        revenue: totalRevenue,
        orders: orderCount,
        customers: customerCount,
        products: totalProducts,
        salesData
      },
      recentOrders,
      lowStockProducts
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: `Error fetching dashboard data: ${error.message}` },
      { status: 500 }
    );
  }
} 