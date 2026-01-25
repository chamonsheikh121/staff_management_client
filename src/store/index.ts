import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  serviceType: 'Doctor' | 'Consultant' | 'Support Agent';
  dailyCapacity: number;
  availabilityStatus: 'Available' | 'On Leave';
  avatar?: string;
}

export interface Service {
  id: string;
  name: string;
  duration: 15 | 30 | 60;
  requiredStaffType: Staff['serviceType'];
}

export interface Appointment {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceId: string;
  staffId: string | null;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';
  createdAt: string;
  queuePosition?: number;
}

export interface ActivityLog {
  id: string;
  message: string;
  timestamp: string;
  type: 'assignment' | 'queue' | 'status' | 'create' | 'cancel';
}

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user: User) => {
        set({
          user,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Theme Store
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
);

// Staff Store
interface StaffState {
  staff: Staff[];
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
}

const initialStaff: Staff[] = [
  { id: '1', name: 'Dr. Riya Sharma', serviceType: 'Doctor', dailyCapacity: 5, availabilityStatus: 'Available' },
  { id: '2', name: 'Farhan Ahmed', serviceType: 'Consultant', dailyCapacity: 5, availabilityStatus: 'Available' },
  { id: '3', name: 'Priya Patel', serviceType: 'Support Agent', dailyCapacity: 5, availabilityStatus: 'Available' },
  { id: '4', name: 'Dr. Amit Kumar', serviceType: 'Doctor', dailyCapacity: 5, availabilityStatus: 'On Leave' },
  { id: '5', name: 'Sarah Wilson', serviceType: 'Consultant', dailyCapacity: 5, availabilityStatus: 'Available' },
];

export const useStaffStore = create<StaffState>()(
  persist(
    (set) => ({
      staff: initialStaff,
      addStaff: (newStaff) =>
        set((state) => ({
          staff: [...state.staff, { ...newStaff, id: crypto.randomUUID() }],
        })),
      updateStaff: (id, updatedStaff) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, ...updatedStaff } : s)),
        })),
      deleteStaff: (id) =>
        set((state) => ({
          staff: state.staff.filter((s) => s.id !== id),
        })),
    }),
    { name: 'staff-storage' }
  )
);

// Services Store
interface ServiceState {
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
}

const initialServices: Service[] = [
  { id: '1', name: 'General Consultation', duration: 30, requiredStaffType: 'Doctor' },
  { id: '2', name: 'Health Check-up', duration: 60, requiredStaffType: 'Doctor' },
  { id: '3', name: 'Business Consultation', duration: 30, requiredStaffType: 'Consultant' },
  { id: '4', name: 'Technical Support', duration: 15, requiredStaffType: 'Support Agent' },
  { id: '5', name: 'Follow-up Visit', duration: 15, requiredStaffType: 'Doctor' },
];

export const useServiceStore = create<ServiceState>()(
  persist(
    (set) => ({
      services: initialServices,
      addService: (newService) =>
        set((state) => ({
          services: [...state.services, { ...newService, id: crypto.randomUUID() }],
        })),
      updateService: (id, updatedService) =>
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...updatedService } : s)),
        })),
      deleteService: (id) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        })),
    }),
    { name: 'services-storage' }
  )
);

// Appointments Store
interface AppointmentState {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => string;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  assignFromQueue: (appointmentId: string, staffId: string) => void;
}

const today = new Date().toISOString().split('T')[0];
const initialAppointments: Appointment[] = [
  { id: '1', customerName: 'John Doe', serviceId: '1', staffId: '1', date: today, time: '09:00', status: 'Scheduled', createdAt: new Date().toISOString() },
  { id: '2', customerName: 'Jane Smith', serviceId: '2', staffId: '1', date: today, time: '10:00', status: 'Completed', createdAt: new Date().toISOString() },
  { id: '3', customerName: 'Mike Johnson', serviceId: '3', staffId: '2', date: today, time: '09:30', status: 'Scheduled', createdAt: new Date().toISOString() },
  { id: '4', customerName: 'Emily Brown', serviceId: '1', staffId: '1', date: today, time: '11:00', status: 'Scheduled', createdAt: new Date().toISOString() },
  { id: '5', customerName: 'David Wilson', serviceId: '4', staffId: '3', date: today, time: '14:00', status: 'Scheduled', createdAt: new Date().toISOString() },
  { id: '6', customerName: 'Lisa Anderson', serviceId: '1', staffId: null, date: today, time: '15:00', status: 'Scheduled', createdAt: new Date().toISOString(), queuePosition: 1 },
  { id: '7', customerName: 'Tom Harris', serviceId: '3', staffId: null, date: today, time: '15:30', status: 'Scheduled', createdAt: new Date().toISOString(), queuePosition: 2 },
  { id: '8', customerName: 'Sarah Davis', serviceId: '2', staffId: '1', date: today, time: '13:00', status: 'Cancelled', createdAt: new Date().toISOString() },
];

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set) => ({
      appointments: initialAppointments,
      addAppointment: (newAppointment) => {
        const id = crypto.randomUUID();
        set((state) => ({
          appointments: [
            ...state.appointments,
            { ...newAppointment, id, createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },
      updateAppointment: (id, updatedAppointment) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, ...updatedAppointment } : a
          ),
        })),
      deleteAppointment: (id) =>
        set((state) => ({
          appointments: state.appointments.filter((a) => a.id !== id),
        })),
      assignFromQueue: (appointmentId, staffId) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId
              ? { ...a, staffId, queuePosition: undefined }
              : a
          ),
        })),
    }),
    { name: 'appointments-storage' }
  )
);

// Activity Log Store
interface ActivityLogState {
  logs: ActivityLog[];
  addLog: (message: string, type: ActivityLog['type']) => void;
  clearLogs: () => void;
}

const initialLogs: ActivityLog[] = [
  { id: '1', message: 'Appointment for "John Doe" scheduled with Dr. Riya Sharma', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'create' },
  { id: '2', message: 'Appointment for "Jane Smith" marked as completed', timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'status' },
  { id: '3', message: 'Lisa Anderson added to waiting queue (Position: 1)', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'queue' },
  { id: '4', message: 'Tom Harris added to waiting queue (Position: 2)', timestamp: new Date(Date.now() - 600000).toISOString(), type: 'queue' },
];

export const useActivityLogStore = create<ActivityLogState>()(
  persist(
    (set) => ({
      logs: initialLogs,
      addLog: (message, type) =>
        set((state) => ({
          logs: [
            { id: crypto.randomUUID(), message, timestamp: new Date().toISOString(), type },
            ...state.logs,
          ].slice(0, 50),
        })),
      clearLogs: () => set({ logs: [] }),
    }),
    { name: 'activity-log-storage' }
  )
);
