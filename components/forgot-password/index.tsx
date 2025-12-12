'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import * as z from 'zod';

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
  FormMessage,
} from '../ui/form';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { sendOTPForgotPassword } from '@/server-action/ForgotPassword/sendOTP';

// Definisikan skema Zod secara statis di sini
const sendOTPSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

// Tipe skema
type SendOTPSchema = z.infer<typeof sendOTPSchema>;

export default function ForgotPasswordForm() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [redirectUrl, setRedirectUrl] = useState<string>('');

  const form = useForm<SendOTPSchema>({
    resolver: zodResolver(sendOTPSchema),
    mode: 'onChange',
  });

  // Gunakan useEffect untuk menangani countdown dan redirect
  useEffect(() => {
    if (isSuccess && redirectUrl) {
      // Tampilkan toast hanya sekali saat sukses
      toast.success(`Redirecting in ${countdown} seconds...`);

      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            router.push(redirectUrl);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);

      // Cleanup function untuk membersihkan interval jika komponen unmount
      return () => clearInterval(timer);
    }
  }, [isSuccess, redirectUrl, router, countdown]);

  const onSubmit = async (data: SendOTPSchema) => {
    setIsLoading(true);
    // Locale di-hardcode menjadi 'en'
    const result = await sendOTPForgotPassword(data);
    if (!result.success) {
      toast.error(result.message as string);
    } else {
      setRedirectUrl(result.url as string);
      setIsSuccess(true);
      // Countdown akan di-handle oleh useEffect
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-5 justify-center items-center md:h-[calc(100vh-40vh)] w-full md:px-0 md:py-5 lg:px-10">
      <div className="w-full flex">
        <DynamicBreadcrumb />
      </div>
      <Card className="w-full h-full p-5 flex justify-center items-center flex-col">
        <CardHeader className="w-full flex justify-center items-center text-center">
          <CardTitle className="text-2xl">Forgot Your Password?</CardTitle>
          <CardDescription>
            Enter your email address and we will send you a verification code.
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full h-full">
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="mb-4 text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Check Your Email</h3>
              <p className="text-gray-500 mb-4">
                We have sent a verification code to your email address.
              </p>
              <p className="text-gray-500 mb-4 font-bold">
                Redirecting in {countdown} seconds...
              </p>
              <Button
                className="w-full"
                onClick={() => router.push(redirectUrl)}
              >
                Verify Code Now
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email">Email</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="youremail@example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Send Verification Code'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
