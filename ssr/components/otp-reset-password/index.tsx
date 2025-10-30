'use client';

import type React from 'react';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import * as z from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { DynamicBreadcrumb } from '../breadCrumb';

import { extractDataFromSignature } from '@/libs/signature';
import { verifyOTPForgotPassword } from '@/serverAction/ForgotPassword/verifyOTP';
import { sendOTPForgotPassword } from '@/serverAction/ForgotPassword/sendOTP';

// Skema Zod statis
const verificationOTPSchema = z.object({
  otp: z
    .string()
    .min(6, { message: 'Your one-time password must be 6 characters.' }),
});

type VerificationOTPSchema = z.infer<typeof verificationOTPSchema>;

// Konstanta untuk kunci localStorage
const COOLDOWN_STORAGE_KEY = 'cooldown_forgot_password';
const DAILY_LIMIT_STORAGE_KEY = 'daily_limit_forgot_password';
const DAILY_LIMIT_COUNT = 10;
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

export default function VerifyFogotPasswordOTPForm() {
  const router = useRouter();
  const params = useSearchParams();
  const activeSignature = params?.get('signature') ?? '';

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(5);

  // State untuk pembatasan
  const [sessionResendCount, setSessionResendCount] = useState(0); // Untuk exponential backoff
  const [dailyResendCount, setDailyResendCount] = useState(0); // Untuk batas harian
  const [cooldownTime, setCooldownTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const isInCooldown = remainingTime > 0;

  // Ekstrak email dari signature dengan aman
  const email = useMemo(() => {
    if (!activeSignature) return '';
    const { data } = extractDataFromSignature(activeSignature);
    return data?.email || '';
  }, [activeSignature]);

  // Fungsi untuk menghitung jeda eksponensial
  const getDelayForAttempt = useCallback((attempt: number) => {
    const baseDelay = 30; // 30 detik
    // 2^0=1, 2^1=2, 2^2=4, ... max 2^9
    const multiplier = Math.pow(2, Math.min(attempt, 9));
    return baseDelay * multiplier;
  }, []);

  // Efek untuk inisialisasi state pembatasan dari localStorage
  useEffect(() => {
    // 1. Inisialisasi batas harian
    const dailyDataRaw = localStorage.getItem(DAILY_LIMIT_STORAGE_KEY);
    const today = new Date().toDateString();
    if (dailyDataRaw) {
      const { count, date } = JSON.parse(dailyDataRaw);
      if (date === today) {
        setDailyResendCount(count);
      } else {
        localStorage.removeItem(DAILY_LIMIT_STORAGE_KEY);
      }
    }

    // 2. Inisialisasi cooldown
    const cooldownDataRaw = localStorage.getItem(COOLDOWN_STORAGE_KEY);
    if (cooldownDataRaw) {
      const { count, start, delay } = JSON.parse(cooldownDataRaw);
      const elapsed = Math.floor((Date.now() - start) / 1000);
      if (elapsed < delay) {
        setSessionResendCount(count);
        setCooldownTime(delay);
        setRemainingTime(delay - elapsed);
      } else {
        // Cooldown selesai, tapi simpan jumlah percobaan sesi
        setSessionResendCount(count);
        localStorage.removeItem(COOLDOWN_STORAGE_KEY);
      }
    }
  }, []);

  // Efek untuk timer cooldown
  useEffect(() => {
    if (!isInCooldown) return;
    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isInCooldown]);

  // Efek untuk countdown setelah verifikasi sukses
  useEffect(() => {
    if (!verified) return;
    const timer = setInterval(() => {
      setSuccessCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(
            `/forgot-password/reset-password?signature=${encodeURIComponent(
              activeSignature,
            )}`,
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [verified, activeSignature, router]);

  const form = useForm<VerificationOTPSchema>({
    resolver: zodResolver(verificationOTPSchema),
    defaultValues: { otp: '' },
  });

  async function onSubmit(data: VerificationOTPSchema) {
    if (!activeSignature) {
      toast.error('Invalid token. Please start over.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyOTPForgotPassword({
        ...data,
        signature: activeSignature,
      });
      if (!result.success) {
        toast.error(result.message as string);
        form.setError('otp', {
          type: 'manual',
          message: result.message as string,
        });
      } else {
        toast.success('OTP verification successful!');
        localStorage.removeItem(COOLDOWN_STORAGE_KEY);
        localStorage.removeItem(DAILY_LIMIT_STORAGE_KEY);
        setVerified(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (isInCooldown || isResending || !email) return;

    // Cek batas harian sebelum melakukan apa pun
    if (dailyResendCount >= DAILY_LIMIT_COUNT) {
      toast.error('You have reached the daily limit for resending OTPs.');
      return;
    }

    setIsResending(true);
    try {
      const result = await sendOTPForgotPassword({ email });
      if (!result.success || !result.url) {
        toast.error(result.message as string);
      } else {
        toast.success('A new verification code has been sent.');
        form.reset();
        router.replace(result.url); // Perbarui URL dengan signature baru

        // Update state dan localStorage untuk pembatasan
        const newSessionCount = sessionResendCount + 1;
        const newDailyCount = dailyResendCount + 1;
        const today = new Date().toDateString();

        setSessionResendCount(newSessionCount);
        setDailyResendCount(newDailyCount);

        const delay = getDelayForAttempt(newSessionCount - 1); // attempt 0 -> 2^0
        setCooldownTime(delay);
        setRemainingTime(delay);

        // Simpan data cooldown sesi
        localStorage.setItem(
          COOLDOWN_STORAGE_KEY,
          JSON.stringify({
            count: newSessionCount,
            start: Date.now(),
            delay: delay,
          }),
        );

        // Simpan data batas harian
        localStorage.setItem(
          DAILY_LIMIT_STORAGE_KEY,
          JSON.stringify({
            count: newDailyCount,
            date: today,
          }),
        );
      }
    } catch (error: unknown) {
      console.error('Failed to resend OTP:', error);
      toast.error(
        'An error occurred while resending the code. Please try again.',
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 justify-center items-center md:h-[calc(100vh-30vh)] w-full md:px-0 md:py-5 lg:px-10">
      <div className="w-full flex">
        <DynamicBreadcrumb />
      </div>
      <Card className="w-full max-w-md h-auto p-5 flex flex-col justify-center items-center mx-auto">
        <CardHeader className="w-full text-center space-y-2">
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a 6-digit verification code to your email address.
            {email && <span className="font-semibold block mt-1">{email}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full pt-4">
          {verified ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="mx-auto text-green-500 w-16 h-16" />
              <h3 className="text-xl font-semibold">
                OTP Verification Successful
              </h3>
              <p className="text-sm text-muted-foreground">
                Redirecting you in {successCountdown} seconds...
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">
                        One-Time Password
                      </FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup className="w-full flex justify-center gap-2">
                            {[...Array(6)].map((_, index) => (
                              <InputOTPSlot
                                key={index}
                                index={index}
                                className="w-10 h-10 md:w-12 md:h-12"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || isResending}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>

                  <div className="text-center text-sm space-y-2">
                    {isInCooldown ? (
                      <div className="space-y-2">
                        <Progress
                          value={(remainingTime / cooldownTime) * 100}
                          className="h-1"
                        />
                        <p className="text-muted-foreground flex items-center justify-center">
                          <Clock className="h-4 w-4 mr-1.5" />
                          Resend available in {formatTime(remainingTime)}
                        </p>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto"
                        onClick={handleResend}
                        disabled={
                          isResending || dailyResendCount >= DAILY_LIMIT_COUNT
                        }
                      >
                        {isResending
                          ? 'Resending...'
                          : "Didn't receive the code? Resend"}
                      </Button>
                    )}
                  </div>

                  {dailyResendCount >= DAILY_LIMIT_COUNT && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Daily Limit Reached</AlertTitle>
                      <AlertDescription>
                        You have tried to resend the code too many times. Please
                        try again tomorrow.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
