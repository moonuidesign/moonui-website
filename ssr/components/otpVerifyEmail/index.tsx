'use client';

import type React from 'react';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock } from 'lucide-react';
import { verifyEmail } from '@/serverAction/VerifyEmail/verifyEmail';
import { sendOTPEmail } from '@/serverAction/VerifyEmail/sendOTP';
import { DynamicBreadcrumb } from '../breadCrumb';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { FormField, Form, FormItem, FormLabel, FormControl } from '../ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';

// Skema Zod statis
const verifyEmailClientSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 characters long' }),
});

type VerifyEmailClientSchema = z.infer<typeof verifyEmailClientSchema>;

export default function VerifyEmailOTPForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const getDelayForAttempt = useCallback(() => {
    // Penundaan yang dimodifikasi: dimulai dari 30 detik dan berlipat ganda setiap kali, maks 10 upaya
    const baseDelay = 30; // 30 detik penundaan dasar
    const multiplier = Math.pow(2, Math.min(resendCount, 9)); // 2^n hingga 2^9
    return baseDelay * multiplier; // 30, 60, 120, 240, 480, 960, 1920, 3840, 7680, 15360
  }, [resendCount]);

  useEffect(() => {
    const savedData = localStorage.getItem('resendVerifyEmail');
    const dailyData = localStorage.getItem('dailyResendLimit');
    const today = new Date().toDateString();

    let initialResendCount = 0;

    if (dailyData) {
      const { count, date } = JSON.parse(dailyData);
      if (date === today) {
        initialResendCount = count;
      } else {
        // Atur ulang hitungan harian jika ini hari baru
        localStorage.setItem(
          'dailyResendLimit',
          JSON.stringify({
            count: 0,
            date: today,
          }),
        );
      }
    }

    if (savedData) {
      const {
        resendCount: savedResendCount,
        cooldownStart,
        cooldownTime: savedCooldownTime,
      } = JSON.parse(savedData);
      const now = Date.now();
      const elapsed = Math.floor((now - cooldownStart) / 1000);

      if (elapsed < savedCooldownTime) {
        const remaining = savedCooldownTime - elapsed;
        setResendCount(savedResendCount);
        setCooldownTime(savedCooldownTime);
        setRemainingTime(remaining);
        setIsInCooldown(true);
      } else {
        setResendCount(
          savedResendCount > initialResendCount
            ? savedResendCount
            : initialResendCount,
        );
        setIsInCooldown(false);
        localStorage.removeItem('resendVerifyEmail');
      }
    } else {
      setResendCount(initialResendCount);
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isInCooldown && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = prev - 1;

          const savedData = localStorage.getItem('resendVerifyEmail');
          if (savedData) {
            const parsed = JSON.parse(savedData);
            parsed.remainingTime = newTime;
            localStorage.setItem('resendVerifyEmail', JSON.stringify(parsed));
          }

          if (newTime <= 0) {
            setIsInCooldown(false);
            localStorage.removeItem('resendVerifyEmail');
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInCooldown, remainingTime]);

  const form = useForm<VerifyEmailClientSchema>({
    resolver: zodResolver(verifyEmailClientSchema),
  });

  const email = params?.get('email') ?? '';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const onSubmit = useCallback(
    async (data: VerifyEmailClientSchema) => {
      setIsLoading(true);
      try {
        const result = await verifyEmail({ ...data, email });
        if (!result.success) {
          toast.error(result.message);
          setIsLoading(false); // Pastikan untuk mengatur ulang isLoading pada kegagalan
        } else {
          setVerified(true);
          toast.success('Email verified successfully!');
          // Tidak ada pembaruan status pemuatan atau pendinginan di sini karena komponen akan di-unmount/diganti
        }
      } catch {
        toast.error('An unexpected error occurred during verification.');
        setIsLoading(false);
      }
    },
    [email],
  );

  const handleResend = useCallback(async () => {
    const dailyData = localStorage.getItem('dailyResendLimit');
    const today = new Date().toDateString();
    let dailyCount = 0;

    if (dailyData) {
      const { count, date } = JSON.parse(dailyData);
      if (date === today) {
        dailyCount = count;
      }
    }

    if (dailyCount >= 10) {
      toast.error('You have reached the daily limit for resending OTPs.');
      return;
    }

    if (isInCooldown) return;
    setIsLoading(true);

    try {
      const result = await sendOTPEmail({ email });
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success('A new OTP has been sent to your email.');

        const newDailyCount = dailyCount + 1;
        localStorage.setItem(
          'dailyResendLimit',
          JSON.stringify({
            count: newDailyCount,
            date: today,
          }),
        );
        setResendCount(newDailyCount);

        const delay = getDelayForAttempt();
        const now = Date.now();
        localStorage.setItem(
          'resendVerifyEmail',
          JSON.stringify({
            resendCount: newDailyCount,
            cooldownStart: now,
            cooldownTime: delay,
          }),
        );

        setCooldownTime(delay);
        setRemainingTime(delay);
        setIsInCooldown(true);
      }
    } catch {
      toast.error('Failed to resend OTP. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [email, getDelayForAttempt, isInCooldown]);

  return (
    <div className="flex flex-col gap-5 justify-center items-center md:h-[calc(100vh-57vh)] lg:h-[calc(100vh-40vh)] w-full md:px-0 md:py-5 lg:px-10 lg:py-20">
      <div className="w-full flex">
        <DynamicBreadcrumb />
      </div>
      <Card className="w-full h-full p-5 flex  justify-center items-center flex-col">
        <CardHeader className="w-full flex justify-center items-center md:h-[80%] lg:h-[50%]">
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a 6-digit code to your email. Please enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verified ? (
            <div className="text-center p-4  max-w-md mx-auto w-full">
              <div className=" text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2 md:mb-3">
                Email Verified!
              </h3>
              <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-6">
                Your email has been successfully verified. You can now proceed.
              </p>
              <Button
                className="w-full max-w-xs md:max-w-sm mx-auto"
                onClick={() => router.push('/dashboard/monitoring')}
              >
                Go to Dashboard
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
                    name="otp"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password (OTP)</FormLabel>
                        <FormControl>
                          <InputOTP
                            maxLength={6}
                            {...field}
                            className="justify-center items-center flex gap-5"
                          >
                            <InputOTPGroup className="w-full flex justify-center items-center gap-5 ">
                              <InputOTPSlot
                                index={0}
                                className="rounded-md border"
                              />
                              <InputOTPSlot
                                index={1}
                                className="rounded-md border"
                              />
                              <InputOTPSlot
                                index={2}
                                className="rounded-md border"
                              />
                              <InputOTPSlot
                                index={3}
                                className="rounded-md border"
                              />
                              <InputOTPSlot
                                index={4}
                                className="rounded-md border"
                              />
                              <InputOTPSlot
                                index={5}
                                className="rounded-md border"
                              />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="mt-2 flex gap-1 flex-col">
                    <div className="flex justify-center mt-2">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={handleResend}
                        disabled={isInCooldown || isLoading}
                      >
                        {isInCooldown ? (
                          <>
                            <Clock className="h-4 w-4 mr-1" />
                            Resend available in: {formatTime(remainingTime)}
                          </>
                        ) : (
                          "Didn't receive the code? Resend"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
