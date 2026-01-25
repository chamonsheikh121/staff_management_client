import { cn } from '@/lib/utils';
import { Appointment, Staff, Service } from '@/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MoreVertical, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppointmentCardProps {
  appointment: Appointment;
  staff?: Staff;
  service?: Service;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: Appointment['status']) => void;
  compact?: boolean;
}

const statusConfig = {
  Scheduled: { class: 'status-scheduled', label: 'Scheduled' },
  Completed: { class: 'status-completed', label: 'Completed' },
  Cancelled: { class: 'status-cancelled', label: 'Cancelled' },
  'No-Show': { class: 'status-noshow', label: 'No-Show' },
};

export function AppointmentCard({
  appointment,
  staff,
  service,
  onEdit,
  onDelete,
  onStatusChange,
  compact = false,
}: AppointmentCardProps) {
  const config = statusConfig[appointment.status];

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{appointment.customerName}</p>
            <p className="text-xs text-muted-foreground">{appointment.time}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn('text-xs', config.class)}>
          {config.label}
        </Badge>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover-lift">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{appointment.customerName}</h3>
            <p className="text-sm text-muted-foreground">{service?.name || 'Unknown Service'}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {appointment.date}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {appointment.time}
              </div>
            </div>
            {staff && (
              <p className="mt-2 text-sm">
                <span className="text-muted-foreground">Staff:</span>{' '}
                <span className="font-medium">{staff.name}</span>
              </p>
            )}
            {!staff && appointment.queuePosition && (
              <p className="mt-2 text-sm text-warning font-medium">
                In Queue (Position: {appointment.queuePosition})
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(config.class)}>
            {config.label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onStatusChange && appointment.status === 'Scheduled' && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange('Completed')}>
                    <CheckCircle className="h-4 w-4 mr-2 text-success" />
                    Mark Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('No-Show')}>
                    <XCircle className="h-4 w-4 mr-2 text-warning" />
                    Mark No-Show
                  </DropdownMenuItem>
                </>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
