import { useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Clock, Calendar, UserPlus, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useAppointmentStore,
  useStaffStore,
  useServiceStore,
  useActivityLogStore,
} from '@/store';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function QueuePage() {
  const { appointments, assignFromQueue, updateAppointment } = useAppointmentStore();
  const { staff } = useStaffStore();
  const { services } = useServiceStore();
  const { addLog } = useActivityLogStore();

  const today = new Date().toISOString().split('T')[0];

  // Get queue items (appointments without staff)
  const queueItems = useMemo(() => {
    return appointments
      .filter((a) => a.staffId === null && a.status === 'Scheduled')
      .sort((a, b) => {
        // Sort by queue position first, then by date and time
        if (a.queuePosition && b.queuePosition) {
          return a.queuePosition - b.queuePosition;
        }
        if (a.date === b.date) return a.time.localeCompare(b.time);
        return a.date.localeCompare(b.date);
      });
  }, [appointments]);

  // Get staff appointments count for today
  const getStaffAppointmentsToday = (staffId: string) => {
    return appointments.filter(
      (a) => a.staffId === staffId && a.date === today && a.status !== 'Cancelled'
    ).length;
  };

  // Get eligible staff for an appointment
  const getEligibleStaff = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return [];
    return staff.filter(
      (s) => s.serviceType === service.requiredStaffType && s.availabilityStatus === 'Available'
    );
  };

  const handleAssign = (appointmentId: string, staffId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    const staffMember = staff.find((s) => s.id === staffId);
    
    assignFromQueue(appointmentId, staffId);
    addLog(
      `Appointment for "${appointment?.customerName}" assigned to ${staffMember?.name} from queue`,
      'assignment'
    );
    toast.success(`Assigned to ${staffMember?.name}`);
  };

  const handleAutoAssign = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;

    const eligible = getEligibleStaff(appointment.serviceId);
    
    // Find staff with least appointments and under capacity
    const available = eligible
      .map((s) => ({
        ...s,
        count: getStaffAppointmentsToday(s.id),
      }))
      .filter((s) => s.count < s.dailyCapacity)
      .sort((a, b) => a.count - b.count);

    if (available.length === 0) {
      toast.error('No staff available with capacity');
      return;
    }

    handleAssign(appointmentId, available[0].id);
  };

  const handleCancel = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    updateAppointment(appointmentId, { status: 'Cancelled', queuePosition: undefined });
    addLog(`Appointment for "${appointment?.customerName}" cancelled from queue`, 'cancel');
    toast.success('Appointment cancelled');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Waiting Queue</h1>
          <p className="text-muted-foreground">
            Manage appointments waiting for staff assignment
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Queue</p>
                <p className="text-2xl font-bold">{queueItems.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10">
                <User className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Staff</p>
                <p className="text-2xl font-bold">
                  {staff.filter((s) => s.availabilityStatus === 'Available').length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-info/10">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Total</p>
                <p className="text-2xl font-bold">
                  {appointments.filter((a) => a.date === today).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Queue List */}
        <div className="space-y-4">
          {queueItems.length > 0 ? (
            queueItems.map((item, index) => {
              const service = services.find((s) => s.id === item.serviceId);
              const eligibleStaff = getEligibleStaff(item.serviceId);
              const availableStaff = eligibleStaff.filter(
                (s) => getStaffAppointmentsToday(s.id) < s.dailyCapacity
              );

              return (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-5 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-warning/10">
                          <span className="text-lg font-bold text-warning">
                            {index + 1}
                          </span>
                        </div>
                        <Badge className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs">
                          #{item.queuePosition || index + 1}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.customerName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {service?.name || 'Unknown Service'}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(item.date), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {item.time}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      {availableStaff.length > 0 ? (
                        <>
                          <Select onValueChange={(value) => handleAssign(item.id, value)}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                              <SelectValue placeholder="Select staff" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStaff.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name} ({getStaffAppointmentsToday(s.id)}/{s.dailyCapacity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => handleAutoAssign(item.id)}
                            className="gradient-primary text-primary-foreground"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Auto Assign
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertCircle className="h-4 w-4" />
                          No available staff
                        </div>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handleCancel(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 rounded-xl border bg-card">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Queue is Empty</h3>
              <p className="text-muted-foreground">
                All appointments have been assigned to staff members.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
