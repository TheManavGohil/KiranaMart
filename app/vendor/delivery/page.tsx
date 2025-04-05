"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, Filter, MapPin, UserCheck, Package, Truck, Phone, Clock, CheckCircle, XCircle, Bike, Car, MoreVertical } from "lucide-react"
import Link from "next/link"

// Mock Data - Replace with actual API calls later
const mockDeliveries = [
  {
    id: "del-001",
    orderId: "ord-1001",
    agent: { id: "agent-1", name: "John Doe", vehicle: "Bike", phone: "555-1111" },
    customer: { name: "Alice Smith", address: "123 Main St, Anytown" },
    status: "Out for Delivery",
    lastUpdate: "10:45 AM",
    estimatedDelivery: "11:30 AM",
    location: { lat: 34.0522, lon: -118.2437 } // Placeholder location
  },
  {
    id: "del-002",
    orderId: "ord-1003",
    agent: { id: "agent-2", name: "Jane Roe", vehicle: "Car", phone: "555-2222" },
    customer: { name: "Bob Johnson", address: "456 Oak Ave, Anytown" },
    status: "Assigned",
    lastUpdate: "9:15 AM",
    estimatedDelivery: "1:00 PM",
    location: { lat: 34.0522, lon: -118.2437 } 
  },
    {
    id: "del-003",
    orderId: "ord-1002",
    agent: { id: "agent-1", name: "John Doe", vehicle: "Bike", phone: "555-1111" },
    customer: { name: "Charlie Brown", address: "789 Pine Ln, Anytown" },
    status: "Delivered",
    lastUpdate: "Yesterday 3:30 PM",
    estimatedDelivery: "Yesterday 3:15 PM",
    location: { lat: 34.0522, lon: -118.2437 } 
  },
  {
    id: "del-004",
    orderId: "ord-1005",
    agent: { id: "agent-3", name: "Sam Wilson", vehicle: "Bike", phone: "555-3333" },
    customer: { name: "Diana Prince", address: "101 Maple Dr, Anytown" },
    status: "Attempted Delivery",
    lastUpdate: "11:15 AM",
    estimatedDelivery: "11:00 AM",
    location: { lat: 34.0522, lon: -118.2437 } 
  },
    {
    id: "del-005",
    orderId: "ord-1004",
    agent: { id: "agent-2", name: "Jane Roe", vehicle: "Car", phone: "555-2222" },
    customer: { name: "Peter Parker", address: "20 Ingram St, Forest Hills" },
    status: "Out for Delivery",
    lastUpdate: "11:30 AM",
    estimatedDelivery: "12:15 PM",
    location: { lat: 40.7128, lon: -74.0060 } // Different location
  },
]

const deliveryStatuses = ["All", "Assigned", "Out for Delivery", "Delivered", "Attempted Delivery", "Cancelled"]
const agents = ["All", "John Doe", "Jane Roe", "Sam Wilson"] // Example agents

export default function VendorDeliveryPage() {
  const [deliveries, setDeliveries] = useState(mockDeliveries)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [agentFilter, setAgentFilter] = useState("All")

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.agent.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All" || delivery.status === statusFilter
    const matchesAgent = agentFilter === "All" || delivery.agent.name === agentFilter

    return matchesSearch && matchesStatus && matchesAgent
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Assigned":
        return <UserCheck className="w-4 h-4 text-blue-500" />
      case "Out for Delivery":
        return <Truck className="w-4 h-4 text-purple-500" />
      case "Delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Attempted Delivery":
        return <Clock className="w-4 h-4 text-orange-500" />
       case "Cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Package className="w-4 h-4 text-gray-500" />
    }
  }
  
   const getStatusColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
      case "Out for Delivery":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
      case "Attempted Delivery":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
       case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getVehicleIcon = (vehicle: string) => {
    switch (vehicle.toLowerCase()) {
      case "bike":
        return <Bike className="w-4 h-4 inline-block mr-1" />
      case "car":
        return <Car className="w-4 h-4 inline-block mr-1" />
      default:
        return <Truck className="w-4 h-4 inline-block mr-1" />
    }
  }
  
  // Basic Map Placeholder Component
  const MapPlaceholder = ({ lat, lon }: { lat: number, lon: number }) => (
    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
      <MapPin className="w-8 h-8" />
      <span className="ml-2 text-sm">Map View (Lat: {lat.toFixed(2)}, Lon: {lon.toFixed(2)})</span>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          <span className="border-b-4 border-green-500 pb-1">Delivery Management</span>
        </h1>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md mb-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Delivery #, Order #, Customer, Agent..."
                className="form-input pl-10 w-full rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <div>
              <select
                className="form-input py-2 rounded-lg w-full md:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {deliveryStatuses.map((status) => (
                  <option key={status} value={status}>
                    Status: {status}
                  </option>
                ))}
              </select>
            </div>
             <div>
              <select
                className="form-input py-2 rounded-lg w-full md:w-auto"
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
              >
                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    Agent: {agent}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-secondary flex items-center justify-center px-4 py-2 rounded-lg">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Delivery List / Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDeliveries.map((delivery) => (
          <div key={delivery.id} className="card p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
            <div>
              <div className="flex justify-between items-center mb-3">
                <Link href={`#`} className="font-semibold text-lg text-green-600 dark:text-green-400 hover:underline">
                  {delivery.id}
                </Link>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)} flex items-center gap-1`}>
                  {getStatusIcon(delivery.status)}
                  {delivery.status}
                </span>
              </div>
              
              <div className="mb-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p><span className="font-medium text-gray-800 dark:text-gray-200">Order ID:</span> {delivery.orderId}</p>
                <p><span className="font-medium text-gray-800 dark:text-gray-200">Customer:</span> {delivery.customer.name}</p>
                <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400"/> {delivery.customer.address}
                </p>
                <p className="flex items-center">
                  <UserCheck className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400"/> 
                  Agent: {delivery.agent.name} ({getVehicleIcon(delivery.agent.vehicle)} {delivery.agent.vehicle}) 
                  <a href={`tel:${delivery.agent.phone}`} className="ml-2 text-blue-500 hover:underline"><Phone size={14}/></a>
                </p>
                <p className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400"/> 
                    ETA: {delivery.estimatedDelivery} (Last Update: {delivery.lastUpdate})
                </p>
              </div>
              
              {/* Map Placeholder */}
               {delivery.status === "Out for Delivery" && (
                 <div className="mb-4">
                   <MapPlaceholder lat={delivery.location.lat} lon={delivery.location.lon}/>
                 </div>
               )}

            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                {delivery.status === "Assigned" && (
                     <button className="btn-secondary text-xs px-3 py-1.5">Start Delivery</button>
                 )}
                 {delivery.status === "Out for Delivery" && (
                     <button className="btn-primary text-xs px-3 py-1.5">Mark Delivered</button>
                 )}
                 {delivery.status === "Attempted Delivery" && (
                     <button className="btn-secondary text-xs px-3 py-1.5">Re-attempt</button>
                 )}
                  <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                      <MoreVertical size={18} />
                  </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <Truck className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg font-medium">No deliveries found matching your criteria.</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* TODO: Add Pagination */}
    </div>
  )
} 