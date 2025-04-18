import { type NextRequest, NextResponse } from "next/server"
import { getProducts, createProduct } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const skipParam = url.searchParams.get('skip')
    const categoryParam = url.searchParams.get('category')

    const limit = limitParam ? parseInt(limitParam, 10) : 20
    const skip = skipParam ? parseInt(skipParam, 10) : 0
    
    const products = await getProducts(limit, skip, categoryParam || undefined)

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products", details: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const requiredFields = ["name", "description", "category", "price", "stock", "imageUrl", "vendorId", "unit"]
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        if (field === 'stock' && data[field] === 0) continue
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const newProduct = await createProduct(data)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product", details: (error as Error).message }, { status: 500 })
  }
}

