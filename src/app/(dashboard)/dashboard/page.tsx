'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  CheckCircle,
  Users,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

interface DashboardStats {
  totalAppointments: number;
  label: string;
  completed: number;
  pending: number;
  waitingQueue: number;
  queueLabel: string;
  activeStaff: number;
  staffOnLeave: number;
}

interface StaffLoadItem {
  name: string;
  appointmentCount: number;
  capacity: number;
}

interface AppointmentStatus {
  scheduled: number;
  completed: number;
  inQueue: number;
  cancelled: number;
  noShow: number;
}

interface ActivityLogItem {
  id: string;
  description: string;
  createdAt: string;
  relativeTime: string;
}

interface StaffOverviewItem {
  id: string;
  name: string;
  staffType: string;
  availabilityStatus: string;
  todaysLoad: number;
  capacity: number;
}

interface UpcomingAppointment {
  id: string;
  customerName: string;
  customerEmail: string;
  appointmentDateTime: string;
  status: string;
  service: {
    name: string;
  };
  staff: {
    name: string;
  };
}

interface DashboardData {
  stats: DashboardStats;
  staffLoad: StaffLoadItem[];
  appointmentStatus: AppointmentStatus;
  upcomingAppointments: UpcomingAppointment[];
  activityLog: ActivityLogItem[];
  staffOverview: StaffOverviewItem[];
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      const result = await response.json();

      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <SkeletonLoader type="page" />
      </div>
    );
  }

  const chartData = dashboardData.staffLoad.map((s) => ({
    name: s.name.split(' ')[0],
    appointments: s.appointmentCount,
    capacity: s.capacity,
  }));

  const pieData = [
    { name: 'Scheduled', value: dashboardData.appointmentStatus.scheduled, color: 'hsl(var(--info))' },
    { name: 'Completed', value: dashboardData.appointmentStatus.completed, color: 'hsl(var(--success))' },
    { name: 'In Queue', value: dashboardData.appointmentStatus.inQueue, color: 'hsl(var(--warning))' },
    { name: 'Cancelled', value: dashboardData.appointmentStatus.cancelled, color: 'hsl(var(--destructive))' },
    { name: 'No Show', value: dashboardData.appointmentStatus.noShow, color: 'hsl(var(--muted))' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Button onClick={fetchDashboard} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Appointments"
          value={dashboardData.stats.totalAppointments}
          icon={Calendar}
          description={dashboardData.stats.label}
          variant="primary"
        />
        <StatsCard
          title="Completed"
          value={dashboardData.stats.completed}
          icon={CheckCircle}
          description={`${dashboardData.stats.pending} pending`}
          variant="success"
        />
        <StatsCard
          title="Waiting Queue"
          value={dashboardData.stats.waitingQueue}
          icon={Clock}
          description={dashboardData.stats.queueLabel}
          variant="warning"
        />
        <StatsCard
          title="Active Staff"
          value={dashboardData.stats.activeStaff}
          icon={Users}
          description={`${dashboardData.stats.staffOnLeave} on leave`}
          variant="info"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Staff Load Chart */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Staff Load</h3>
              <p className="text-sm text-muted-foreground">
                Today&apos;s appointment distribution
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="name"
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
                  <Bar
                    dataKey="capacity"
                    fill="hsl(var(--muted))"
                    radius={[4, 4, 0, 0]}
                    name="Capacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No staff data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Status Pie */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Appointment Status</h3>
              <p className="text-sm text-muted-foreground">Today&apos;s breakdown</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No appointments today</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Upcoming Appointments</h3>
              <p className="text-sm text-muted-foreground">Today&apos;s schedule</p>
            </div>
            <Link href="/appointments">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.upcomingAppointments.length > 0 ? (
              dashboardData.upcomingAppointments.map((appointment) => (
                <div key={appointment?.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{appointment?.customerName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {appointment?.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {appointment?.service?.name}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {appointment?.staff?.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(appointment?.appointmentDateTime), 'hh:mm a')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No upcoming appointments
              </p>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Activity Log</h3>
              <p className="text-sm text-muted-foreground">Recent actions</p>
            </div>
            <Link href="/activity">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {dashboardData.activityLog.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="rounded-lg p-2 bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{log.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{log.relativeTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Overview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Staff Overview</h3>
            <p className="text-sm text-muted-foreground">
              Current capacity and availability
            </p>
          </div>
          <Link href="/staff">
            <Button variant="outline" size="sm">
              Manage Staff
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData.staffOverview.map((staff) => (
            <div key={staff.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{staff.name}</h4>
                  <p className="text-sm text-muted-foreground">{staff.staffType}</p>
                </div>
                <Badge
                  variant={staff.availabilityStatus === 'AVAILABLE' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {staff.availabilityStatus}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Today&apos;s Load</span>
                  <span className="font-medium">
                    {staff.todaysLoad}/{staff.capacity}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{
                      width: `${(staff.todaysLoad / staff.capacity) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
