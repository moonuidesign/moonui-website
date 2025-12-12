'use client';

import { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  registerInvite,
  resendInviteOtp,
} from '@/server-action/Auth/register-invite';

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

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const signature = searchParams.get('signature');

  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      otp: '',
    },
  });

  const onSubmit = (data: RegisterSchemaType) => {
    if (!email || !signature) {
      setError('Invalid invitation link. Missing email or signature.');
      return;
    }

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('signature', signature);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);
      formData.append('otp', data.otp);

      const result = await registerInvite(null, formData);

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setIsSuccess(true);
        toast.success(result.success);
        setTimeout(() => {
          router.push('/signin'); // Redirect to login
        }, 2000);
      }
    });
  };

  const handleResend = () => {
    if (!email || !signature) return;

    startResendTransition(async () => {
      const result = await resendInviteOtp(email, signature);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('OTP resent successfully');
        // If signature changed, we might need to update URL, but handled in action return if needed?
        // The action returns newSignature.
        if (result.newSignature) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('signature', result.newSignature);
          window.history.replaceState({}, '', newUrl.toString());
        }
      }
    });
  };

  if (!email || !signature) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Invalid Link</CardTitle>
          <CardDescription>
            The invitation link is invalid or missing information.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-[480px] gap-8 px-5 py-12 rounded-[40px]">
        <CardContent className="flex justify-center items-center flex-col">
          <CheckCircle2 className="mx-auto text-green-500 w-16 h-16" />
          <h3 className="text-xl font-semibold mt-4">Registration Complete!</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Redirecting to login...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[480px] gap-8 px-2 py-12 rounded-[40px]">
      <CardHeader className="flex justify-center items-center flex-col">
        <CardTitle className="font-jakarta flex justify-center items-center text-[32px] font-extrabold text-center">
          Accept Invitation
        </CardTitle>
        <CardDescription className="font-sans text-center text-[16px] flex-col flex justify-center items-center">
          <p>Set your password and enter the code sent to</p>
          <span className="text-[20px] font-bold text-[#FD4F13]">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-center block">OTP Code</FormLabel>
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
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register & Accept
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
                  disabled={isPending || isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
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
