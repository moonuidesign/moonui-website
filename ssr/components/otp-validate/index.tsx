'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  resendOtpAction,
  verifyOtpAction,
} from '@/serverAction/ValidateLicense/verifyOtp';
import { toast } from 'react-toastify';

// Skema Zod sederhana untuk form
const OTPSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 characters.' }),
});
type OTPSchemaType = z.infer<typeof OTPSchema>;

export function VerifyLicenseOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Signature bisa berubah jika pengguna meminta OTP baru
  const [activeSignature, setActiveSignature] = useState(
    searchParams.get('signature') || '',
  );

  const [isVerifying, startVerifyTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Ekstrak email dari signature dengan aman untuk ditampilkan di UI
  const email = useMemo(() => {
    if (!activeSignature) return '';
    try {
      const payload = JSON.parse(
        Buffer.from(activeSignature.split('.')[1], 'base64').toString(),
      );
      return payload.email || '';
    } catch {
      return 'your email';
    }
  }, [activeSignature]);

  const form = useForm<OTPSchemaType>({
    resolver: zodResolver(OTPSchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = (data: OTPSchemaType) => {
    setError(null);
    if (!activeSignature) {
      setError('Invalid session. Please start over.');
      return;
    }

    startVerifyTransition(async () => {
      const result = await verifyOtpAction({
        ...data,
        signature: activeSignature,
      });

      if (!result.success) {
        setError(
          Array.isArray(result.message)
            ? result.message.join(', ')
            : result.message || 'An unknown error occurred.',
        );
        form.setError('otp', {
          type: 'manual',
          message: Array.isArray(result.message)
            ? result.message.join(', ')
            : result.message || 'An unknown error occurred.',
        });
      } else {
        toast.success('License activated successfully!');
        setIsVerified(true);
        if (result.url) {
          router.push(result.url);
        }
      }
    });
  };

  // Handler untuk kirim ulang OTP
  const handleResend = () => {
    setError(null);
    if (!activeSignature) {
      setError('Invalid session. Please start over.');
      return;
    }

    startResendTransition(async () => {
      const result = await resendOtpAction(activeSignature);

      if (!result.success || !result.data) {
        toast.error(result.message || 'Failed to resend OTP.');
      } else {
        toast.success('A new OTP has been sent.');
        // PENTING: Perbarui signature dengan yang baru dari server
        setActiveSignature(result.data.newSignature);

        // Perbarui URL di browser tanpa me-reload halaman
        const newUrl = `${
          window.location.pathname
        }?signature=${encodeURIComponent(result.data.newSignature)}`;
        window.history.replaceState(
          { ...window.history.state, as: newUrl, url: newUrl },
          '',
          newUrl,
        );

        form.reset(); // Kosongkan input OTP
      }
    });
  };

  if (!activeSignature) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Session Expired</CardTitle>
          <CardDescription>
            The verification link is missing or invalid. Please{' '}
            <a href="/validate-license" className="underline">
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
          <h3 className="text-xl font-semibold">Activation Successful!</h3>
          <p className="text-sm text-muted-foreground">
            Redirecting you to the login page...
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
          <p> Please enter the four digit verification code we sent to</p>
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
                      className=" flex justify-center items-center"
                    >
                      <InputOTPGroup className="gap-2 flex justify-center items-center flex-row">
                        <InputOTPSlot
                          className="first:rounded-[14px] shadow-none border rounded-[14px] data-[active=true]:ring-[1px] data-[active=true]:ring-[#FD4F13] last:rounded-[14px] h-[50px] w-[50px]"
                          index={0}
                        />
                        <InputOTPSlot
                          className="first:rounded-[14px] shadow-none border rounded-[14px] data-[active=true]:ring-[1px] data-[active=true]:ring-[#FD4F13] last:rounded-[14px] h-[50px] w-[50px]"
                          index={1}
                        />
                        <InputOTPSlot
                          className="first:rounded-[14px] shadow-none border rounded-[14px] data-[active=true]:ring-[1px] data-[active=true]:ring-[#FD4F13] last:rounded-[14px] h-[50px] w-[50px]"
                          index={2}
                        />
                        <InputOTPSlot
                          className="first:rounded-[14px] shadow-none border rounded-[14px] data-[active=true]:ring-[1px] data-[active=true]:ring-[#FD4F13] last:rounded-[14px] h-[50px] w-[50px]"
                          index={3}
                        />
                        <InputOTPSlot
                          className="first:rounded-[14px] shadow-none border rounded-[14px] data-[active=true]:ring-[1px] data-[active=true]:ring-[#FD4F13] last:rounded-[14px] h-[50px] w-[50px]"
                          index={4}
                        />
                        <InputOTPSlot
                          className="first:rounded-[14px] shadow-none border rounded-[14px] data-[active=true]:ring-[1px] data-[active=true]:ring-[#FD4F13] last:rounded-[14px] h-[50px] w-[50px]"
                          index={5}
                        />
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
                className="w-full bg-[#2E2E2E] h-[50px] text-white font-light  rounded-[13px] font-sans text-[16px]"
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
                  className="font-medium hover:underline"
                  onClick={handleResend}
                  disabled={isVerifying || isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    `Resend`
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
