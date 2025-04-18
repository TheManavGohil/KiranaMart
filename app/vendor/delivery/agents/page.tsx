"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Edit, Trash, UserPlus, Loader2, AlertCircle, Bike, Car, Phone, MoreVertical, Power, PowerOff, UserMinus, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { apiCall } from '@/lib/api';
import { toast } from "sonner";

// Define Agent Type (matching API/DB)
interface DeliveryAgent {
  _id: string; // MongoDB ObjectId as string
  vendorId: string;
  name: string;
  phone: string;
  vehicleType: 'Bike' | 'Car' | 'Scooter' | 'Other';
  isActive: boolean;
  createdAt?: string; // Dates as strings
  updatedAt?: string;
}

// Type for the new/edit agent form
type AgentFormData = Omit<DeliveryAgent, '_id' | 'vendorId' | 'createdAt' | 'updatedAt'>;

// Helper Loading/Error components
const LoadingComponent = () => (
     <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading Agents...</h3>
        </div>
      </div>
);

const ErrorComponent = ({ error, onRetry }: {error: string | null, onRetry: () => void}) => (
     <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error Loading Agents</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2 mb-4">{error || "An unknown error occurred."}</p>
          <Button onClick={onRetry} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600">
            Try Again
          </Button>
        </div>
      </div>
);


