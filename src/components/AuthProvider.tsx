'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

const publicPaths = ['/', '/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Mark as hydrated after store has loaded from localStorage
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // Fallback in case hydration is already complete
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/verify-email') || pathname.startsWith('/reset-password');

    // Redirect to dashboard if authenticated and on public path
    if (isAuthenticated && isPublicPath) {
      router.replace('/dashboard');
    }

    // Redirect to login if not authenticated and on protected path
    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login');
    }
  }, [isAuthenticated, pathname, isHydrated, router]);

  // Show loading spinner until hydrated to prevent flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
