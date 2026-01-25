import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
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
import { Plus, Search } from 'lucide-react';
import { useStaffStore, useAppointmentStore, useActivityLogStore, Staff } from '@/store';
import { toast } from 'sonner';

export default function StaffPage() {
  const { staff, addStaff, updateStaff, deleteStaff } = useStaffStore();
  const { appointments } = useAppointmentStore();
  const { addLog } = useActivityLogStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState<Staff['serviceType']>('Doctor');
  const [dailyCapacity, setDailyCapacity] = useState(5);
  const [availabilityStatus, setAvailabilityStatus] = useState<Staff['availabilityStatus']>('Available');

  const today = new Date().toISOString().split('T')[0];

  const getStaffAppointmentsToday = (staffId: string) => {
    return appointments.filter(
      (a) => a.staffId === staffId && a.date === today && a.status !== 'Cancelled'
    ).length;
  };

  const resetForm = () => {
    setName('');
    setServiceType('Doctor');
    setDailyCapacity(5);
    setAvailabilityStatus('Available');
    setEditingStaff(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name,
        serviceType,
        dailyCapacity,
        availabilityStatus,
      });
      addLog(`Staff "${name}" updated`, 'status');
      toast.success('Staff updated');
    } else {
      addStaff({
        name,
        serviceType,
        dailyCapacity,
        availabilityStatus,
      });
      addLog(`New staff "${name}" added`, 'create');
      toast.success('Staff added');
    }

    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setName(staffMember.name);
    setServiceType(staffMember.serviceType);
    setDailyCapacity(staffMember.dailyCapacity);
    setAvailabilityStatus(staffMember.availabilityStatus);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    const staffMember = staff.find((s) => s.id === id);
    deleteStaff(id);
    addLog(`Staff "${staffMember?.name}" removed`, 'cancel');
    toast.success('Staff removed');
  };

  const handleToggleStatus = (staffMember: Staff) => {
    const newStatus = staffMember.availabilityStatus === 'Available' ? 'On Leave' : 'Available';
    updateStaff(staffMember.id, { availabilityStatus: newStatus });
    addLog(`${staffMember.name} marked as ${newStatus}`, 'status');
    toast.success(`${staffMember.name} is now ${newStatus}`);
  };

  const filteredStaff = useMemo(() => {
    let filtered = staff;

    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((s) => s.serviceType === filterType);
    }

    return filtered;
  }, [staff, searchQuery, filterType]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Staff</h1>
            <p className="text-muted-foreground">Manage your team members</p>
          </div>
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
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={serviceType}
                    onValueChange={(value: Staff['serviceType']) => setServiceType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Doctor">Doctor</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                      <SelectItem value="Support Agent">Support Agent</SelectItem>
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
                    onValueChange={(value: Staff['availabilityStatus']) => setAvailabilityStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
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
            <TabsTrigger value="Doctor">Doctors</TabsTrigger>
            <TabsTrigger value="Consultant">Consultants</TabsTrigger>
            <TabsTrigger value="Support Agent">Support</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Staff Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.length > 0 ? (
            filteredStaff.map((staffMember) => (
              <StaffCard
                key={staffMember.id}
                staff={staffMember}
                appointmentsToday={getStaffAppointmentsToday(staffMember.id)}
                onEdit={() => handleEdit(staffMember)}
                onDelete={() => handleDelete(staffMember.id)}
                onToggleStatus={() => handleToggleStatus(staffMember)}
                onClick={() => navigate(`/staff/${staffMember.id}`)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No staff members found
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