export default function VendorDeliveryAgentsPage() {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission loading

  // Form states
  const [currentAgent, setCurrentAgent] = useState<DeliveryAgent | null>(null); // For editing
  const [agentFormData, setAgentFormData] = useState<AgentFormData>({
    name: "",
    phone: "",
    vehicleType: "Bike",
    isActive: true,
  });

  // --- Fetch Agents ---
  const fetchAgents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAgents = await apiCall<DeliveryAgent[]>('/api/vendor/delivery-agents');
      setAgents(fetchedAgents || []);
    } catch (err: any) {
      console.error("Error fetching agents:", err);
      const errorMsg = err.message || "Failed to load delivery agents";
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
      setAgents([]); // Clear agents on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // --- Filter Logic ---
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone.includes(searchTerm)
  );

  // --- Form Handling ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target;
     setAgentFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleSelectChange = (value: string) => { // Shadcn Select returns only the value
     setAgentFormData(prev => ({ ...prev, vehicleType: value as DeliveryAgent['vehicleType'] }));
   };

   const handleSwitchChange = (checked: boolean) => { // Shadcn Switch returns boolean
     setAgentFormData(prev => ({ ...prev, isActive: checked }));
   };

   // Reset form when opening Add modal
   const handleOpenAddModal = (isOpen: boolean) => {
        if (isOpen) {
            setAgentFormData({ name: "", phone: "", vehicleType: "Bike", isActive: true });
        }
        setIsAddModalOpen(isOpen);
   };

    // Reset form when opening/closing Edit modal
    const handleOpenEditModal = (isOpen: boolean) => {
        if (!isOpen) {
             setCurrentAgent(null); // Clear current agent when closing
             setAgentFormData({ name: "", phone: "", vehicleType: "Bike", isActive: true }); // Reset form
        }
        setIsEditModalOpen(isOpen);
    };

  // --- CRUD Operations ---
  const handleAddAgent = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!agentFormData.name || !agentFormData.phone) {
          toast.error("Agent name and phone are required.");
          return;
      }
      setIsSubmitting(true);
      try {
          // The API now returns the full agent object including the generated _id
          const result = await apiCall<{ message: string; agent: DeliveryAgent }>('/api/vendor/delivery-agents', {
              method: 'POST',
              body: JSON.stringify(agentFormData),
          });
          setAgents(prev => [...prev, result.agent]); // Add the agent returned by API
          toast.success(result.message || "Delivery agent added successfully!");
          setIsAddModalOpen(false); // Close modal on success
      } catch (err: any) {
          console.error("Error adding agent:", err);
          toast.error(`Error: ${err.message || "Failed to add agent"}`);
      } finally {
          setIsSubmitting(false);
      }
  };

  const openEditModal = (agent: DeliveryAgent) => {
      setCurrentAgent(agent);
      setAgentFormData({ // Pre-fill form with current agent data
          name: agent.name,
          phone: agent.phone,
          vehicleType: agent.vehicleType,
          isActive: agent.isActive,
      });
      handleOpenEditModal(true); // Use handler to open
  };

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgent || !agentFormData.name || !agentFormData.phone) {
        toast.error("Agent name and phone are required.");
        return;
    }
    setIsSubmitting(true);
    try {
        const result = await apiCall<{ message: string; agentId: string }>(`/api/vendor/delivery-agents/${currentAgent._id}`, {
            method: 'PUT',
            body: JSON.stringify(agentFormData),
        });
        // Update local state
        setAgents(prev => prev.map(a => a._id === currentAgent._id ? { ...a, ...agentFormData } : a));
        toast.success(result.message || "Delivery agent updated successfully!");
        handleOpenEditModal(false); // Use handler to close and reset
    } catch (err: any) {
        console.error("Error updating agent:", err);
        toast.error(`Error: ${err.message || "Failed to update agent"}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
      // Find agent name for confirmation message
      const agentName = agents.find(a => a._id === agentId)?.name || 'this agent';
      if (!window.confirm(`Are you sure you want to delete ${agentName}? This action cannot be undone.`)) {
          return;
      }
      // Consider adding loading state for delete specific to the row?
      try {
          const result = await apiCall<{ message: string }>(`/api/vendor/delivery-agents/${agentId}`, { method: 'DELETE' });
          setAgents(prev => prev.filter(a => a._id !== agentId));
          toast.success(result.message || "Delivery agent deleted successfully!");
      } catch (err: any) {
          console.error("Error deleting agent:", err);
          toast.error(`Error: ${err.message || "Failed to delete agent"}`);
      }
  };

  // --- UI Helpers ---
  const getVehicleIcon = (vehicle?: string) => { // Make vehicle optional for safety
      switch (vehicle?.toLowerCase()) {
          case "bike": return <Bike className="w-4 h-4 inline-block mr-1.5 text-blue-500" />;
          case "car": return <Car className="w-4 h-4 inline-block mr-1.5 text-red-500" />;
          case "scooter": return <Bike className="w-4 h-4 inline-block mr-1.5 text-green-500" />; // Use Bike icon for Scooter too?
          default: return <UserMinus className="w-4 h-4 inline-block mr-1.5 text-gray-500" />; // Changed default icon
      }
  };

  // --- Render Logic ---
  if (isLoading) { return <LoadingComponent />; }
  if (error) { return <ErrorComponent error={error} onRetry={fetchAgents} />; }

  return (
    <div className="animate-fadeIn p-4 md:p-6">
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/vendor/delivery">
          <Button variant="outline" size="sm" className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Deliveries
          </Button>
        </Link>
      </div>

      {/* Header: Title + Add Agent Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Manage Delivery Agents</h1>
        <Dialog open={isAddModalOpen} onOpenChange={handleOpenAddModal}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" /> Add New Agent
                </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800 sm:max-w-[425px]">
                 {/* Add Agent Form */}
                 <DialogHeader>
                     <DialogTitle>Add New Delivery Agent</DialogTitle>
                     <DialogDescription>Enter the details for the new delivery agent.</DialogDescription>
                 </DialogHeader>
                 <form onSubmit={handleAddAgent} className="space-y-4 py-4">
                     <div>
                        <Label htmlFor="name" className="text-right">Name*</Label>
                        <Input id="name" name="name" value={agentFormData.name} onChange={handleFormChange} required className="mt-1 dark:bg-gray-700 dark:border-gray-600" />
                     </div>
                     <div>
                        <Label htmlFor="phone" className="text-right">Phone*</Label>
                        <Input id="phone" name="phone" type="tel" value={agentFormData.phone} onChange={handleFormChange} required className="mt-1 dark:bg-gray-700 dark:border-gray-600" />
                     </div>
                     <div>
                        <Label htmlFor="vehicleType" className="text-right">Vehicle Type*</Label>
                        <Select name="vehicleType" value={agentFormData.vehicleType} onValueChange={handleSelectChange}>
                             <SelectTrigger id="vehicleType" className="mt-1 dark:bg-gray-700 dark:border-gray-600">
                                <SelectValue placeholder="Select vehicle" />
                             </SelectTrigger>
                             <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                 <SelectItem value="Bike">Bike</SelectItem>
                                 <SelectItem value="Car">Car</SelectItem>
                                 <SelectItem value="Scooter">Scooter</SelectItem>
                                 <SelectItem value="Other">Other</SelectItem>
                             </SelectContent>
                         </Select>
                     </div>
                     <div className="flex items-center space-x-2 pt-2">
                        <Switch id="isActive" name="isActive" checked={agentFormData.isActive} onCheckedChange={handleSwitchChange} />
                        <Label htmlFor="isActive">Active Status</Label>
                     </div>
                     <DialogFooter className="pt-4">
                         <Button type="button" variant="outline" onClick={() => handleOpenAddModal(false)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600">Cancel</Button>
                         <Button type="submit" disabled={isSubmitting} className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200">
                             {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add Agent'}
                         </Button>
                     </DialogFooter>
                 </form>
             </DialogContent>
        </Dialog>
      </div>

      {/* Search Input */}
      <div className="mb-6 max-w-md">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search agents by name or phone..."
              className="pl-10 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Agents List Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Vehicle</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAgents.length > 0 ? filteredAgents.map(agent => (
                        <tr key={agent._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-sm">
                            <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{agent.name}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300 flex items-center">
                                <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400 dark:text-gray-500"/>
                                {agent.phone}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                                <span className="flex items-center">
                                    {getVehicleIcon(agent.vehicleType)} {agent.vehicleType}
                                </span>
                             </td>
                            <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                                    agent.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                }`}>
                                  {agent.isActive ? <Power className="w-3 h-3"/> : <PowerOff className="w-3 h-3"/>}
                                  {agent.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-gray-400 dark:hover:bg-gray-700">
                                            <MoreVertical className="h-4 w-4"/>
                                            <span className="sr-only">Agent Actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="dark:bg-gray-900 dark:border-gray-700">
                                        <DropdownMenuItem onSelect={() => openEditModal(agent)} className="dark:focus:bg-gray-700">
                                            <Edit className="mr-2 h-4 w-4" /> Edit Agent
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="dark:bg-gray-700"/>
                                        <DropdownMenuItem onSelect={() => handleDeleteAgent(agent._id)} className="text-red-600 dark:text-red-400 dark:focus:bg-red-900/50 dark:focus:text-red-300">
                                            <Trash className="mr-2 h-4 w-4" /> Delete Agent
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    )) : (
                       <tr><td colSpan={5} className="text-center py-16 text-gray-500 dark:text-gray-400">
                           <div className="flex flex-col items-center">
                               <UserPlus className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                               <p className="font-medium">No delivery agents found.</p>
                               <p className="text-sm mt-1">Click "Add New Agent" to get started.</p>
                           </div>
                       </td></tr>
                    )}
                </tbody>
            </table>
          </div>
      </div>

      {/* Edit Agent Modal */}
       <Dialog open={isEditModalOpen} onOpenChange={handleOpenEditModal}>
            <DialogContent className="dark:bg-gray-800 sm:max-w-[425px]">
                 <DialogHeader>
                     <DialogTitle>Edit Delivery Agent</DialogTitle>
                     <DialogDescription>Update the details for <span className="font-medium">{currentAgent?.name}</span>.</DialogDescription>
                 </DialogHeader>
                 <form onSubmit={handleEditAgent} className="space-y-4 py-4">
                      <div>
                          <Label htmlFor="edit-name">Name*</Label>
                          <Input id="edit-name" name="name" value={agentFormData.name} onChange={handleFormChange} required className="mt-1 dark:bg-gray-700 dark:border-gray-600"/>
                      </div>
                      <div>
                          <Label htmlFor="edit-phone">Phone*</Label>
                          <Input id="edit-phone" name="phone" type="tel" value={agentFormData.phone} onChange={handleFormChange} required className="mt-1 dark:bg-gray-700 dark:border-gray-600"/>
                      </div>
                      <div>
                        <Label htmlFor="edit-vehicleType">Vehicle Type*</Label>
                        <Select name="vehicleType" value={agentFormData.vehicleType} onValueChange={handleSelectChange}>
                             <SelectTrigger id="edit-vehicleType" className="mt-1 dark:bg-gray-700 dark:border-gray-600">
                                <SelectValue placeholder="Select vehicle" />
                             </SelectTrigger>
                             <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                 <SelectItem value="Bike">Bike</SelectItem>
                                 <SelectItem value="Car">Car</SelectItem>
                                 <SelectItem value="Scooter">Scooter</SelectItem>
                                 <SelectItem value="Other">Other</SelectItem>
                             </SelectContent>
                         </Select>
                     </div>
                     <div className="flex items-center space-x-2 pt-2">
                        <Switch id="edit-isActive" name="isActive" checked={agentFormData.isActive} onCheckedChange={handleSwitchChange} />
                        <Label htmlFor="edit-isActive">Active Status</Label>
                     </div>
                     <DialogFooter className="pt-4">
                         <Button type="button" variant="outline" onClick={() => handleOpenEditModal(false)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600">Cancel</Button>
                         <Button type="submit" disabled={isSubmitting} className="bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200">
                             {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                         </Button>
                     </DialogFooter>
                 </form>
             </DialogContent>
        </Dialog>

    </div>
  );
} 