import { type NextRequest, NextResponse } from "next/server"
import { getOrderById, updateOrderStatus } from "@/lib/db"

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const order = await getOrderById(params.id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const data = await request.json()

    if (!data.status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Validate status value
    const validStatuses = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"]
    if (!validStatuses.includes(data.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    const result = await updateOrderStatus(params.id, data.status)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, updated: result.modifiedCount > 0 })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}

