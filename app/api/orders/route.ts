import { type NextRequest, NextResponse } from "next/server"
import { getOrders, createOrder } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    const orders = await getOrders(limit, skip)
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    const requiredFields = ["userId", "vendorId", "products", "totalAmount"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Validate products array
    if (!Array.isArray(data.products) || data.products.length === 0) {
      return NextResponse.json({ error: "Products must be a non-empty array" }, { status: 400 })
    }

    const result = await createOrder(data)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

