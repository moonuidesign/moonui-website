'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';

import { extractDataFromSignature } from '@/libs/signature';
import { resetPassword } from '@/server-action/ResetPassword/resetPassword';
import { DynamicBreadcrumb } from '../dinamis-breadcrumb';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

// Skema Zod statis untuk validasi form
const staticResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string().min(8, {
      message: 'Confirm password must be at least 8 characters long.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'], // Tampilkan error di field confirmPassword
  });

type ResetPasswordSchema = z.infer<typeof staticResetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSignature = searchParams?.get('signature') ?? '';
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(staticResetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const email = useMemo(() => {
    if (!activeSignature) return null;
    const { success, data } = extractDataFromSignature(activeSignature);
    return success ? data?.email : null;
  }, [activeSignature]);

  useEffect(() => {
    if (!isReset) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isReset, router]);

  useEffect(() => {
    if (!activeSignature || !email) {
      toast.error('Invalid or expired password reset link.');
      router.replace('/forgot-password');
    }
  }, [activeSignature, email, router]);

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!email) {
      toast.error('Invalid or expired password reset link.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await resetPassword({
        ...data,
        email,
        signature: activeSignature,
      });
      if (!result.success) {
        toast.error(result.message as string);
      } else {
        toast.success(result.message as string);
        setIsReset(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Validating link...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 justify-center items-center md:h-screen lg:h-auto w-full md:px-0 md:py-5 lg:px-10">
      <div className="w-full max-w-md">
        <DynamicBreadcrumb />
      </div>
      <Card className="w-full h-full max-w-md p-5 flex flex-col justify-center items-center mx-auto">
        <CardHeader className="w-full text-center space-y-2">
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent className="w-full pt-4">
          {isReset ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="mx-auto text-green-500 w-16 h-16" />
              <h3 className="text-xl font-semibold">
                Password Reset Successful
              </h3>
              <p className="text-gray-500">
                Your password has been changed successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                {`Redirecting to login in ${countdown} seconds...`}
              </p>
              <Button
                className="w-full mt-2"
                onClick={() => router.push('/login')}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                <div className="text-center text-sm text-muted-foreground bg-secondary p-2 rounded-md">
                  Resetting password for: <strong>{email}</strong>
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-foreground focus:outline-none"
                            aria-label={
                              showPassword ? 'Hide password' : 'Show password'
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-foreground focus:outline-none"
                            aria-label={
                              showConfirmPassword
                                ? 'Hide password'
                                : 'Show password'
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
