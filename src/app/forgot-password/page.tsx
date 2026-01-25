"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarClock, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { forgotPassword } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await forgotPassword({ email });

    if (result.success) {
      toast.success("Reset code sent to your email!");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } else {
      toast.error(result.error || "Failed to send reset code");
    }
    setIsLoading(false);
  };

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
            <h1 className="text-2xl font-bold">Forgot password?</h1>
            <p className="text-muted-foreground mt-2">
              Enter your email and we&apos;ll send you a reset code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 gradient-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Send Reset Code
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:flex-1 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <Lock className="h-16 w-16 mx-auto mb-6 animate-float" />
          <h2 className="text-3xl font-bold mb-4">Reset Your Password</h2>
          <p className="text-primary-foreground/80">
            Don&apos;t worry! It happens. Enter your email and we&apos;ll send
            you a code to reset your password.
          </p>
        </div>
      </div>
    </div>
  );
}
