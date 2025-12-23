'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldX,
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
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  resendOtpAction,
  verifyOtpAction,
} from '@/server-action/ValidateLicense/verifyOtp';
import {
  verifyLicenseSignature,
  LicenseVerificationPayload,
} from '@/libs/signature';

// Skema Zod untuk validasi form
const OTPSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 characters.' }),
});
type OTPSchemaType = z.infer<typeof OTPSchema>;

// Konstanta untuk manajemen cooldown & rate limiting
const COOLDOWN_STORAGE_KEY = 'cooldown_license_otp';
const DAILY_LIMIT_STORAGE_KEY = 'daily_limit_license_otp';
const DAILY_LIMIT_COUNT = 10;

// Helper untuk memformat waktu
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

// Fungsi untuk mendapatkan state awal cooldown dari localStorage
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

// Tipe untuk status verifikasi link awal
type VerificationStatus = 'pending' | 'valid' | 'invalid' | 'expired';

export function VerifyLicenseOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signature = searchParams.get('signature') || '';

  // State untuk menangani verifikasi signature yang asinkron
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>('pending');
  const [payload, setPayload] = useState<LicenseVerificationPayload | null>(
    null,
  );

  const [isVerifying, startVerifyTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  const [isVerified, setIsVerified] = useState(false);

  // State untuk cooldown
  const [cooldownState, setCooldownState] = useState(getInitialState);
  const { sessionResendCount, dailyResendCount, remainingTime } = cooldownState;
  const isInCooldown = remainingTime > 0;

  useEffect(() => {
    if (!signature) {
      // Ditangani oleh render logic, jadi kita keluar dari efek.
      return;
    }

    const checkSignature = async () => {
      // ===== PERBAIKAN DI SINI =====
      // Reset status ke 'pending' di dalam fungsi async.
      // Ini menandakan dimulainya operasi verifikasi.
      setVerificationStatus('pending');
      setPayload(null);

      const result = await verifyLicenseSignature(signature);

      // Logika setelah verifikasi selesai
      if (!result.valid) {
        setVerificationStatus('invalid');
      } else if (result.expired) {
        setVerificationStatus('expired');
      } else if (result.payload) {
        setPayload(result.payload);
        setVerificationStatus('valid');
      } else {
        setVerificationStatus('invalid');
      }
    };

    checkSignature();
  }, [signature]);

  const getDelayForAttempt = useCallback((attempt: number) => {
    const baseDelay = 30; // 30 detik
    const multiplier = Math.pow(2, Math.min(attempt, 9)); // Batasi multiplier
    return baseDelay * multiplier;
  }, []);

  // Efek untuk timer cooldown
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

  const form = useForm<OTPSchemaType>({
    resolver: zodResolver(OTPSchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = (data: OTPSchemaType) => {

    if (!signature) {
      toast.error('Invalid session. Please start over.');
      return;
    }

    startVerifyTransition(async () => {
      const result = await verifyOtpAction({
        ...data,
        signature: signature,
      });

      if (!result.success) {
        const message = Array.isArray(result.message)
          ? result.message.join(', ')
          : result.message || 'An unknown error occurred.';
        toast.error(message);
        form.setError('otp', { type: 'manual', message });
      } else {
        toast.success('License activated successfully!');
        localStorage.removeItem(COOLDOWN_STORAGE_KEY);
        localStorage.removeItem(DAILY_LIMIT_STORAGE_KEY);
        setIsVerified(true);
        if (result.url) {
          setTimeout(() => router.push(result.url!), 2000);
        }
      }
    });
  };

  const handleResend = () => {
    if (isInCooldown || isResending || !signature) return;

    if (dailyResendCount >= DAILY_LIMIT_COUNT) {
      const msg = 'You have reached the daily limit for resending OTPs.';
      toast.error(msg);
      return;
    }

    startResendTransition(async () => {
      const result = await resendOtpAction(signature);

      if (!result.success || !result.data) {
        toast.error(result.message || 'Failed to resend OTP.');
      } else {
        toast.success('A new OTP has been sent.');
        const newUrl = `${window.location.hostname + '/signup'
          }?signature=${encodeURIComponent(result.data.newSignature)}`;
        window.history.replaceState({ ...window.history.state }, '', newUrl);

        form.reset();

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

  const onInvalidSubmit = (errors: FieldErrors<OTPSchemaType>) => {
    // Ambil pesan error dari field 'licenseKey' dan tampilkan sebagai toast
    if (errors.otp) {
      toast.error(errors.otp.message);
    }
    // Jika ada field lain, Anda bisa menambahkan 'else if' di sini
  };

  // Logika Render: Menangani kasus sinkron terlebih dahulu
  if (!signature) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <ShieldX className="w-12 h-12 text-destructive mb-2" />
          <CardTitle className="text-destructive">Invalid Link</CardTitle>
          <CardDescription>
            The verification link is missing or invalid. Please{' '}
            <a href="/validate-license" className="underline">
              request a new one
            </a>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Tampilan saat signature sedang diverifikasi
  if (verificationStatus === 'pending') {
    return (
      <Card className="w-full max-w-[480px] gap-8 px-5 py-12 rounded-[40px]">
        <CardContent className="flex justify-center items-center flex-col">
          <Loader2 className="mx-auto text-primary w-16 h-16 animate-spin" />
          <h3 className="text-xl font-semibold mt-4">Verifying Link...</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please wait while we validate your session.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Tampilan jika signature tidak valid atau sudah kedaluwarsa
  if (verificationStatus === 'invalid' || verificationStatus === 'expired') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <ShieldX className="w-12 h-12 text-destructive mb-2" />
          <CardTitle className="text-destructive">
            {verificationStatus === 'expired' ? 'Link Expired' : 'Invalid Link'}
          </CardTitle>
          <CardDescription>
            This verification link is no longer valid. Please{' '}
            <a href="/validate-license" className="underline">
              request a new one
            </a>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Tampilan setelah OTP berhasil diverifikasi
  if (isVerified) {
    return (
      <Card className="w-full max-w-[480px] gap-8 px-5 py-12 rounded-[40px]">
        <CardContent className="flex justify-center items-center flex-col">
          <CheckCircle2 className="mx-auto text-green-500 w-16 h-16" />
          <h3 className="text-xl font-semibold mt-4">Activation Successful!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Redirecting you to the login page...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Tampilan utama formulir OTP
  return (
    <Card className="w-full max-w-[480px] gap-8 px-2 py-12 rounded-[40px]">
      <CardHeader className="flex justify-center items-center flex-col">
        <CardTitle className="font-jakarta flex justify-center items-center text-[32px] font-extrabold">
          Check Your Email
        </CardTitle>
        <CardDescription className="font-sans text-center text-[16px] flex-col flex justify-center items-center">
          <p>Please enter the six digit verification code we sent to</p>
          <span className="text-[20px] font-bold text-[#FD4F13]">
            {payload?.email}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
            className="space-y-6"
          >
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
                            className="rounded-[14px] first:rounded-[14px] last:rounded-[14px] data-[active=true]:ring-1 data-[active=true]:ring-[#FD4F13] h-[50px] w-[50px]"
                            index={index}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                </FormItem>
              )}
            />



            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full bg-[#2E2E2E] h-[50px] text-white font-light rounded-[13px] font-sans text-[16px]"
                disabled={isVerifying || isResending}
              >
                {isVerifying && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Activate License
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
