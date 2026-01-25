import { DashboardLayout } from '@/components/DashboardLayout';
import { ActivityLogItem } from '@/components/ActivityLogItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Trash2, Activity } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useActivityLogStore, ActivityLog } from '@/store';
import { toast } from 'sonner';

export default function ActivityPage() {
  const { logs, clearLogs } = useActivityLogStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (searchQuery) {
      filtered = filtered.filter((log) =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((log) => log.type === filterType);
    }

    return filtered;
  }, [logs, searchQuery, filterType]);

  const handleClearLogs = () => {
    clearLogs();
    toast.success('Activity log cleared');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Activity Log</h1>
            <p className="text-muted-foreground">Track all actions and changes</p>
          </div>
          <Button variant="outline" onClick={handleClearLogs} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Log
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Type Tabs */}
        <Tabs value={filterType} onValueChange={setFilterType}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="create">Created</TabsTrigger>
            <TabsTrigger value="assignment">Assignments</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="cancel">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Log List */}
        <div className="rounded-xl border bg-card divide-y divide-border">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <div
                key={log.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ActivityLogItem log={log} />
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Activity</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== 'all'
                  ? 'No matching activity found'
                  : 'Activity will appear here as actions are performed'}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        {logs.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredLogs.length} of {logs.length} activities
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
