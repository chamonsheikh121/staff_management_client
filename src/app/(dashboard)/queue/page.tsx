'use client';

import { useState, useEffect } from 'react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Clock, Calendar, UserPlus, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface StaffType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  requiredStaffTypeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  requiredStaffType: StaffType;
}

interface QueueAppointment {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceId: string;
  staffId: string | null;
  appointmentDateTime: string;
  status: string;
  isInQueue: boolean;
  queuePosition: number;
  createdAt: string;
  updatedAt: string;
  service: Service;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  staffTypeId: string;
  dailyCapacity: number;
  todaysAppointments: number;
  totalAppointments: number;
  staffType: {
    id: string;
    name: string;
  };
}

export default function QueuePage() {
  const [queueItems, setQueueItems] = useState<QueueAppointment[]>([]);
  const [staffByAppointment, setStaffByAppointment] = useState<Record<string, Staff[]>>({});
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments/queue');
      const data = await response.json();

      if (data.success && data.data) {
        setQueueItems(data.data);
        
        // Fetch staff for each appointment's service type
        const staffPromises = data.data.map(async (appointment: QueueAppointment) => {
          if (appointment.service?.requiredStaffTypeId) {
            try {
              const staffResponse = await fetch(
                `/api/staff/by-staff-type/${appointment.service.requiredStaffTypeId}`
              );
              const staffData = await staffResponse.json();
              return {
                appointmentId: appointment.id,
                staff: staffData.success ? staffData.data : [],
              };
            } catch (error) {
              console.error('Error fetching staff:', error);
              return { appointmentId: appointment.id, staff: [] };
            }
          }
          return { appointmentId: appointment.id, staff: [] };
        });

        const staffResults = await Promise.all(staffPromises);
        const staffMap: Record<string, Staff[]> = {};
        staffResults.forEach((result) => {
          staffMap[result.appointmentId] = result.staff;
        });
        setStaffByAppointment(staffMap);
      } else {
        toast.error(data.message || 'Failed to fetch queue');
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast.error('Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAutoAssign = async (appointmentId: string) => {
    try {
      setAssigningId(appointmentId);
      const response = await fetch(`/api/appointments/${appointmentId}/auto-assign`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Staff assigned successfully');
        await fetchQueue();
      } else {
        toast.error(data.message || 'Failed to auto-assign staff');
      }
    } catch (error) {
      console.error('Error auto-assigning:', error);
      toast.error('Failed to auto-assign staff');
    } finally {
      setAssigningId(null);
    }
  };

  const handleManualAssign = async (appointmentId: string, staffId: string) => {
    try {
      setAssigningId(appointmentId);
      const response = await fetch(`/api/appointments/${appointmentId}/assign-staff/${staffId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        const staff = staffByAppointment[appointmentId]?.find((s) => s.id === staffId);
        toast.success(`Assigned to ${staff?.name || 'staff member'}`);
        await fetchQueue();
      } else {
        toast.error(data.message || 'Failed to assign staff');
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error('Failed to assign staff');
    } finally {
      setAssigningId(null);
    }
  };

  const getAvailableStaffCount = () => {
    const allStaff = Object.values(staffByAppointment).flat();
    const uniqueStaff = Array.from(new Set(allStaff.map((s) => s.id))).map((id) =>
      allStaff.find((s) => s.id === id)
    );
    return uniqueStaff.filter(
      (s) => s && s.todaysAppointments < s.dailyCapacity
    ).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Waiting Queue</h1>
          <p className="text-muted-foreground">
            Manage appointments waiting for staff assignment
          </p>
        </div>
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Waiting Queue</h1>
          <p className="text-muted-foreground">
            Manage appointments waiting for staff assignment
          </p>
        </div>
        <Button onClick={fetchQueue} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
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
              <p className="text-2xl font-bold">{getAvailableStaffCount()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-info/10">
              <Calendar className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Wait Time</p>
              <p className="text-2xl font-bold">
                {queueItems.length > 0
                  ? `${Math.round(
                      queueItems.reduce((acc, item) => {
                        const wait =
                          (new Date().getTime() - new Date(item.createdAt).getTime()) /
                          (1000 * 60);
                        return acc + wait;
                      }, 0) / queueItems.length
                    )} min`
                  : '0 min'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        {queueItems.length > 0 ? (
          queueItems.map((item, index) => {
            const eligibleStaff = staffByAppointment[item.id] || [];
            const availableStaff = eligibleStaff.filter(
              (s) => s.todaysAppointments < s.dailyCapacity
            );

            return (
              <div key={item.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-warning/10">
                        <span className="text-lg font-bold text-warning">
                          {item.queuePosition || index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{item.customerName}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.service?.name || 'Unknown Service'} •{' '}
                        {item.service?.requiredStaffType?.name || 'No staff type'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(item.appointmentDateTime), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(item.appointmentDateTime), 'hh:mm a')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {availableStaff.length > 0 ? (
                      <>
                        <Select
                          onValueChange={(value) => handleManualAssign(item.id, value)}
                          disabled={assigningId === item.id}
                        >
                          <SelectTrigger className="w-full sm:w-[220px]">
                            <SelectValue placeholder="Select staff manually" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStaff.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} - {s.staffType.name} ({s.todaysAppointments}/
                                {s.dailyCapacity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => handleAutoAssign(item.id)}
                          disabled={assigningId === item.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {assigningId === item.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Auto Assign
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-destructive text-sm px-3 py-2 bg-destructive/10 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        <span>No staff available ({eligibleStaff.length} total)</span>
                      </div>
                    )}
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
  );
}
