'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Activity,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Settings,
  AlertTriangle,
  RefreshCw,
  User,
  Briefcase,
  LogIn,
  LogOut,
  Mail,
  Key,
  Edit,
  Trash2,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  operation: string;
  description: string;
  timestamp: string;
  appointmentId?: string;
  appointment?: {
    id: string;
    customerName: string;
    status: string;
    service: {
      name: string;
    };
    staff?: {
      name: string;
    };
  };
}

type ActivityCategory = 'all' | 'user' | 'staff' | 'appointment' | 'service' | 'system';

const activityConfig: Record<string, { icon: any; color: string; category: ActivityCategory }> = {
  // User actions
  USER_REGISTERED: { icon: UserPlus, color: 'text-blue-500', category: 'user' },
  USER_LOGIN: { icon: LogIn, color: 'text-green-500', category: 'user' },
  USER_LOGOUT: { icon: LogOut, color: 'text-gray-500', category: 'user' },
  USER_EMAIL_VERIFIED: { icon: Mail, color: 'text-green-500', category: 'user' },
  USER_PASSWORD_RESET: { icon: Key, color: 'text-orange-500', category: 'user' },
  USER_PROFILE_UPDATED: { icon: Edit, color: 'text-blue-500', category: 'user' },
  
  // Staff actions
  STAFF_CREATED: { icon: UserPlus, color: 'text-green-500', category: 'staff' },
  STAFF_UPDATED: { icon: Edit, color: 'text-blue-500', category: 'staff' },
  STAFF_DELETED: { icon: Trash2, color: 'text-red-500', category: 'staff' },
  STAFF_STATUS_CHANGED: { icon: Settings, color: 'text-orange-500', category: 'staff' },
  
  // Appointment actions
  APPOINTMENT_CREATED: { icon: Calendar, color: 'text-green-500', category: 'appointment' },
  APPOINTMENT_UPDATED: { icon: Edit, color: 'text-blue-500', category: 'appointment' },
  APPOINTMENT_CANCELLED: { icon: XCircle, color: 'text-red-500', category: 'appointment' },
  APPOINTMENT_COMPLETED: { icon: CheckCircle, color: 'text-green-500', category: 'appointment' },
  APPOINTMENT_NO_SHOW: { icon: AlertTriangle, color: 'text-orange-500', category: 'appointment' },
  
  // Service actions
  SERVICE_CREATED: { icon: Briefcase, color: 'text-green-500', category: 'service' },
  SERVICE_UPDATED: { icon: Edit, color: 'text-blue-500', category: 'service' },
  SERVICE_DELETED: { icon: Trash2, color: 'text-red-500', category: 'service' },
  
  // System actions
  SYSTEM_ERROR: { icon: XCircle, color: 'text-red-500', category: 'system' },
  SYSTEM_WARNING: { icon: AlertTriangle, color: 'text-orange-500', category: 'system' },
  OTHER: { icon: Activity, color: 'text-gray-500', category: 'system' },
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ActivityCategory>('all');

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/activity-logs');
      const data = await response.json();

      if (data.success && data.data) {
        setLogs(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.appointment?.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((log) => {
        const config = activityConfig[log.action];
        return config?.category === filterCategory;
      });
    }

    return filtered;
  }, [logs, searchQuery, filterCategory]);

  const getCategoryCount = (category: ActivityCategory) => {
    if (category === 'all') return logs.length;
    return logs.filter((log) => activityConfig[log.action]?.category === category).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground">Track all actions and changes</p>
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
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground">Track all actions and changes</p>
        </div>
        <Button onClick={fetchActivityLogs} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search activity..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={filterCategory} onValueChange={(v) => setFilterCategory(v as ActivityCategory)}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="all">
            All ({getCategoryCount('all')})
          </TabsTrigger>
          <TabsTrigger value="user">
            <User className="h-4 w-4 mr-1.5" />
            User ({getCategoryCount('user')})
          </TabsTrigger>
          <TabsTrigger value="staff">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Staff ({getCategoryCount('staff')})
          </TabsTrigger>
          <TabsTrigger value="appointment">
            <Calendar className="h-4 w-4 mr-1.5" />
            Appointment ({getCategoryCount('appointment')})
          </TabsTrigger>
          <TabsTrigger value="service">
            <Briefcase className="h-4 w-4 mr-1.5" />
            Service ({getCategoryCount('service')})
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="h-4 w-4 mr-1.5" />
            System ({getCategoryCount('system')})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Log List */}
      <div className="space-y-2">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const config = activityConfig[log.action] || activityConfig.OTHER;
            const Icon = config.icon;

            return (
              <div key={log.id} className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-2.5 bg-muted ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                        {log.appointment && (
                          <Badge variant="secondary" className="text-xs">
                            {log.appointment.status}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy hh:mm a')}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{log.description}</p>
                    {log.appointment && (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {log.appointment.customerName}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5" />
                          {log.appointment.service.name}
                        </div>
                        {log.appointment.staff && (
                          <div className="flex items-center gap-1.5">
                            <UserPlus className="h-3.5 w-3.5" />
                            {log.appointment.staff.name}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 rounded-xl border bg-card">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Activity</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterCategory !== 'all'
                ? 'No matching activity found'
                : 'Activity will appear here as actions are performed'}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {logs.length > 0 && (
        <div className="text-sm text-muted-foreground text-center mt-4">
          Showing {filteredLogs.length} of {logs.length} activities
        </div>
      )}
    </div>
  );
}
