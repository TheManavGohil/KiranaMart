import { type NextRequest, NextResponse } from "next/server"
import { getProducts, createProduct, seedDummyData } from "@/lib/db"
import { getDb } from '@/lib/mongodb'
import { COLLECTIONS } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const products = await db
      .collection(COLLECTIONS.PRODUCTS)
      .find({ isAvailable: true })
      .toArray()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    const requiredFields = ["name", "description", "category", "price", "stock", "imageUrl", "vendorId"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const result = await createProduct(data)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

