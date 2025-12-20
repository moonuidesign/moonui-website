'use client';

import {
  useState,
  useTransition,
  useEffect,
  Suspense,
  useCallback,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  Lock,
  Clock,
} from 'lucide-react';

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
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  validateInviteToken,
  sendInviteOTP,
  completeRegistration,
} from '@/server-action/Auth/register-invite';

// --- SCHEMA ---
const registerSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    otp: z.string().length(6, 'OTP must be 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterSchemaType = z.infer<typeof registerSchema>;

// --- CONSTANTS ---
const COOLDOWN_STORAGE_KEY = 'cooldown_invite_otp';
const DAILY_LIMIT_STORAGE_KEY = 'daily_limit_invite_otp';
const DAILY_LIMIT_COUNT = 10;

// --- HELPERS ---
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

const getInitialState = () => {
  const initialState = {
    sessionResendCount: 0,
    dailyResendCount: 0,
    remainingTime: 0,
  };

  if (typeof window === 'undefined') {
    return initialState;
  }

  // Cek batas harian
  const dailyDataRaw = localStorage.getItem(DAILY_LIMIT_STORAGE_KEY);
  const today = new Date().toDateString();
  if (dailyDataRaw) {
    const { count, date } = JSON.parse(dailyDataRaw);
    if (date === today) {
      initialState.dailyResendCount = count;
    } else {
      localStorage.removeItem(DAILY_LIMIT_STORAGE_KEY);
    }
  }

  // Cek cooldown sesi saat ini
  const cooldownDataRaw = localStorage.getItem(COOLDOWN_STORAGE_KEY);
  if (cooldownDataRaw) {
    const { count, start, delay } = JSON.parse(cooldownDataRaw);
    const elapsed = Math.floor((Date.now() - start) / 1000);
    if (elapsed < delay) {
      initialState.sessionResendCount = count;
      initialState.remainingTime = delay - elapsed;
    } else {
      initialState.sessionResendCount = count;
      localStorage.removeItem(COOLDOWN_STORAGE_KEY);
    }
  }

  return initialState;
};

// --- COMPONENT ---
function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isValidating, setIsValidating] = useState(true);
  const [inviteData, setInviteData] = useState<{
    valid: boolean;
    email?: string;
    error?: string;
  } | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [isSendingOtp, startSendingOtp] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // State for cooldown and limits
  const [cooldownState, setCooldownState] = useState(getInitialState);
  const { sessionResendCount, dailyResendCount, remainingTime } = cooldownState;
  const isInCooldown = remainingTime > 0;

  const getDelayForAttempt = useCallback((attempt: number) => {
    const baseDelay = 30; // 30 detik
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

  // Validate Token on Mount
  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setInviteData({ valid: false, error: 'Missing invitation token' });
        setIsValidating(false);
        return;
      }
      try {
        const result = await validateInviteToken(token);
        setInviteData(result);
      } catch (err) {
        setInviteData({ valid: false, error: 'Failed to validate token' });
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [token]);

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      otp: '',
    },
  });

  const handleSendOTP = () => {
    if (!token) return;

    if (dailyResendCount >= DAILY_LIMIT_COUNT) {
      const msg = 'You have reached the daily limit for resending OTPs.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setError(null);
    startSendingOtp(async () => {
      try {
        const result = await sendInviteOTP(token);
        if (result.error) {
          setError(result.error);
          toast.error(result.error);
        } else {
          setOtpSent(true);
          toast.success(result.success || 'OTP sent successfully');

          // Update cooldown state and localStorage
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
            JSON.stringify({
              count: newSessionCount,
              start: Date.now(),
              delay,
            }),
          );
          localStorage.setItem(
            DAILY_LIMIT_STORAGE_KEY,
            JSON.stringify({
              count: newDailyCount,
              date: new Date().toDateString(),
            }),
          );
        }
      } catch (err) {
        setError('Something went wrong sending the OTP.');
      }
    });
  };

  const onSubmit = (data: RegisterSchemaType) => {
    if (!token) return;

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);
      formData.append('otp', data.otp);

      try {
        const result = await completeRegistration(null, formData);

        if (result?.error) {
          setError(result.error);
          toast.error(result.error);
        } else {
          setIsSuccess(true);
          toast.success(result?.success || 'Registration successful!');
          localStorage.removeItem(COOLDOWN_STORAGE_KEY);
          localStorage.removeItem(DAILY_LIMIT_STORAGE_KEY);
          setTimeout(() => {
            router.push('/signin');
          }, 2000);
        }
      } catch (err) {
        setError('Failed to complete registration.');
      }
    });
  };

  // --- RENDERING STATES ---

  if (isValidating) {
    return (
      <Card className="w-full max-w-md p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Validating invitation...</span>
      </Card>
    );
  }

  if (!inviteData?.valid || !token) {
    return (
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-6 w-6" /> Invalid Link
          </CardTitle>
          <CardDescription>
            {inviteData?.error ||
              'The invitation link is invalid or has expired.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please ask your administrator to send a new invitation.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-[480px] gap-8 px-5 py-12 rounded-[40px] border-green-200 bg-green-50/50">
        <CardContent className="flex justify-center items-center flex-col">
          <CheckCircle2 className="mx-auto text-green-500 w-16 h-16" />
          <h3 className="text-xl font-semibold mt-4 text-green-700">
            Registration Complete!
          </h3>
          <p className="text-sm text-green-600 mt-2">
            Your account has been set up successfully.
          </p>
          <p className="text-xs text-green-600/80 mt-1">
            Redirecting to login...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[480px] gap-8 px-2 py-12 rounded-[40px] shadow-xl">
      <CardHeader className="flex justify-center items-center flex-col pb-2">
        <CardTitle className="font-jakarta flex justify-center items-center text-[32px] font-extrabold text-center">
          Accept Invitation
        </CardTitle>
        <CardDescription className="font-sans text-center text-[16px] flex-col flex justify-center items-center mt-2">
          <span className="text-muted-foreground">Invitation for</span>
          <span className="text-[20px] font-bold text-primary mt-1">
            {inviteData.email}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full pt-6">
        {!otpSent ? (
          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-xl border border-dashed text-center">
              <p className="text-sm text-muted-foreground mb-4">
                To proceed with your registration and set up your password, we
                need to verify your email address.
              </p>
              <Button
                onClick={handleSendOTP}
                disabled={
                  isSendingOtp ||
                  isInCooldown ||
                  dailyResendCount >= DAILY_LIMIT_COUNT
                }
                className="w-full h-[50px] text-lg font-light rounded-[13px]"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending
                    Code...
                  </>
                ) : isInCooldown ? (
                  <span className="flex items-center justify-center">
                    <Clock className="h-5 w-5 mr-2" /> Resend in{' '}
                    {formatTime(remainingTime)}
                  </span>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" /> Send Verification Code
                  </>
                )}
              </Button>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit code to{' '}
                  <strong>{inviteData.email}</strong>
                </p>
              </div>

              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center block text-muted-foreground">
                      Enter OTP Code
                    </FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        {...field}
                        className="flex justify-center items-center"
                      >
                        <InputOTPGroup className="gap-2 flex justify-center items-center flex-row w-full">
                          {[...Array(6)].map((_, index) => (
                            <InputOTPSlot
                              key={index}
                              className="rounded-[12px] shadow-sm border bg-background h-[50px] w-[50px] text-lg"
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

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Set Password</span>
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="New Password"
                          className="h-[50px] rounded-[13px]"
                          {...field}
                        />
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
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm Password"
                          className="h-[50px] rounded-[13px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#2E2E2E] h-[50px] text-white font-light rounded-[13px] font-sans text-[16px] hover:bg-black/90"
                  disabled={isPending}
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Complete Registration
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={handleSendOTP}
                  disabled={
                    isSendingOtp ||
                    isPending ||
                    isInCooldown ||
                    dailyResendCount >= DAILY_LIMIT_COUNT
                  }
                >
                  {isSendingOtp ? (
                    'Resending...'
                  ) : isInCooldown ? (
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> Resend in{' '}
                      {formatTime(remainingTime)}
                    </span>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

function FormSkeleton() {
  return (
    <div className="w-full max-w-md h-auto p-5 flex flex-col justify-center items-center mx-auto animate-pulse">
      <div className="w-full text-center space-y-3 mb-8">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mx-auto"></div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="bg-[#E8E8E8] h-screen">
      <div className="dark:bg-black w-screen container mx-auto h-screen max-w-[1440px] max-h-[1024px] flex justify-center items-center">
        <div className="w-full flex h-[80%] min-h-[650px] justify-center item-center backdrop-blur-xs bg-opacity-40 rounded-xl p-5 ">
          <Suspense fallback={<FormSkeleton />}>
            <InviteForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
