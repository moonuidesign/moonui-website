'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { verifyEmail } from '@/server-action/VerifyEmail/verifyEmail';
import { sendOTPEmail } from '@/server-action/VerifyEmail/sendOTP';

// Skema Zod untuk form OTP
const OTPSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 characters.' }),
});
type OTPSchemaType = z.infer<typeof OTPSchema>;
const getInitialCooldownState = () => {
  if (typeof window === 'undefined') {
    return { resendCount: 0, remainingTime: 0, isInCooldown: false };
  }

  const savedData = localStorage.getItem('resendVerifyEmail');
  if (savedData) {
    const {
      resendCount: savedResendCount,
      cooldownStart,
      cooldownTime,
    } = JSON.parse(savedData);
    const now = Date.now();
    const elapsed = Math.floor((now - cooldownStart) / 1000);

    if (elapsed < cooldownTime) {
      return {
        resendCount: savedResendCount,
        remainingTime: cooldownTime - elapsed,
        isInCooldown: true,
      };
    }
    localStorage.removeItem('resendVerifyEmail');
  }
  return { resendCount: 0, remainingTime: 0, isInCooldown: false };
};

export default function VerifyEmailOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [isVerifying, startVerifyTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Initialize state using the helper function to avoid effect
  const [cooldownState, setCooldownState] = useState(getInitialCooldownState);
  const { resendCount, remainingTime, isInCooldown } = cooldownState;

  // Setter for state to simplify updates
  const setResendCount = (count: number) =>
    setCooldownState((prev) => ({ ...prev, resendCount: count }));
  const setRemainingTime = (time: number) =>
    setCooldownState((prev) => ({ ...prev, remainingTime: time }));
  const setIsInCooldown = (cooldown: boolean) =>
    setCooldownState((prev) => ({ ...prev, isInCooldown: cooldown }));

  // Fungsi untuk menghitung penundaan berdasarkan jumlah percobaan
  const getDelayForAttempt = useCallback(() => {
    const baseDelay = 30; // 30 detik penundaan dasar
    const multiplier = Math.pow(2, Math.min(resendCount, 9)); // eksponensial backoff
    return baseDelay * multiplier;
  }, [resendCount]);

  // Efek untuk menangani timer cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isInCooldown && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(remainingTime - 1);
        if (remainingTime <= 1) {
          setIsInCooldown(false);
          localStorage.removeItem('resendVerifyEmail');
          if (timer) clearInterval(timer);
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInCooldown, remainingTime]);

  const form = useForm<OTPSchemaType>({
    resolver: zodResolver(OTPSchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = (data: OTPSchemaType) => {
    setError(null);
    startVerifyTransition(async () => {
      const result = await verifyEmail({ ...data, email });
      if (!result.success) {
        const errorMessage = Array.isArray(result.message)
          ? result.message.join(', ')
          : result.message || 'An unknown error occurred.';
        setError(errorMessage);
        form.setError('otp', {
          type: 'manual',
          message: errorMessage,
        });
      } else {
        toast.success('Email verified successfully!');
        setIsVerified(true);
        setTimeout(() => router.push('/dashboard/monitoring'), 2000);
      }
    });
  };

  const handleResend = () => {
    if (isInCooldown) return;

    const dailyData = localStorage.getItem('dailyResendLimit');
    const today = new Date().toDateString();
    let dailyCount = 0;

    if (dailyData) {
      const { count, date } = JSON.parse(dailyData);
      if (date === today) dailyCount = count;
    }

    if (dailyCount >= 10) {
      toast.error('You have reached the daily limit for resending OTPs.');
      return;
    }

    setError(null);
    startResendTransition(async () => {
      const result = await sendOTPEmail({ email });
      if (!result.success) {
        toast.error(
          (Array.isArray(result.message)
            ? result.message.join(', ')
            : result.message) || 'Failed to resend OTP.',
        );
      } else {
        toast.success('A new OTP has been sent.');
        const newDailyCount = dailyCount + 1;
        localStorage.setItem(
          'dailyResendLimit',
          JSON.stringify({ count: newDailyCount, date: today }),
        );
        setResendCount(newDailyCount);

        const delay = getDelayForAttempt();
        localStorage.setItem(
          'resendVerifyEmail',
          JSON.stringify({
            resendCount: newDailyCount,
            cooldownStart: Date.now(),
            cooldownTime: delay,
          }),
        );
        setRemainingTime(delay);
        setIsInCooldown(true);
        form.reset();
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  if (!email) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Invalid Link</CardTitle>
          <CardDescription>
            The verification link is missing an email. Please{' '}
            <a href="/register" className="underline">
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
      <Card className="w-full max-w-[480px] gap-8 px-5 py-12 rounded-[40px]">
        <CardContent className="flex justify-center items-center flex-col">
          <CheckCircle2 className="mx-auto text-green-500 w-16 h-16" />
          <h3 className="text-xl font-semibold">Email Verified!</h3>
          <p className="text-sm text-muted-foreground">
            Redirecting you to the dashboard...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[480px] gap-8 px-2 py-12 rounded-[40px]">
      <CardHeader className="flex justify-center items-center flex-col">
        <CardTitle className="font-jakarta flex justify-center items-center text-[32px] font-extrabold">
          Check Your Email
        </CardTitle>
        <CardDescription className="font-sans text-center text-[16px] flex-col flex justify-center items-center">
          <p>Please enter the six digit verification code we sent to</p>
          <span className="text-[20px] font-bold text-[#FD4F13]">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      {...field}
                      className="flex justify-center items-center"
                    >
                      <InputOTPGroup className="gap-2 flex justify-center items-center flex-row">
                        {[...Array(6)].map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            className="rounded-[14px] shadow-none border bg-[#F7F7F7] data-[active=true]:ring-1 data-[active=true]:ring-[#FD4F13] h-[50px] w-[50px]"
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
                className="w-full bg-[#2E2E2E] h-[50px] text-white font-light rounded-[13px] font-sans text-[16px]"
                disabled={isVerifying || isResending}
              >
                {isVerifying && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify Email
              </Button>

              <div className="flex flex-row gap-2 text-[16px] justify-center items-center">
                <span className="font-normal text-[#707070]">
                  Didn&apos;t receive the code?
                </span>
                <Button
                  type="button"
                  variant="link"
                  className="font-medium hover:underline p-0 h-auto"
                  onClick={handleResend}
                  disabled={isVerifying || isResending || isInCooldown}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : isInCooldown ? (
                    <span className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
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
