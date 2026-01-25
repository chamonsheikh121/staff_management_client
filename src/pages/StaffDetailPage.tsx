import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStaffStore, useAppointmentStore, useServiceStore, useActivityLogStore } from '@/store';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const serviceTypeColors = {
  Doctor: 'bg-info/10 text-info border-info/20',
  Consultant: 'bg-success/10 text-success border-success/20',
  'Support Agent': 'bg-warning/10 text-warning border-warning/20',
};

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { staff } = useStaffStore();
  const { appointments, updateAppointment } = useAppointmentStore();
  const { services } = useServiceStore();
  const { addLog } = useActivityLogStore();

  const staffMember = staff.find((s) => s.id === id);
  const today = new Date().toISOString().split('T')[0];

  const staffAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.staffId === id)
      .sort((a, b) => {
        if (a.date === b.date) return a.time.localeCompare(b.time);
        return a.date.localeCompare(b.date);
      });
  }, [appointments, id]);

  const todayAppointments = useMemo(() => {
    return staffAppointments.filter((a) => a.date === today);
  }, [staffAppointments, today]);

  const stats = useMemo(() => {
    const scheduled = todayAppointments.filter((a) => a.status === 'Scheduled').length;
    const completed = todayAppointments.filter((a) => a.status === 'Completed').length;
    const cancelled = todayAppointments.filter((a) => a.status === 'Cancelled').length;
    return { scheduled, completed, cancelled, total: todayAppointments.length };
  }, [todayAppointments]);

  // Weekly data for chart
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => {
      const dayAppointments = staffAppointments.filter((a) => {
        const date = new Date(a.date);
        return date.getDay() === (index + 1) % 7;
      });
      return {
        day,
        appointments: dayAppointments.length,
      };
    });
  }, [staffAppointments]);

  const handleStatusChange = (appointmentId: string, status: 'Completed' | 'No-Show' | 'Cancelled') => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    updateAppointment(appointmentId, { status });
    addLog(`Appointment for "${appointment?.customerName}" marked as ${status}`, 'status');
    toast.success(`Appointment marked as ${status}`);
  };

  if (!staffMember) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Staff member not found</p>
          <Link to="/staff">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Staff
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const capacityPercentage = (stats.total / staffMember.dailyCapacity) * 100;
  const capacityStatus =
    capacityPercentage >= 100 ? 'full' : capacityPercentage >= 80 ? 'warning' : 'ok';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/staff">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{staffMember.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn(serviceTypeColors[staffMember.serviceType])}>
                {staffMember.serviceType}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  staffMember.availabilityStatus === 'Available'
                    ? 'bg-success/10 text-success border-success/20'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {staffMember.availabilityStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-info/10">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity & Chart Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Capacity */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Daily Capacity</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={
                      capacityStatus === 'full'
                        ? 'hsl(var(--destructive))'
                        : capacityStatus === 'warning'
                        ? 'hsl(var(--warning))'
                        : 'hsl(var(--success))'
                    }
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.min(capacityPercentage * 2.51, 251)} 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{stats.total}</span>
                  <span className="text-sm text-muted-foreground">
                    of {staffMember.dailyCapacity}
                  </span>
                </div>
              </div>
            </div>
            <p
              className={cn(
                'text-center mt-4 font-medium',
                capacityStatus === 'full' && 'text-destructive',
                capacityStatus === 'warning' && 'text-warning',
                capacityStatus === 'ok' && 'text-success'
              )}
            >
              {capacityStatus === 'full'
                ? 'At Full Capacity'
                : capacityStatus === 'warning'
                ? 'Nearing Capacity'
                : 'Capacity Available'}
            </p>
          </div>

          {/* Weekly Overview */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Weekly Overview</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="appointments"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="Appointments"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Today's Appointments</h3>
          <div className="space-y-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  staff={staffMember}
                  service={services.find((s) => s.id === appointment.serviceId)}
                  onStatusChange={(status) => handleStatusChange(appointment.id, status as 'Completed' | 'No-Show' | 'Cancelled')}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground rounded-xl border bg-card">
                No appointments scheduled for today
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
