'use client';

import { useState, useMemo, useEffect } from 'react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Briefcase, Clock, MoreVertical, Edit, Trash2, DollarSign } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useActivityLogStore } from '@/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StaffType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface BackendService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  requiredStaffTypeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  requiredStaffType?: {
    id: string;
    name: string;
  };
}

const durationColors: Record<number, string> = {
  15: 'bg-success/10 text-success',
  30: 'bg-info/10 text-info',
  60: 'bg-warning/10 text-warning',
};

export default function ServicesPage() {
  const { addLog } = useActivityLogStore();

  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState<BackendService | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Backend data
  const [services, setServices] = useState<BackendService[]>([]);
  const [staffTypes, setStaffTypes] = useState<StaffType[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState<number | null>(null);
  const [requiredStaffTypeId, setRequiredStaffTypeId] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch staff types for dropdown
  const fetchStaffTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const response = await fetch('/api/staff-types?includeInactive=false');
      const result = await response.json();
      
      if (result.success && result.data) {
        setStaffTypes(result.data);
      } else {
        toast.error('Failed to fetch staff types');
      }
    } catch (error) {
      console.error('Error fetching staff types:', error);
      toast.error('Failed to fetch staff types');
    } finally {
      setIsLoadingTypes(false);
    }
  };

  // Fetch services from backend
  const fetchServices = async () => {
    setIsLoadingServices(true);
    try {
      const response = await fetch('/api/services');
      const result = await response.json();
      
      if (result.success && result.data) {
        setServices(result.data);
      } else {
        toast.error('Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
    } finally {
      setIsLoadingServices(false);
    }
  };

  // Load services and staff types on mount
  useEffect(() => {
    fetchServices();
    fetchStaffTypes();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDuration(30);
    setPrice(0);
    setRequiredStaffTypeId('');
    setIsActive(true);
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !requiredStaffTypeId || price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const serviceData = {
        name: name.trim(),
        description: description.trim(),
        duration,
        price,
        requiredStaffTypeId,
        isActive,
      };

      if (editingService) {
        // Update service
        const response = await fetch('/api/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingService.id, ...serviceData }),
        });

        const result = await response.json();
        
        if (result.success) {
          toast.success('Service updated successfully');
          addLog(`Updated service: ${name}`, 'status');
        } else {
          toast.error(result.message || 'Failed to update service');
          return;
        }
      } else {
        // Create new service
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData),
        });

        const result = await response.json();
        
        if (result.success) {
          toast.success('Service created successfully');
          addLog(`Created new service: ${name}`, 'create');
        } else {
          toast.error(result.message || 'Failed to create service');
          return;
        }
      }

      // Refresh services list
      await fetchServices();
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    }
  };

  const handleEdit = (service: BackendService) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setDuration(service.duration);
    setPrice(service.price);
    setRequiredStaffTypeId(service.requiredStaffTypeId);
    setIsActive(service.isActive);
    setIsOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const response = await fetch('/api/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Service deleted successfully');
        addLog(`Deleted service: ${name}`, 'cancel');
        await fetchServices();
      } else {
        toast.error(result.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const filteredServices = useMemo(() => {
    if (!searchQuery) return services;
    return services.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  // Show loading state on initial load
  if (isLoadingServices && services.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your service offerings</p>
        </div>
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your service offerings</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Service' : 'Add Service'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., General Consultation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the service..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={duration.toString()}
                    onValueChange={(value) => setDuration(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffType">Required Staff Type</Label>
                <Select
                  value={requiredStaffTypeId}
                  onValueChange={setRequiredStaffTypeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff type" />
                  </SelectTrigger>
                  <SelectContent>
                    {!isLoadingTypes && staffTypes.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No staff types available</div>
                    ) : (
                      staffTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-2">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary text-primary-foreground">
                  {editingService ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Services Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingServices ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Loading services...
          </div>
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="group rounded-xl border bg-card p-5 transition-all hover-lift"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(service)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(service.id, service.name)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-lg">{service.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <DollarSign className="h-4 w-4 text-success" />
                <span className="text-lg font-semibold text-success">
                  ${service.price.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                  {service.requiredStaffType?.name || 'Unknown'}
                </Badge>
                <Badge className={cn(durationColors[service.duration] || 'bg-gray-100 text-gray-800')}>
                  <Clock className="h-3 w-3 mr-1" />
                  {service.duration} min
                </Badge>
                {!service.isActive && (
                  <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchQuery ? 'No services found matching your search' : 'No services yet. Add your first service to get started!'}
          </div>
        )}
      </div>
    </div>
  );
}
