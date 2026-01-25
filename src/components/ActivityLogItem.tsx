import { cn } from '@/lib/utils';
import { ActivityLog as ActivityLogType } from '@/store';
import { Calendar, UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLogItemProps {
  log: ActivityLogType;
}

const typeConfig = {
  assignment: { icon: UserPlus, class: 'bg-info/10 text-info' },
  queue: { icon: Clock, class: 'bg-warning/10 text-warning' },
  status: { icon: CheckCircle, class: 'bg-success/10 text-success' },
  create: { icon: Calendar, class: 'bg-primary/10 text-primary' },
  cancel: { icon: XCircle, class: 'bg-destructive/10 text-destructive' },
};

export function ActivityLogItem({ log }: ActivityLogItemProps) {
  const config = typeConfig[log.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={cn('rounded-lg p-2', config.class)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{log.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
