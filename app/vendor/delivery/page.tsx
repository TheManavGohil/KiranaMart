"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Search, Filter, MapPin, UserCheck, Package, Truck, Phone, Clock, CheckCircle, XCircle, Bike, Car, MoreVertical, Loader2, AlertCircle, UserCog, Eye, EyeOff,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { apiCall } from '@/lib/api'
import { toast } from "sonner"

// --- Interfaces for Frontend Data ---
interface DeliveryAgentInfo {
  id: string
  name: string
  vehicle: 'Bike' | 'Car' | 'Scooter' | 'Other'
  phone: string
}

interface CustomerInfo {
  name: string
  address: string
  phone?: string
}

// Main Delivery type for the frontend state
interface Delivery {
  _id: string // MongoDB ObjectId
  deliveryId: string // User-friendly ID
  orderId: string
  customer: CustomerInfo
  agent: DeliveryAgentInfo | null // Agent can be unassigned
  status: 'Pending Assignment' | 'Assigned' | 'Out for Delivery' | 'Delivered' | 'Attempted Delivery' | 'Cancelled' | 'Delayed'
  lastUpdate: string // Formatted date/time string
  estimatedDelivery: string // Formatted date/time string
  actualDelivery?: string // Optional formatted date/time string
  location?: { lat: number; lon: number } | null
  orderValue?: number
  packageSize?: 'Small' | 'Medium' | 'Large'
}

// Type for available agents list (for assignment dropdown)
interface AvailableAgent {
  _id: string
  name: string
}

// --- MOCK DATA ---
const MOCK_AGENTS: DeliveryAgentInfo[] = [
    { id: "agent-mock-1", name: "Mock John Doe", vehicle: "Bike", phone: "555-0101" },
    { id: "agent-mock-2", name: "Mock Jane Roe", vehicle: "Car", phone: "555-0102" },
    { id: "agent-mock-3", name: "Mock Sam Wilson", vehicle: "Scooter", phone: "555-0103" },
];

const MOCK_AVAILABLE_AGENTS: AvailableAgent[] = MOCK_AGENTS.map(a => ({ _id: a.id, name: a.name }));

const MOCK_DELIVERIES: Delivery[] = [
  {
    _id: "mock-60f1b3b3b3b3b3b3b3b3b3b1",
    deliveryId: "DEL-MOCK-001",
    orderId: "ORD-MOCK-101",
    customer: { name: "Alice Mock", address: "1 Mockingbird Lane", phone: "555-1234" },
    agent: MOCK_AGENTS[0],
    status: "Out for Delivery",
    lastUpdate: "10:45 AM Today",
    estimatedDelivery: "11:30 AM Today",
    location: { lat: 34.05, lon: -118.24 },
    orderValue: 150.75,
    packageSize: 'Medium',
  },
  {
    _id: "mock-60f1b3b3b3b3b3b3b3b3b3b2",
    deliveryId: "DEL-MOCK-002",
    orderId: "ORD-MOCK-102",
    customer: { name: "Bob Sample", address: "45 Sample Street" },
    agent: MOCK_AGENTS[1],
    status: "Assigned",
    lastUpdate: "9:15 AM Today",
    estimatedDelivery: "1:00 PM Today",
    packageSize: 'Small',
  },
  {
    _id: "mock-60f1b3b3b3b3b3b3b3b3b3b3",
    deliveryId: "DEL-MOCK-003",
    orderId: "ORD-MOCK-103",
    customer: { name: "Charlie Test", address: "78 Test Avenue" },
    agent: null,
    status: "Pending Assignment",
    lastUpdate: "Yesterday 5:00 PM",
    estimatedDelivery: "Tomorrow 10:00 AM",
    orderValue: 55.00,
  },
    {
    _id: "mock-60f1b3b3b3b3b3b3b3b3b3b4",
    deliveryId: "DEL-MOCK-004",
    orderId: "ORD-MOCK-104",
    customer: { name: "Diana Demo", address: "10 Demo Drive" },
    agent: MOCK_AGENTS[2],
    status: "Delivered",
    lastUpdate: "Yesterday 3:30 PM",
    estimatedDelivery: "Yesterday 3:15 PM",
    actualDelivery: "Yesterday 3:28 PM",
    orderValue: 210.50,
    packageSize: 'Large',
  },
   {
    _id: "mock-60f1b3b3b3b3b3b3b3b3b3b5",
    deliveryId: "DEL-MOCK-005",
    orderId: "ORD-MOCK-105",
    customer: { name: "Ethan Example", address: "20 Example Road" },
    agent: MOCK_AGENTS[0],
    status: "Cancelled",
    lastUpdate: "2 hours ago",
    estimatedDelivery: "1 hour ago",
  },
];

