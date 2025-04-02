import { CheckCircle, Clock, Package, Truck, X } from "lucide-react"

interface OrderStatusTrackerProps {
  status: "Pending" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled"
}

const OrderStatusTracker = ({ status }: OrderStatusTrackerProps) => {
  const statuses = [
    { key: "Pending", label: "Order Received", icon: Clock },
    { key: "Preparing", label: "Preparing", icon: Package },
    { key: "Out for Delivery", label: "Out for Delivery", icon: Truck },
    { key: "Delivered", label: "Delivered", icon: CheckCircle },
  ]

  // Find the index of the current status
  const currentIndex = statuses.findIndex((s) => s.key === status)

  // If the order is cancelled, show a special case
  if (status === "Cancelled") {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
        <p className="font-semibold flex items-center justify-center gap-2">
          <X className="h-5 w-5" />
          Order Cancelled
        </p>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-center">
        {statuses.map((s, index) => {
          const Icon = s.icon
          const isActive = index <= currentIndex
          const isCompleted = index < currentIndex

          return (
            <div key={s.key} className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <p className={`mt-2 text-xs text-center ${isActive ? "text-green-600 font-semibold" : "text-gray-500"}`}>
                {s.label}
              </p>

              {/* Connector line */}
              {index < statuses.length - 1 && (
                <div className="absolute top-5 left-10 w-full h-[2px] -z-10">
                  <div className={`h-full ${isCompleted ? "bg-green-500" : "bg-gray-200"}`}></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderStatusTracker

