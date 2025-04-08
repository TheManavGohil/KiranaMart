import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const categories = await db
      .collection(COLLECTIONS.CATEGORIES)
      .find({})
      .toArray();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 