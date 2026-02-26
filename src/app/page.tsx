'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  CalendarClock,
  Users,
  Clock,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: CalendarClock,
    title: 'Smart Scheduling',
    description: 'Intelligent appointment booking with automatic conflict detection and resolution.',
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Track staff availability, capacity, and assign appointments effortlessly.',
  },
  {
    icon: Clock,
    title: 'Queue Management',
    description: 'Automated waiting queue with position tracking and instant assignment.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Comprehensive dashboard with insights on appointments and staff performance.',
  },
];

const benefits = [
  'Reduce wait times by 40%',
  'Automatic conflict detection',
  'Real-time staff availability',
  'Smart queue prioritization',
  'Activity tracking & logs',
  'Mobile-friendly interface',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary">
                <CalendarClock className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Appoint M.</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button className="gradient-primary text-primary-foreground hover:opacity-90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Smart Appointment Management
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up">
            Streamline Your
            <span className="text-gradient"> Appointments </span>
            <br />& Queue Management
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Powerful scheduling system with intelligent staff assignment, real-time queue management,
            and comprehensive analytics. Perfect for clinics, consultancies, and service centers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/signup">
              <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 h-12 px-8 text-base">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Appointments Managed' },
              { value: '500+', label: 'Active Businesses' },
              { value: '99.9%', label: 'Uptime Guarantee' },
              { value: '40%', label: 'Time Saved' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to
              <span className="text-gradient"> Manage Appointments</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete solution for scheduling, staff management, and customer queue handling.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl border bg-card hover-lift"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Why Choose
                <span className="text-gradient"> QueueMaster?</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Our intelligent system handles the complexities of appointment scheduling,
                so you can focus on delivering excellent service to your customers.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/10">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-info/20 p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="p-4 rounded-xl bg-card shadow-soft">
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <p className="font-semibold">Secure</p>
                    <p className="text-xs text-muted-foreground">Enterprise-grade security</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card shadow-soft">
                    <Zap className="h-8 w-8 text-warning mb-2" />
                    <p className="font-semibold">Fast</p>
                    <p className="text-xs text-muted-foreground">Lightning quick setup</p>
                  </div>
                  <div className="col-span-2 p-4 rounded-xl bg-card shadow-soft">
                    <BarChart3 className="h-8 w-8 text-info mb-2" />
                    <p className="font-semibold">Analytics</p>
                    <p className="text-xs text-muted-foreground">Deep insights into your operations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 sm:p-12 lg:p-16 text-center">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Transform Your Scheduling?
              </h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join hundreds of businesses that have streamlined their appointment management with QueueMaster.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
                <CalendarClock className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">QueueMaster</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 QueueMaster. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