// Helper Loading/Error components
const LoadingComponent = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading Deliveries...</h3>
    </div>
  </div>
)

const ErrorComponent = ({ error, onRetry }: { error: string | null, onRetry: () => void }) => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="text-center max-w-md p-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error Loading Deliveries</h3>
      <p className="text-sm text-red-600 dark:text-red-400 mt-2 mb-4">{error || "An unknown error occurred."}</p>
      <Button onClick={onRetry} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600">
        Try Again
      </Button>
    </div>
  </div>
)

export default function VendorDeliveryPage() {
  // Live data states
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [availableAgents, setAvailableAgents] = useState<AvailableAgent[]>([])
  const [isLoading, setIsLoading] = useState(false) // Start false, set true only when fetching live
  const [error, setError] = useState<string | null>(null)
  const [hasFetchedLiveData, setHasFetchedLiveData] = useState(false); // Track if live data fetch was attempted

  // Toggle state for sample data
  const [showSampleData, setShowSampleData] = useState(false)

  // Filter states (apply to both live and sample)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [agentFilter, setAgentFilter] = useState<string>("All")

  // Modal/Action states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null)
  const [isAssigningAgent, setIsAssigningAgent] = useState<string | null>(null)
  const [selectedDeliveryForAgent, setSelectedDeliveryForAgent] = useState<Delivery | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  // --- Data Fetching ---
  const fetchDeliveriesAndAgents = async () => {
    if (showSampleData) {
        // Keep sample data logic if needed
        setDeliveries(MOCK_DELIVERIES); 
        setAvailableAgents(MOCK_AVAILABLE_AGENTS);
        setIsLoading(false);
        return;
    }
    setIsLoading(true)
    setError(null)
    try {
      // Fetch both deliveries and available agents in parallel
      const [deliveriesData, agentsData] = await Promise.all([
          apiCall<any[]>('/api/vendor/deliveries'), // Type any[] for now, adjust based on API response shape
          apiCall<AvailableAgent[]>('/api/vendor/delivery-agents') // Fetch agents from the new endpoint
      ]);
      
      // Process deliveries: Agent info is now populated under deliveryAgentId
      const processedDeliveries = deliveriesData.map(d => ({
          ...d,
          _id: d._id.toString(),
          deliveryId: d.deliveryId || `del-${d._id.toString().slice(-5)}`,
          orderId: d.orderId?._id?.toString() || d.orderId?.toString() || 'N/A', // Handle populated/unpopulated orderId
          customer: {
              name: d.customerId?.name || 'N/A', // Handle populated customer
              address: `${d.customerAddress?.street || ''}, ${d.customerAddress?.city || ''}, ${d.customerAddress?.postalCode || ''}`.trim() || 'No Address',
              phone: d.customerId?.phone || d.customerPhone || undefined
          },
          // Access populated agent details via deliveryAgentId
          agent: d.deliveryAgentId ? {
              id: d.deliveryAgentId._id.toString(),
              name: d.deliveryAgentId.name,
              phone: d.deliveryAgentId.phone,
              vehicle: d.deliveryAgentId.vehicleType, // Map vehicleType if needed
          } : null,
          lastUpdate: new Date(d.updatedAt).toLocaleString(),
          estimatedDelivery: d.estimatedDeliveryTime ? new Date(d.estimatedDeliveryTime).toLocaleString() : 'N/A',
          actualDelivery: d.actualDeliveryTime ? new Date(d.actualDeliveryTime).toLocaleString() : undefined,
          // Keep other fields like location, orderValue, packageSize if they exist
          location: d.currentLocation,
          orderValue: d.orderValue,
          packageSize: d.packageSize
      }));

      setDeliveries(processedDeliveries as Delivery[]); // Assert type after processing
      setAvailableAgents(agentsData || []);

    } catch (err: any) {
      console.error("API Error:", err)
      setError(err.message || 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  // --- Effects ---
  useEffect(() => {
    fetchDeliveriesAndAgents() // Fetch data on initial load or when switching view
  }, [showSampleData])

  // Toggle Button Handler
  const handleToggleDataView = () => {
      const switchingToSample = !showSampleData;
      setShowSampleData(switchingToSample);
      // If switching back to live and haven't fetched yet, fetch now
      if (!switchingToSample && !hasFetchedLiveData) {
          fetchDeliveriesAndAgents();
      }
      // Clear error when switching views
      setError(null);
  };

  // --- Determine Current Data Source ---
  const currentDeliveries = showSampleData ? MOCK_DELIVERIES : deliveries;
  const currentAvailableAgents = showSampleData ? MOCK_AVAILABLE_AGENTS : availableAgents;

  // --- Filtering (Applied to current data source) ---
  const agentNames = currentDeliveries
      .map(d => d.agent?.name)
      .filter((name): name is string => typeof name === 'string');
  const uniqueAgentNames = [...new Set(agentNames)];
  const agentFilterOptions = ["All", ...uniqueAgentNames];

  const filteredDeliveries = currentDeliveries.filter((delivery) => {
    const lowerSearchTerm = searchTerm.toLowerCase()
    const matchesSearch =
      (delivery.deliveryId?.toLowerCase() || '').includes(lowerSearchTerm) ||
      (delivery.orderId?.toLowerCase() || '').includes(lowerSearchTerm) ||
      (delivery.customer?.name?.toLowerCase() || '').includes(lowerSearchTerm) ||
      (delivery.agent?.name?.toLowerCase() || '').includes(lowerSearchTerm)

    const matchesStatus = statusFilter === "All" || delivery.status === statusFilter
    const matchesAgent = agentFilter === "All" || delivery.agent?.name === agentFilter

    return matchesSearch && matchesStatus && matchesAgent
  })

  // --- Statuses and Colors/Icons (Remain the same) ---
  const deliveryStatuses: Delivery['status'][] = ['Pending Assignment', 'Assigned', 'Out for Delivery', 'Delivered', 'Attempted Delivery', 'Cancelled', 'Delayed']
  const allStatusesForFilter = ["All", ...deliveryStatuses]
  const getStatusIcon = (status: Delivery['status']) => {
    switch (status) {
      case "Pending Assignment": return <Package className="w-4 h-4 text-gray-500" />
      case "Assigned": return <UserCheck className="w-4 h-4 text-blue-500" />
      case "Out for Delivery": return <Truck className="w-4 h-4 text-purple-500" />
      case "Delivered": return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Attempted Delivery": return <Clock className="w-4 h-4 text-orange-500" />
      case "Cancelled": return <XCircle className="w-4 h-4 text-red-500" />
      case "Delayed": return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default: return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case "Pending Assignment": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      case "Assigned": return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
      case "Out for Delivery": return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"
      case "Delivered": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
      case "Attempted Delivery": return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
      case "Cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
      case "Delayed": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getVehicleIcon = (vehicle?: string) => {
    switch (vehicle?.toLowerCase()) {
      case "bike": return <Bike className="w-4 h-4 inline-block mr-1" />
      case "car": return <Car className="w-4 h-4 inline-block mr-1" />
      case "scooter": return <Bike className="w-4 h-4 inline-block mr-1" />
      default: return <Truck className="w-4 h-4 inline-block mr-1 text-gray-400" />
    }
  }

  // --- API Call Handlers ---
  const handleUpdateStatus = async (deliveryId: string, newStatus: Delivery['status']) => {
    if (showSampleData) {
        toast.info("Viewing sample data. Status not updated on server.");
        return;
    }
    setIsUpdatingStatus(deliveryId);
    try {
        await apiCall(`/api/vendor/deliveries/${deliveryId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ newStatus }),
        });
        toast.success(`Delivery status updated to ${newStatus}`);
        fetchDeliveriesAndAgents(); // Refetch to show updated data and agent assignment status
    } catch (err: any) {
        toast.error(`Failed to update status: ${err.message}`);
    } finally {
        setIsUpdatingStatus(null);
    }
  }

  const handleAssignAgent = async () => {
    if (!selectedDeliveryForAgent) return;
    const deliveryId = selectedDeliveryForAgent._id;

    if (showSampleData) {
        toast.info("Viewing sample data. Agent assignment not saved.");
        // Add logic to update mock data visually here if desired
        setSelectedDeliveryForAgent(null);
        setSelectedAgentId(null);
        return;
    }

    // selectedAgentId should be the ID string or null for unassigning
    if (selectedAgentId === undefined) { 
       toast.warning("No agent selected or action chosen.");
       return;
    }

    setIsAssigningAgent(deliveryId)
    try {
      // Pass the agentId (string or null) to the backend
      await apiCall(`/api/vendor/deliveries/${deliveryId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ agentId: selectedAgentId }), // Pass the ID
      })
      toast.success(`Agent ${selectedAgentId ? 'assigned' : 'unassigned'} successfully!`)
      fetchDeliveriesAndAgents() // Refetch live data
      setSelectedDeliveryForAgent(null)
      setSelectedAgentId(null)
    } catch (err: any) {
      toast.error(`Failed to assign agent: ${err.message}`)
    } finally {
      setIsAssigningAgent(null)
    }
  }

  // Placeholder Map Component
  const MapPlaceholder = ({ lat, lon }: { lat: number, lon: number }) => (
    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
      <MapPin className="w-8 h-8" />
      <span className="ml-2 text-sm">Map View (Lat: {lat.toFixed(2)}, Lon: {lon.toFixed(2)})</span>
    </div>
  )

  // --- Render ---
  // Show loading/error only for live data
  if (!showSampleData && isLoading) { return <LoadingComponent />; }
  if (!showSampleData && error) { return <ErrorComponent error={error} onRetry={fetchDeliveriesAndAgents} />; }

  return (
    <div className="animate-fadeIn p-4 md:p-6">
      {/* Header & Link to Manage Agents & Toggle Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          <span className="border-b-4 border-green-500 pb-1">Delivery Management</span>
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
                 variant="outline"
                 className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 w-full sm:w-auto"
                 onClick={handleToggleDataView}
                 title={showSampleData ? "Switch to Live Data" : "Switch to Sample Data"}
            >
                 {showSampleData ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                 {showSampleData ? "Show Live Data" : "Show Sample Data"}
            </Button>
            <Link href="/vendor/delivery/agents" className="w-full sm:w-auto">
                 <Button variant="outline" className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 w-full">
                    <UserCheck className="mr-2 h-4 w-4" /> Manage Agents
                 </Button>
            </Link>
        </div>
      </div>

      {/* Filters & Search (Apply to currentDeliveries) */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-md mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-grow">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                          type="text"
                          placeholder="Search Delivery #, Order #, Customer, Agent..."
                          className="form-input pl-10 w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
              </div>
              {/* Filter Selects */}
              <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                          <SelectValue placeholder="Status: All" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                          {allStatusesForFilter.map((status) => (
                              <SelectItem key={status} value={status} className="dark:focus:bg-gray-700">{status}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  <Select value={agentFilter} onValueChange={setAgentFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                          <SelectValue placeholder="Agent: All" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                          {agentFilterOptions.map((agentName) => (
                              <SelectItem key={agentName} value={agentName} className="dark:focus:bg-gray-700">{agentName}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  <Button variant="outline" className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 w-full sm:w-auto">
                      <Filter className="w-4 h-4 mr-2" /> More Filters
                  </Button>
              </div>
          </div>
      </div>

      {/* Delivery List / Grid (Uses filteredDeliveries derived from currentDeliveries) */}
      {filteredDeliveries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDeliveries.map((delivery) => (
            <div key={delivery._id} className={`bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700`}>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                    {delivery.deliveryId}
                  </span>
                  <Badge variant="outline" className={`px-2.5 py-1 text-xs font-medium ${getStatusColor(delivery.status)} border-none`}>
                    {getStatusIcon(delivery.status)} <span className="ml-1">{delivery.status}</span>
                  </Badge>
                </div>
                <div className="mb-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><span className="font-medium text-gray-800 dark:text-gray-200">Order:</span> {delivery.orderId}</p>
                  <p><span className="font-medium text-gray-800 dark:text-gray-200">Customer:</span> {delivery.customer.name}</p>
                  <p className="flex items-start">
                    <MapPin className="w-4 h-4 mr-1.5 mt-0.5 text-gray-400 dark:text-gray-500 shrink-0" />
                    <span>{delivery.customer.address || 'No address'}</span>
                  </p>
                  <p className="flex items-center">
                    <UserCheck className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500 shrink-0" />
                    <span>
                      Agent: {delivery.agent ? (
                        <span className="font-medium">{delivery.agent.name} ({getVehicleIcon(delivery.agent.vehicle)}{delivery.agent.vehicle})</span>
                      )
                        : <span className="text-gray-500 italic">Unassigned</span>
                      }
                      {delivery.agent?.phone && <a href={`tel:${delivery.agent.phone}`} className="ml-1.5 text-blue-500 hover:underline inline-flex items-center"><Phone size={12} /></a>}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500 shrink-0" />
                    <span>ETA: {delivery.estimatedDelivery}</span>
                  </p>
                  {(delivery.orderValue || delivery.packageSize) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {delivery.orderValue && <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">₹{delivery.orderValue.toFixed(2)}</Badge>}
                      {delivery.packageSize && <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-400"><Package size={12} className="mr-1" />{delivery.packageSize}</Badge>}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">Last Update: {delivery.lastUpdate}</p>
                </div>
                {delivery.status === "Out for Delivery" && delivery.location && (
                  <div className="mb-4">
                    <MapPlaceholder lat={delivery.location.lat} lon={delivery.location.lon} />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                <Dialog
                    open={selectedDeliveryForAgent?._id === delivery._id}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setSelectedDeliveryForAgent(null);
                            setSelectedAgentId(null); // Reset selection on close
                        } else {
                            setSelectedDeliveryForAgent(delivery); // Set the delivery context when opening
                            setSelectedAgentId(delivery.agent?.id ?? null); // Pre-select current agent or null
                        }
                    }}
                 >
                    <DialogTrigger asChild>
                         {/* Use onClick to set the selected delivery *before* the dialog opens */}
                         <Button
                            size="sm"
                            variant="outline"
                            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 text-xs"
                            onClick={() => setSelectedDeliveryForAgent(delivery)}
                          >
                             <UserCog className="mr-1.5 h-3.5 w-3.5"/> Assign Agent
                         </Button>
                    </DialogTrigger>
                    {/* Render DialogContent only when a delivery is selected to ensure correct data context */}
                    {selectedDeliveryForAgent?._id === delivery._id && (
                        <DialogContent className="dark:bg-gray-800 sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Assign Agent for Delivery {delivery.deliveryId}</DialogTitle>
                                <DialogDescription>Select an agent to assign. Currently: {delivery.agent?.name || 'None'}</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-2">
                                <Select
                                    value={selectedAgentId ?? "unassign"}
                                    onValueChange={(value) => setSelectedAgentId(value === "unassign" ? null : value)}
                                    disabled={showSampleData} // Disable select if showing sample data
                                >
                                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                                    <SelectValue placeholder="Select Agent" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                        <SelectItem value="unassign" className="italic text-gray-500 dark:focus:bg-gray-700">Unassign Agent</SelectItem>
                                        {/* Use currentAvailableAgents */}
                                        {currentAvailableAgents.map(agent => (
                                            <SelectItem key={agent._id} value={agent._id} className="dark:focus:bg-gray-700">{agent.name}</SelectItem>
                                        ))}
                                        {currentAvailableAgents.length === 0 && !showSampleData && <p className="p-4 text-sm text-center text-gray-500">No agents available. <Link href="/vendor/delivery/agents" className="underline">Add agents here.</Link></p>}
                                         {currentAvailableAgents.length === 0 && showSampleData && <p className="p-4 text-sm text-center text-gray-500">No sample agents defined.</p>}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedDeliveryForAgent(null)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600">Cancel</Button>
                                <Button
                                    onClick={handleAssignAgent}
                                    // Disable Confirm button if showing sample data OR if assigning live data
                                    disabled={showSampleData || (isAssigningAgent === delivery._id && !showSampleData)}
                                    className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                                    title={showSampleData ? "Cannot assign agent in sample view" : undefined}
                                >
                                    {isAssigningAgent === delivery._id && !showSampleData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Confirm Assignment
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    )}
                 </Dialog>

                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-gray-400 dark:hover:bg-gray-700" disabled={isUpdatingStatus === delivery._id && !showSampleData}>
                            {isUpdatingStatus === delivery._id && !showSampleData ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                            <span className="sr-only">Delivery Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="dark:bg-gray-900 dark:border-gray-700">
                         <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                         <DropdownMenuSeparator className="dark:bg-gray-700"/>
                         {deliveryStatuses.map(status => (
                            <DropdownMenuItem
                                key={status}
                                // Disable if current status or if updating live status
                                disabled={delivery.status === status || (isUpdatingStatus === delivery._id && !showSampleData)}
                                onSelect={() => handleUpdateStatus(delivery._id, status)}
                                className="dark:focus:bg-gray-700"
                            >
                                {getStatusIcon(status)} <span className="ml-2">Mark as {status}</span>
                            </DropdownMenuItem>
                         ))}
                     </DropdownMenuContent>
                 </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
         // Adjusted "No deliveries found" message
         <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
            <Truck className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="font-medium">
                {showSampleData
                    ? "No sample deliveries match filters."
                    : hasFetchedLiveData ? "No deliveries found matching your criteria." : "No deliveries found."
                }
            </p>
            <p className="text-sm mt-1">
                {showSampleData
                    ? "Try adjusting the filters or toggle back to live data."
                     : hasFetchedLiveData ? "Adjust your filters or check back later." : "Deliveries will appear here once orders are processed or click 'Show Sample Data'."
                 }
            </p>
         </div>
      )}
    </div>
  )
}
