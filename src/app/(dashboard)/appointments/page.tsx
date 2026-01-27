'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageLoader } from '@/components/PageLoader';
import { AppointmentCard } from '@/components/AppointmentCard';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, CalendarIcon, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useActivityLogStore } from '@/store';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  requiredStaffTypeId: string;
  isActive: boolean;
  requiredStaffType?: {
    id: string;
    name: string;
  };
}

interface Staff {
  id: string;
  name: string;
  email?: string;
  staffTypeId: string;
  availabilityStatus: string;
  dailyCapacity: number;
  staffType?: {
    id: string;
    name: string;
  };
  todaysAppointments?: number;
  totalAppointments?: number;
}

interface BackendAppointment {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceId: string;
  staffId: string;
  appointmentDateTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  createdAt: string;
  updatedAt: string;
  service?: Service;
  staff?: Staff;
}

type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export default function AppointmentsPage() {
  const { addLog } = useActivityLogStore();

  const [isOpen, setIsOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<BackendAppointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all');

  // Backend data
  const [appointments, setAppointments] = useState<BackendAppointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
  const [appointmentTime, setAppointmentTime] = useState('09:00');

  // Fetch services
  const fetchServices = async () => {
    setIsLoadingServices(true);
    try {
      const response = await fetch('/api/services');
      const result = await response.json();
      
      if (result.success && result.data) {
        setServices(result.data.filter((s: Service) => s.isActive));
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

  // Fetch staff by staff type ID
  const fetchStaffByType = async (staffTypeId: string) => {
    setIsLoadingStaff(true);
    setStaff([]);
    try {
      const response = await fetch(`/api/staff/by-staff-type/${staffTypeId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setStaff(result.data.filter((s: Staff) => s.availabilityStatus === 'AVAILABLE'));
      } else {
        toast.error('Failed to fetch staff');
        setStaff([]);
      }
    } catch (error) {
      console.error('Error fetching staff by type:', error);
      toast.error('Failed to fetch staff');
      setStaff([]);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const response = await fetch('/api/appointments');
      const result = await response.json();
      
      if (result.success && result.data) {
        setAppointments(result.data);
      } else {
        toast.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchAppointments();
    fetchServices();
  }, []);

  // Handle service selection - fetch staff by service's required staff type
  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedStaff(''); // Reset staff selection
    
    const service = services.find(s => s.id === serviceId);
    if (service && service.requiredStaffTypeId) {
      fetchStaffByType(service.requiredStaffTypeId);
    } else {
      setStaff([]);
    }
  };

  // Eligible staff are already filtered by staff type from the API
  const eligibleStaff = staff;

  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setSelectedService('');
    setSelectedStaff('');
    setAppointmentDate(new Date());
    setAppointmentTime('09:00');
    setEditingAppointment(null);
    setStaff([]); // Clear staff when resetting
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim() || !selectedService || !selectedStaff || !appointmentDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Combine date and time into ISO datetime
      const dateStr = format(appointmentDate, 'yyyy-MM-dd');
      const appointmentDateTime = `${dateStr}T${appointmentTime}:00Z`;

      const appointmentData = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        serviceId: selectedService,
        staffId: selectedStaff,
        appointmentDateTime,
      };

      if (editingAppointment) {
        // Update appointment
        const response = await fetch('/api/appointments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAppointment.id, ...appointmentData }),
        });

        const result = await response.json();
        
        if (result.success) {
          toast.success('Appointment updated successfully');
          addLog(`Updated appointment for ${customerName}`, 'status');
        } else {
          toast.error(result.message || 'Failed to update appointment');
          return;
        }
      } else {
        // Create new appointment
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData),
        });

        const result = await response.json();
        
        if (result.success) {
          toast.success('Appointment created successfully');
          addLog(`Created appointment for ${customerName}`, 'create');
        } else {
          toast.error(result.message || 'Failed to create appointment');
          return;
        }
      }

      // Refresh appointments list
      await fetchAppointments();
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Failed to save appointment');
    }
  };

  const handleEdit = (appointment: BackendAppointment) => {
    setEditingAppointment(appointment);
    setCustomerName(appointment.customerName);
    setCustomerEmail(appointment.customerEmail);
    setSelectedService(appointment.serviceId);
    setSelectedStaff(appointment.staffId);
    
    // Parse appointmentDateTime
    const dateTime = new Date(appointment.appointmentDateTime);
    setAppointmentDate(dateTime);
    setAppointmentTime(format(dateTime, 'HH:mm'));
    
    // Fetch staff for this service's staff type
    if (appointment.service?.requiredStaffTypeId) {
      fetchStaffByType(appointment.service.requiredStaffTypeId);
    }
    
    setIsOpen(true);
  };

  const handleDelete = async (id: string, customerName: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Appointment deleted successfully');
        addLog(`Deleted appointment for ${customerName}`, 'cancel');
        await fetchAppointments();
      } else {
        toast.error(result.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      const appointment = appointments.find((a) => a.id === id);
      if (!appointment) return;

      let response;
      
      // Use specific endpoints for completed and cancelled statuses
      if (status === 'COMPLETED') {
        response = await fetch(`/api/appointments/${id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (status === 'CANCELLED') {
        response = await fetch(`/api/appointments/${id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Use PUT for other status changes (NO_SHOW)
        response = await fetch('/api/appointments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id, 
            status,
            customerName: appointment.customerName,
            customerEmail: appointment.customerEmail,
            serviceId: appointment.serviceId,
            staffId: appointment.staffId,
            appointmentDateTime: appointment.appointmentDateTime,
          }),
        });
      }

      const result = await response.json();
      
      if (result.success) {
        const statusLabel = status === 'COMPLETED' ? 'completed' : 
                           status === 'CANCELLED' ? 'cancelled' : 
                           status === 'NO_SHOW' ? 'no-show' : status.toLowerCase();
        toast.success(`Appointment marked as ${statusLabel}`);
        addLog(`Appointment for ${appointment.customerName} marked as ${statusLabel}`, 'status');
        await fetchAppointments();
      } else {
        toast.error(result.message || 'Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Filter by search query (customer name or staff name)
    if (searchQuery) {
      filtered = filtered.filter((a) =>
        a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.staff?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date
    if (filterDate) {
      const dateStr = format(filterDate, 'yyyy-MM-dd');
      filtered = filtered.filter((a) => {
        const appointmentDate = format(new Date(a.appointmentDateTime), 'yyyy-MM-dd');
        return appointmentDate === dateStr;
      });
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    return filtered.sort((a, b) => 
      new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime()
    );
  }, [appointments, searchQuery, filterDate, filterStatus]);

  // Get counts for each status
  const statusCounts = useMemo(() => {
    return {
      all: appointments.length,
      SCHEDULED: appointments.filter(a => a.status === 'SCHEDULED').length,
      COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
      CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
      NO_SHOW: appointments.filter(a => a.status === 'NO_SHOW').length,
    };
  }, [appointments]);

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Show loading state on initial load
  if (isLoadingAppointments && appointments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage and schedule appointments</p>
        </div>
        <PageLoader title="Loading Appointments" description="Fetching appointments data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">    {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage and schedule appointments</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select value={selectedService} onValueChange={handleServiceChange} required disabled={isLoadingServices || services.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingServices ? "Loading services..." : services.length === 0 ? "No services available" : "Select a service"} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration} min - ${service.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff">Staff Member</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff} required disabled={isLoadingStaff || eligibleStaff.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingStaff ? "Loading staff..." : eligibleStaff.length === 0 ? selectedService ? "No staff available for this service" : "Select a service first" : "Select staff member"} />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleStaff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} - {s.staffType?.name} ({s.todaysAppointments || 0}/{s.dailyCapacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !appointmentDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {appointmentDate ? format(appointmentDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={appointmentDate}
                      onSelect={setAppointmentDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary text-primary-foreground">
                  {editingAppointment ? 'Update' : 'Create'}
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
            placeholder="Search by customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filterDate ? format(filterDate, 'MMM dd, yyyy') : 'All dates'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={setFilterDate}
              initialFocus
              className="pointer-events-auto"
            />
            <div className="p-3 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setFilterDate(undefined)}
              >
                Clear Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Status Tabs */}
      <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as AppointmentStatus | 'all')}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="SCHEDULED">
            Scheduled ({statusCounts.SCHEDULED})
          </TabsTrigger>
          <TabsTrigger value="COMPLETED">
            Completed ({statusCounts.COMPLETED})
          </TabsTrigger>
          <TabsTrigger value="CANCELLED">
            Cancelled ({statusCounts.CANCELLED})
          </TabsTrigger>
          <TabsTrigger value="NO_SHOW">
            No-Show ({statusCounts.NO_SHOW})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Appointments List */}
      <div className="grid gap-3">
        {isLoadingAppointments && appointments.length > 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Refreshing appointments...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-xl border bg-card p-4 transition-all hover:border-gray-600"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base">{appointment.customerName}</h3>
                      <p className="text-sm text-muted-foreground truncate">{appointment.customerEmail}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {appointment.status === 'SCHEDULED' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-success/20 bg-success/10 text-success hover:bg-success/20 h-8"
                            onClick={() => handleStatusChange(appointment.id, 'COMPLETED')}
                          >
                            Mark Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 h-8"
                            onClick={() => handleStatusChange(appointment.id, 'CANCELLED')}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Service</p>
                      <p className="font-medium">{appointment.service?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Staff</p>
                      <p className="font-medium">{appointment.staff?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Date & Time</p>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <p className="font-medium text-xs">
                            {format(new Date(appointment.appointmentDateTime), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <p className="font-medium text-xs">
                            {format(new Date(appointment.appointmentDateTime), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Status</p>
                      <div className="flex items-center gap-2">
                        {appointment.status === 'SCHEDULED' && (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-info/10 text-info">
                            Scheduled
                          </span>
                        )}
                        {appointment.status === 'COMPLETED' && (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-success/10 text-success">
                            Completed
                          </span>
                        )}
                        {appointment.status === 'CANCELLED' && (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-destructive/10 text-destructive">
                            Cancelled
                          </span>
                        )}
                        {appointment.status === 'NO_SHOW' && (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-warning/10 text-warning">
                            No-Show
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery || filterDate || filterStatus !== 'all' 
              ? 'No appointments found matching your filters' 
              : 'No appointments yet. Create your first appointment to get started!'}
          </div>
        )}
      </div>
    </div>
  );
}
