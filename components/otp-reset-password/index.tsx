'use client';

import { useState, useTransition, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { extractDataFromSignature } from '@/libs/signature';
import { verifyOTPForgotPassword } from '@/server-action/ForgotPassword/verifyOTP';
import { sendOTPForgotPassword } from '@/server-action/ForgotPassword/sendOTP';

// Skema Zod
const OTPSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 characters.' }),
});
type OTPSchemaType = z.infer<typeof OTPSchema>;

// Konstanta
const COOLDOWN_STORAGE_KEY = 'cooldown_forgot_password';
const DAILY_LIMIT_STORAGE_KEY = 'daily_limit_forgot_password';
const DAILY_LIMIT_COUNT = 10;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Initializer function to read from localStorage without an effect
const getInitialState = () => {
  const initialState = {
    sessionResendCount: 0,
    dailyResendCount: 0,
    remainingTime: 0,
  };

  // This check prevents errors during server-side rendering
  if (typeof window === 'undefined') {
    return initialState;
  }

  // 1. Initialize daily limit
  const dailyDataRaw = localStorage.getItem(DAILY_LIMIT_STORAGE_KEY);
  const today = new Date().toDateString();
  if (dailyDataRaw) {
    const { count, date } = JSON.parse(dailyDataRaw);
    if (date === today) {
      initialState.dailyResendCount = count;
    } else {
      localStorage.removeItem(DAILY_LIMIT_STORAGE_KEY); // It's a new day
    }
  }

  // 2. Initialize cooldown
  const cooldownDataRaw = localStorage.getItem(COOLDOWN_STORAGE_KEY);
  if (cooldownDataRaw) {
    const { count, start, delay } = JSON.parse(cooldownDataRaw);
    const elapsed = Math.floor((Date.now() - start) / 1000);
    if (elapsed < delay) {
      initialState.sessionResendCount = count;
      initialState.remainingTime = delay - elapsed;
    } else {
      initialState.sessionResendCount = count; // Keep count for next exponential backoff
      localStorage.removeItem(COOLDOWN_STORAGE_KEY);
    }
  }

  return initialState;
};

export default function VerifyForgotPasswordOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSignature = searchParams.get('signature') || '';

  const [isVerifying, startVerifyTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(3);

  // State for cooldown and limits, initialized lazily
  const [cooldownState, setCooldownState] = useState(getInitialState);
  const { sessionResendCount, dailyResendCount, remainingTime } = cooldownState;
  const isInCooldown = remainingTime > 0;

  const email = useMemo(() => {
    if (!activeSignature) return '';
    try {
      const { data } = extractDataFromSignature(activeSignature);
      return data?.email || '';
    } catch {
      return '';
    }
  }, [activeSignature]);

  const getDelayForAttempt = useCallback((attempt: number) => {
    const baseDelay = 30; // 30 seconds
    const multiplier = Math.pow(2, Math.min(attempt, 9));
    return baseDelay * multiplier;
  }, []);

  // Effect for the cooldown timer
  useEffect(() => {
    if (!isInCooldown) return;
    const timer = setInterval(() => {
      setCooldownState((prev) => ({
        ...prev,
        remainingTime: prev.remainingTime > 1 ? prev.remainingTime - 1 : 0,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [isInCooldown]);

  useEffect(() => {
    if (!isVerified) return;
    const timer = setInterval(() => {
      setSuccessCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(
            `/forgot-password/reset-password?signature=${encodeURIComponent(activeSignature)}`,
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isVerified, activeSignature, router]);

  const form = useForm<OTPSchemaType>({
    resolver: zodResolver(OTPSchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = (data: OTPSchemaType) => {
    setError(null);
    startVerifyTransition(async () => {
      const result = await verifyOTPForgotPassword({
        ...data,
        signature: activeSignature,
      });

      if (!result.success) {
        const message =
          typeof result.message === 'string' ? result.message : 'An unknown error occurred.';
        setError(message);
        form.setError('otp', { type: 'manual', message });
      } else {
        toast.success('OTP verification successful!');
        localStorage.removeItem(COOLDOWN_STORAGE_KEY);
        localStorage.removeItem(DAILY_LIMIT_STORAGE_KEY);
        setIsVerified(true);
      }
    });
  };

  const handleResend = () => {
    if (isInCooldown || isResending || !email) return;

    if (dailyResendCount >= DAILY_LIMIT_COUNT) {
      setError('You have reached the daily limit for resending OTPs.');
      return;
    }

    setError(null);
    startResendTransition(async () => {
      const result = await sendOTPForgotPassword({ email });

      if (!result.success || !result.url) {
        const message =
          typeof result.message === 'string' ? result.message : 'Failed to resend OTP.';
        toast.error(message);
        setError(message);
      } else {
        toast.success('A new verification code has been sent.');
        form.reset();
        router.replace(result.url);

        const newSessionCount = sessionResendCount + 1;
        const newDailyCount = dailyResendCount + 1;
        const delay = getDelayForAttempt(newSessionCount - 1);

        setCooldownState({
          sessionResendCount: newSessionCount,
          dailyResendCount: newDailyCount,
          remainingTime: delay,
        });

        localStorage.setItem(
          COOLDOWN_STORAGE_KEY,
          JSON.stringify({ count: newSessionCount, start: Date.now(), delay }),
        );
        localStorage.setItem(
          DAILY_LIMIT_STORAGE_KEY,
          JSON.stringify({
            count: newDailyCount,
            date: new Date().toDateString(),
          }),
        );
      }
    });
  };

  if (!activeSignature || !email) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Session Invalid</CardTitle>
          <CardDescription>
            The link is missing or invalid. Please{' '}
            <a href="/forgot-password" className="underline">
              start over
            </a>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isVerified) {
    return (
      <Card className="w-full max-w-[480px] gap-8 rounded-[40px] px-5 py-12">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h3 className="mt-4 text-xl font-semibold">Verification Successful!</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Redirecting you to reset your password in {successCountdown}s...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[480px] gap-8 rounded-[40px] px-2 py-12">
      <CardHeader className="flex flex-col items-center justify-center">
        <CardTitle className="font-jakarta flex items-center justify-center text-[32px] font-extrabold">
          Check Your Email
        </CardTitle>
        <CardDescription className="flex flex-col items-center justify-center text-center font-sans text-[16px]">
          <p>Please enter the six digit code we sent to</p>
          <span className="text-[20px] font-bold text-[#FD4F13]">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex w-full items-center justify-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP maxLength={6} {...field} className="flex items-center justify-center">
                      <InputOTPGroup className="flex flex-row items-center justify-center gap-2">
                        {[...Array(6)].map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            className="h-[50px] w-[50px] rounded-[14px] data-[active=true]:ring-1 data-[active=true]:ring-[#FD4F13]"
                            index={index}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="h-[50px] w-full rounded-[13px] bg-[#2E2E2E] font-sans text-[16px] font-light text-white hover:bg-black"
                disabled={isVerifying || isResending}
              >
                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>

              <div className="flex flex-row items-center justify-center gap-2 text-[16px]">
                <span className="font-normal text-[#707070]">Didn&apos;t receive the code?</span>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 font-medium hover:underline"
                  onClick={handleResend}
                  disabled={
                    isVerifying ||
                    isResending ||
                    isInCooldown ||
                    dailyResendCount >= DAILY_LIMIT_COUNT
                  }
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : isInCooldown ? (
                    <span className="text-muted-foreground flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      Resend in {formatTime(remainingTime)}
                    </span>
                  ) : (
                    'Resend'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
