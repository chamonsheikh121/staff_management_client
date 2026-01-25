import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
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
import { Plus, Search, CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useAppointmentStore,
  useStaffStore,
  useServiceStore,
  useActivityLogStore,
  Appointment,
} from '@/store';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AppointmentsPage() {
  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useAppointmentStore();
  const { staff } = useStaffStore();
  const { services } = useServiceStore();
  const { addLog } = useActivityLogStore();

  const [isOpen, setIsOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');

  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Get staff appointments count for today
  const getStaffAppointmentsToday = (staffId: string, date: string) => {
    return appointments.filter(
      (a) => a.staffId === staffId && a.date === date && a.status !== 'Cancelled'
    ).length;
  };

  // Check for time conflict
  const checkTimeConflict = (staffId: string, date: string, time: string, excludeId?: string) => {
    return appointments.find(
      (a) =>
        a.staffId === staffId &&
        a.date === date &&
        a.time === time &&
        a.status !== 'Cancelled' &&
        a.id !== excludeId
    );
  };

  // Get eligible staff for selected service
  const eligibleStaff = useMemo(() => {
    if (!selectedService) return [];
    const service = services.find((s) => s.id === selectedService);
    if (!service) return [];
    return staff.filter(
      (s) => s.serviceType === service.requiredStaffType && s.availabilityStatus === 'Available'
    );
  }, [selectedService, services, staff]);

  const handleStaffChange = (staffId: string) => {
    setSelectedStaff(staffId);
    setConflictWarning(null);
    setCapacityWarning(null);

    if (staffId && selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const staffMember = staff.find((s) => s.id === staffId);
      
      // Check capacity
      const appointmentsCount = getStaffAppointmentsToday(staffId, dateStr);
      if (appointmentsCount >= (staffMember?.dailyCapacity || 5)) {
        setCapacityWarning(
          `${staffMember?.name} already has ${appointmentsCount} appointments today.`
        );
      }

      // Check time conflict
      const conflict = checkTimeConflict(staffId, dateStr, selectedTime, editingAppointment?.id);
      if (conflict) {
        setConflictWarning('This staff member already has an appointment at this time.');
      }
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    setConflictWarning(null);

    if (selectedStaff && selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const conflict = checkTimeConflict(selectedStaff, dateStr, time, editingAppointment?.id);
      if (conflict) {
        setConflictWarning('This staff member already has an appointment at this time.');
      }
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setSelectedService('');
    setSelectedStaff('');
    setSelectedDate(new Date());
    setSelectedTime('09:00');
    setConflictWarning(null);
    setCapacityWarning(null);
    setEditingAppointment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    let assignedStaff: string | null = selectedStaff || null;
    let queuePosition: number | undefined;

    // If no staff available, add to queue
    if (!assignedStaff) {
      const queueItems = appointments.filter(
        (a) => a.staffId === null && a.status === 'Scheduled'
      );
      queuePosition = queueItems.length + 1;
      addLog(`${customerName} added to waiting queue (Position: ${queuePosition})`, 'queue');
      toast.info(`Added to waiting queue (Position: ${queuePosition})`);
    }

    if (editingAppointment) {
      updateAppointment(editingAppointment.id, {
        customerName,
        serviceId: selectedService,
        staffId: assignedStaff,
        date: dateStr,
        time: selectedTime,
        queuePosition,
      });
      addLog(`Appointment for "${customerName}" updated`, 'status');
      toast.success('Appointment updated');
    } else {
      addAppointment({
        customerName,
        serviceId: selectedService,
        staffId: assignedStaff,
        date: dateStr,
        time: selectedTime,
        status: 'Scheduled',
        queuePosition,
      });
      if (assignedStaff) {
        const staffMember = staff.find((s) => s.id === assignedStaff);
        addLog(`Appointment for "${customerName}" scheduled with ${staffMember?.name}`, 'create');
        toast.success('Appointment created');
      }
    }

    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setCustomerName(appointment.customerName);
    setSelectedService(appointment.serviceId);
    setSelectedStaff(appointment.staffId || '');
    setSelectedDate(new Date(appointment.date));
    setSelectedTime(appointment.time);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    const appointment = appointments.find((a) => a.id === id);
    updateAppointment(id, { status: 'Cancelled' });
    addLog(`Appointment for "${appointment?.customerName}" cancelled`, 'cancel');
    toast.success('Appointment cancelled');
  };

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    const appointment = appointments.find((a) => a.id === id);
    updateAppointment(id, { status });
    addLog(`Appointment for "${appointment?.customerName}" marked as ${status}`, 'status');
    toast.success(`Appointment marked as ${status}`);
  };

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    if (searchQuery) {
      filtered = filtered.filter((a) =>
        a.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterDate) {
      const dateStr = format(filterDate, 'yyyy-MM-dd');
      filtered = filtered.filter((a) => a.date === dateStr);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    return filtered.sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, searchQuery, filterDate, filterStatus]);

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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
                  <Label htmlFor="service">Service</Label>
                  <Select value={selectedService} onValueChange={setSelectedService} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff">Staff Member</Label>
                  <Select value={selectedStaff} onValueChange={handleStaffChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleStaff.map((s) => {
                        const count = getStaffAppointmentsToday(
                          s.id,
                          selectedDate ? format(selectedDate, 'yyyy-MM-dd') : today
                        );
                        return (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} ({count} / {s.dailyCapacity} appointments)
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {!selectedStaff && (
                    <p className="text-sm text-muted-foreground">
                      Leave empty to add to waiting queue
                    </p>
                  )}
                </div>

                {capacityWarning && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{capacityWarning}</AlertDescription>
                  </Alert>
                )}

                {conflictWarning && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{conflictWarning}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !selectedDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Select value={selectedTime} onValueChange={handleTimeChange}>
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
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-primary text-primary-foreground"
                    disabled={!!conflictWarning}
                  >
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
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Tabs */}
        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="Completed">Completed</TabsTrigger>
            <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="No-Show">No-Show</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                staff={staff.find((s) => s.id === appointment.staffId)}
                service={services.find((s) => s.id === appointment.serviceId)}
                onEdit={() => handleEdit(appointment)}
                onDelete={() => handleDelete(appointment.id)}
                onStatusChange={(status) => handleStatusChange(appointment.id, status)}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No appointments found
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
