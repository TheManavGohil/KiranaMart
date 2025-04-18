import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/db' // Import the database function

export async function GET() {
  try {
    // Fetch a limited number of products (e.g., 6 for featured)
    const products = await getProducts(6); 

    if (!products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 