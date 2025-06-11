import { NextResponse } from 'next/server';
import { seedProducts } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { vendorId } = await request.json();
    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 });
    }

    const products = await seedProducts(vendorId);
    return NextResponse.json({ message: 'Database seeded successfully', products });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: (error as Error).message },
      { status: 500 }
    );
  }
} 