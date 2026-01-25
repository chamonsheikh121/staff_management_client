import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Briefcase, Clock, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useServiceStore, useActivityLogStore, Service } from '@/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const staffTypeColors = {
  Doctor: 'bg-info/10 text-info border-info/20',
  Consultant: 'bg-success/10 text-success border-success/20',
  'Support Agent': 'bg-warning/10 text-warning border-warning/20',
};

const durationColors = {
  15: 'bg-success/10 text-success',
  30: 'bg-info/10 text-info',
  60: 'bg-warning/10 text-warning',
};

export default function ServicesPage() {
  const { services, addService, updateService, deleteService } = useServiceStore();
  const { addLog } = useActivityLogStore();

  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<Service['duration']>(30);
  const [requiredStaffType, setRequiredStaffType] = useState<Service['requiredStaffType']>('Doctor');

  const resetForm = () => {
    setName('');
    setDuration(30);
    setRequiredStaffType('Doctor');
    setEditingService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingService) {
      updateService(editingService.id, {
        name,
        duration,
        requiredStaffType,
      });
      addLog(`Service "${name}" updated`, 'status');
      toast.success('Service updated');
    } else {
      addService({
        name,
        duration,
        requiredStaffType,
      });
      addLog(`New service "${name}" added`, 'create');
      toast.success('Service added');
    }

    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDuration(service.duration);
    setRequiredStaffType(service.requiredStaffType);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    const service = services.find((s) => s.id === id);
    deleteService(id);
    addLog(`Service "${service?.name}" removed`, 'cancel');
    toast.success('Service removed');
  };

  const filteredServices = useMemo(() => {
    if (!searchQuery) return services;
    return services.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Services</h1>
            <p className="text-muted-foreground">Manage your service offerings</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Edit Service' : 'Add Service'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., General Consultation"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={duration.toString()}
                    onValueChange={(value) => setDuration(Number(value) as Service['duration'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffType">Required Staff Type</Label>
                  <Select
                    value={requiredStaffType}
                    onValueChange={(value: Service['requiredStaffType']) => setRequiredStaffType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Doctor">Doctor</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                      <SelectItem value="Support Agent">Support Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-primary text-primary-foreground">
                    {editingService ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div
                key={service.id}
                className="group rounded-xl border bg-card p-5 transition-all hover-lift"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(service)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(service.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-semibold mt-4">{service.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="outline" className={cn(staffTypeColors[service.requiredStaffType])}>
                    {service.requiredStaffType}
                  </Badge>
                  <Badge className={cn(durationColors[service.duration])}>
                    <Clock className="h-3 w-3 mr-1" />
                    {service.duration} min
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No services found
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
