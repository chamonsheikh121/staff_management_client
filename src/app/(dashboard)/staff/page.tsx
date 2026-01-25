'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/PageLoader';
import { StaffCard } from '@/components/StaffCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Settings } from 'lucide-react';
import { useStaffStore, useAppointmentStore, useActivityLogStore, Staff } from '@/store';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface StaffType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  _count?: {
    staff: number;
    services: number;
  };
}

interface BackendStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  staffTypeId: string;
  dailyCapacity: number;
  availabilityStatus: string;
  createdAt: string;
  updatedAt: string;
  staffType: {
    id: string;
    name: string;
  };
  _count: {
    appointments: number;
  };
}

export default function StaffPage() {
  const { addLog } = useActivityLogStore();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<BackendStaff | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Backend staff data
  const [backendStaff, setBackendStaff] = useState<BackendStaff[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [staffTypeId, setStaffTypeId] = useState('');
  const [dailyCapacity, setDailyCapacity] = useState(5);
  const [availabilityStatus, setAvailabilityStatus] = useState('AVAILABLE');

  // Staff Type Management state
  const [isStaffTypeOpen, setIsStaffTypeOpen] = useState(false);
  const [staffTypes, setStaffTypes] = useState<StaffType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [typeDescription, setTypeDescription] = useState('');
  const [typeIsActive, setTypeIsActive] = useState(true);

  // Fetch staff types
  const fetchStaffTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const response = await fetch('/api/staff-types?includeInactive=false');
      if (response.ok) {
        const result = await response.json();
        // Extract data from backend response format
        setStaffTypes(result.data || result);
      }
    } catch (error) {
      console.error('Failed to fetch staff types:', error);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  // Fetch all staff from backend
  const fetchStaff = async () => {
    setIsLoadingStaff(true);
    try {
      const response = await fetch('/api/staff');
      if (response.ok) {
        const result = await response.json();
        setBackendStaff(result.data || result);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setIsLoadingStaff(false);
    }
  };

  // Load staff types when dialog opens
  useEffect(() => {
    if (isStaffTypeOpen) {
      fetchStaffTypes();
    }
  }, [isStaffTypeOpen]);

  // Load staff types when Add Staff dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchStaffTypes();
    }
  }, [isOpen]);

  // Fetch staff and staff types on page load
  useEffect(() => {
    fetchStaff();
    fetchStaffTypes();
  }, []);

  // Fetch staff and staff types on page load
  useEffect(() => {
    fetchStaff();
    fetchStaffTypes();
  }, []);

  // Fetch staff and staff types on page load
  useEffect(() => {
    fetchStaff();
    fetchStaffTypes();
  }, []);

  const resetStaffTypeForm = () => {
    setTypeName('');
    setTypeDescription('');
    setTypeIsActive(true);
  };

  const handleStaffTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/staff-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: typeName,
          description: typeDescription,
          isActive: typeIsActive,
        }),
      });

      if (response.ok) {
        toast.success('Staff type created successfully');
        resetStaffTypeForm();
        fetchStaffTypes(); // Refresh the list
        addLog(`New staff type "${typeName}" created`, 'create');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create staff type');
      }
    } catch (error) {
      toast.error('An error occurred while creating staff type');
      console.error('Error creating staff type:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setStaffTypeId('');
    setDailyCapacity(5);
    setAvailabilityStatus('AVAILABLE');
    setEditingStaff(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          staffTypeId,
          dailyCapacity,
          availabilityStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || 'Failed to create staff');
        return;
      }

      toast.success('Staff created successfully');
      addLog(`New staff "${name}" added`, 'create');
      setIsOpen(false);
      resetForm();
      // Refresh staff list
      fetchStaff();
    } catch (error) {
      console.error('Error creating staff:', error);
      toast.error('An error occurred while creating staff');
    }
  };

  const handleEdit = (staffMember: BackendStaff) => {
    setEditingStaff(staffMember);
    setName(staffMember.name);
    setEmail(staffMember.email || '');
    setPhone(staffMember.phone || '');
    setStaffTypeId(staffMember.staffTypeId || '');
    setDailyCapacity(staffMember.dailyCapacity);
    setAvailabilityStatus(staffMember.availabilityStatus);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/staff?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Staff removed successfully');
        addLog(`Staff removed`, 'cancel');
        fetchStaff();
      } else {
        toast.error('Failed to delete staff');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('An error occurred while deleting staff');
    }
  };

  const handleToggleStatus = async (staffMember: BackendStaff) => {
    const newStatus = staffMember.availabilityStatus === 'AVAILABLE' ? 'ON_LEAVE' : 'AVAILABLE';
    
    try {
      const response = await fetch('/api/staff', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: staffMember.id,
          availabilityStatus: newStatus,
        }),
      });

      if (response.ok) {
        toast.success(`Status updated to ${newStatus}`);
        addLog(`${staffMember.name} marked as ${newStatus}`, 'status');
        fetchStaff();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('An error occurred');
    }
  };

  const filteredStaff = useMemo(() => {
    let filtered = backendStaff;

    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((s) => s.staffTypeId === filterType);
    }

    return filtered;
  }, [backendStaff, searchQuery, filterType]);

  // Show loading state on initial load
  if (isLoadingStaff && backendStaff.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <PageLoader title="Loading Staff" description="Fetching staff data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isStaffTypeOpen} onOpenChange={(open) => { setIsStaffTypeOpen(open); if (!open) resetStaffTypeForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Staff Types
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Staff Type Management</DialogTitle>
              </DialogHeader>
              
              {/* Create New Staff Type Form */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-4">Create New Staff Type</h3>
                <form onSubmit={handleStaffTypeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeName">Name</Label>
                    <Input
                      id="typeName"
                      value={typeName}
                      onChange={(e) => setTypeName(e.target.value)}
                      placeholder="e.g., Doctor, Consultant"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="typeDescription">Description</Label>
                    <Textarea
                      id="typeDescription"
                      value={typeDescription}
                      onChange={(e) => setTypeDescription(e.target.value)}
                      placeholder="e.g., Medical doctors and physicians"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="typeIsActive"
                      checked={typeIsActive}
                      onCheckedChange={setTypeIsActive}
                    />
                    <Label htmlFor="typeIsActive" className="cursor-pointer">
                      Active
                    </Label>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={resetStaffTypeForm}>
                      Clear
                    </Button>
                    <Button type="submit" className="gradient-primary text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Staff Type
                    </Button>
                  </div>
                </form>
              </div>

              {/* Existing Staff Types List */}
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Existing Staff Types</h3>
                {isLoadingTypes ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading staff types...
                  </div>
                ) : staffTypes.length > 0 ? (
                  <div className="space-y-2">
                    {staffTypes.map((type) => (
                      <div
                        key={type.id || type.name}
                        className="border rounded-lg p-4 flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{type.name}</h4>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                type.isActive
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}
                            >
                              {type.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No staff types found. Create one above.
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? 'Edit Staff' : 'Add Staff'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter staff name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffType">Staff Type</Label>
                <Select
                  value={staffTypeId}
                  onValueChange={(value) => setStaffTypeId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff type" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id || ''}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Daily Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  max={20}
                  value={dailyCapacity}
                  onChange={(e) => setDailyCapacity(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Availability Status</Label>
                <Select
                  value={availabilityStatus}
                  onValueChange={(value) => setAvailabilityStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>

                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary text-primary-foreground">
                  {editingStaff ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Type Tabs */}
      <Tabs value={filterType} onValueChange={setFilterType}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {staffTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id}>
              {type.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Staff Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingStaff ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Loading staff...
          </div>
        ) : filteredStaff.length > 0 ? (
          filteredStaff.map((staffMember) => (
            <StaffCard
              key={staffMember.id}
              staff={{
                id: staffMember.id,
                name: staffMember.name,
                email: staffMember.email,
                phone: staffMember.phone,
                serviceType: staffMember.staffType.name as any,
                dailyCapacity: staffMember.dailyCapacity,
                availabilityStatus: staffMember.availabilityStatus === 'AVAILABLE' ? 'Available' : 'On Leave',
              }}
              appointmentsToday={staffMember._count.appointments}
              onEdit={() => handleEdit(staffMember)}
              onDelete={() => handleDelete(staffMember.id)}
              onToggleStatus={() => handleToggleStatus(staffMember)}
              onClick={() => router.push(`/staff/${staffMember.id}`)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No staff members found
          </div>
        )}
      </div>
    </div>
  );
}
