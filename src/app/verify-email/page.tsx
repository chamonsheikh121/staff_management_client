'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarClock, Mail, ArrowRight, Loader2, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { verifyEmail, resendOTP } from '@/app/actions/auth';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!email) {
      router.push('/signup');
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await verifyEmail({ email, otp });
    
    if (result.success) {
      toast.success('Email verified successfully! You can now login.');
      window.location.href = '/login';
    } else {
      toast.error(result.error || 'Verification failed');
    }
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    const result = await resendOTP({ email });
    
    if (result.success) {
      toast.success('OTP has been resent to your email');
    } else {
      toast.error(result.error || 'Failed to resend OTP');
    }
    setIsResending(false);
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary">
                <CalendarClock className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">QueueMaster</span>
            </Link>
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="text-muted-foreground mt-2">
              We&apos;ve sent a verification code to
            </p>
            <p className="text-sm font-medium mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="pl-10 h-11"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 gradient-primary text-primary-foreground"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={handleResendOTP}
              disabled={isResending}
            >
              {isResending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <RotateCw className="mr-2 h-5 w-5" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Wrong email?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up again
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:flex-1 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <Mail className="h-16 w-16 mx-auto mb-6 animate-float" />
          <h2 className="text-3xl font-bold mb-4">
            Check Your Email
          </h2>
          <p className="text-primary-foreground/80">
            Enter the verification code we sent to your email to complete your registration.
          </p>
        </div>
      </div>
    </div>
  );
}
