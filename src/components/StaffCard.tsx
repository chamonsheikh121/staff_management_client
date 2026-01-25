import { cn } from '@/lib/utils';
import { Staff } from '@/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, MoreVertical, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StaffCardProps {
  staff: Staff;
  appointmentsToday: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  onClick?: () => void;
}

const serviceTypeColors = {
  Doctor: 'bg-info/10 text-info border-info/20',
  Consultant: 'bg-success/10 text-success border-success/20',
  'Support Agent': 'bg-warning/10 text-warning border-warning/20',
};

export function StaffCard({
  staff,
  appointmentsToday,
  onEdit,
  onDelete,
  onToggleStatus,
  onClick,
}: StaffCardProps) {
  const capacityPercentage = (appointmentsToday / staff.dailyCapacity) * 100;
  const capacityStatus =
    capacityPercentage >= 100
      ? 'full'
      : capacityPercentage >= 80
      ? 'warning'
      : 'ok';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover-lift',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div
              className={cn(
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card',
                staff.availabilityStatus === 'Available' ? 'bg-success' : 'bg-muted'
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold">{staff.name}</h3>
            <Badge variant="outline" className={cn('mt-1', serviceTypeColors[staff.serviceType])}>
              {staff.serviceType}
            </Badge>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Today's Load</span>
                <span
                  className={cn(
                    'font-medium',
                    capacityStatus === 'full' && 'capacity-full',
                    capacityStatus === 'warning' && 'capacity-warning',
                    capacityStatus === 'ok' && 'capacity-ok'
                  )}
                >
                  {appointmentsToday} / {staff.dailyCapacity}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    capacityStatus === 'full' && 'bg-destructive',
                    capacityStatus === 'warning' && 'bg-warning',
                    capacityStatus === 'ok' && 'bg-success'
                  )}
                  style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onEdit && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {onToggleStatus && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}>
                {staff.availabilityStatus === 'Available' ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Set On Leave
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Set Available
                  </>
                )}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Badge
        variant="outline"
        className={cn(
          'absolute top-4 right-14',
          staff.availabilityStatus === 'Available'
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {staff.availabilityStatus}
      </Badge>
    </div>
  );
}
