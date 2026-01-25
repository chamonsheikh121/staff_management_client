import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { AppointmentCard } from "@/components/AppointmentCard";
import { StaffCard } from "@/components/StaffCard";
import { ActivityLogItem } from "@/components/ActivityLogItem";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle,
  Users,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useAppointmentStore,
  useStaffStore,
  useServiceStore,
  useActivityLogStore,
} from "@/store";
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
} from "recharts";

export default function DashboardPage() {
  const { appointments } = useAppointmentStore();
  const { staff } = useStaffStore();
  const { services } = useServiceStore();
  const { logs } = useActivityLogStore();

  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const todayAppointments = appointments.filter((a) => a.date === today);
    const scheduled = todayAppointments.filter(
      (a) => a.status === "Scheduled",
    ).length;
    const completed = todayAppointments.filter(
      (a) => a.status === "Completed",
    ).length;
    const inQueue = appointments.filter(
      (a) => a.staffId === null && a.status === "Scheduled",
    ).length;

    return {
      total: todayAppointments.length,
      scheduled,
      completed,
      inQueue,
    };
  }, [appointments, today]);

  const staffLoad = useMemo(() => {
    return staff.map((s) => {
      const todayAppointments = appointments.filter(
        (a) =>
          a.staffId === s.id && a.date === today && a.status !== "Cancelled",
      ).length;
      return {
        ...s,
        appointmentsToday: todayAppointments,
      };
    });
  }, [staff, appointments, today]);

  const chartData = useMemo(() => {
    return staffLoad
      .filter((s) => s.availabilityStatus === "Available")
      .map((s) => ({
        name: s.name.split(" ")[0],
        appointments: s.appointmentsToday,
        capacity: s.dailyCapacity,
      }));
  }, [staffLoad]);

  const pieData = useMemo(() => {
    return [
      { name: "Scheduled", value: stats.scheduled, color: "hsl(var(--info))" },
      {
        name: "Completed",
        value: stats.completed,
        color: "hsl(var(--success))",
      },
      { name: "In Queue", value: stats.inQueue, color: "hsl(var(--warning))" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === today && a.status === "Scheduled" && a.staffId)
      .slice(0, 4);
  }, [appointments, today]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Appointments"
            value={stats.total}
            icon={Calendar}
            description="Today"
            variant="primary"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            description={`${stats.scheduled} pending`}
            variant="success"
          />
          <StatsCard
            title="Waiting Queue"
            value={stats.inQueue}
            icon={Clock}
            description="Awaiting assignment"
            variant="warning"
          />
          <StatsCard
            title="Active Staff"
            value={
              staff.filter((s) => s.availabilityStatus === "Available").length
            }
            icon={Users}
            description={`${staff.filter((s) => s.availabilityStatus === "On Leave").length} on leave`}
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={8}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
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
            </div>
          </div>

          {/* Appointment Status Pie */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Appointment Status</h3>
                <p className="text-sm text-muted-foreground">
                  Today&apos;s breakdown
                </p>
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
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No appointments today</p>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
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
                <p className="text-sm text-muted-foreground">
                  Today&apos;s schedule
                </p>
              </div>
              <Link to="/appointments">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    staff={staff.find((s) => s.id === appointment.staffId)}
                    service={services.find(
                      (s) => s.id === appointment.serviceId,
                    )}
                    compact
                  />
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
              <Link to="/activity">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-1">
              {logs.slice(0, 5).map((log) => (
                <ActivityLogItem key={log.id} log={log} />
              ))}
            </div>
          </div>
        </div>

        {/* Staff Summary */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Staff Overview</h3>
              <p className="text-sm text-muted-foreground">
                Current capacity and availability
              </p>
            </div>
            <Link to="/staff">
              <Button variant="outline" size="sm">
                Manage Staff
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffLoad.slice(0, 3).map((s) => (
              <StaffCard
                key={s.id}
                staff={s}
                appointmentsToday={s.appointmentsToday}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
