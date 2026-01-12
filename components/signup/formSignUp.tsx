// components/auth/register-form.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition, useRef } from 'react';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock1, Sms, User } from 'iconsax-reactjs';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { RegisterSchema, RegisterSchemaType } from '@/types/register';
import { registerWithCredentials, registerWithGoogle } from '@/server-action/Auth/signUp';
import { Input } from '../ui/input';
import { toast } from 'react-toastify';
import { TermsOfUseModal } from './TermsOfUseModal';

interface RegisterFormProps {
  signature?: string;
  email?: string;
  licenseKey?: string;
  termsContent?: string;
}

export function RegisterForm({ signature, email, termsContent }: RegisterFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [submitType, setSubmitType] = useState<'credentials' | 'google'>('credentials');

  // Ref untuk form values saat submit credentials
  const pendingCredentialsRef = useRef<RegisterSchemaType | null>(null);
  // Ref untuk form data saat submit Google
  const pendingGoogleFormDataRef = useRef<FormData | null>(null);

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      signature: signature ?? '',
      email: email ?? '',
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handler saat form credentials di-submit
  const handleCredentialsSubmit = (values: RegisterSchemaType) => {
    // Simpan values, tampilkan modal
    pendingCredentialsRef.current = values;
    setSubmitType('credentials');
    setShowTermsModal(true);
  };

  // Handler saat Google button diklik
  const handleGoogleClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    pendingGoogleFormDataRef.current = formData;
    setSubmitType('google');
    setShowTermsModal(true);
  };

  // Handler saat user setuju dengan Terms of Use
  const handleAgree = () => {
    if (submitType === 'credentials' && pendingCredentialsRef.current) {
      const values = pendingCredentialsRef.current;
      startTransition(async () => {
        const result = await registerWithCredentials(values);
        if (result.error) {
          toast.error(result.error);
          setShowTermsModal(false);
        } else {
          const signInResult = await signIn('credentials', {
            email: values.email,
            password: values.password,
            redirect: false,
          });

          if (signInResult?.ok) {
            toast.success('Sukses mendaftar');
            window.location.href = '/dashboard';
          } else {
            toast.error(signInResult?.error || 'Login failed after registration.');
            setShowTermsModal(false);
          }
        }
        pendingCredentialsRef.current = null;
      });
    } else if (submitType === 'google' && pendingGoogleFormDataRef.current) {
      const formData = pendingGoogleFormDataRef.current;
      startTransition(async () => {
        try {
          await registerWithGoogle(formData);
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error('Terjadi kesalahan saat mendaftar dengan Google.');
          }
          setShowTermsModal(false);
        }
        pendingGoogleFormDataRef.current = null;
      });
    }
  };

  return (
    <>
      <Card className="w-full max-w-[480px] gap-8 rounded-[40px] px-5 py-12">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="flex items-center justify-center font-['Plus_Jakarta_Sans'] text-[32px] font-extrabold">
            Create Your Account
          </CardTitle>
          <CardDescription className="flex items-center justify-center text-center font-sans text-[16px]">
            Complete your registration to activate your license. Your email is pre-filled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Formulir untuk Kredensial */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCredentialsSubmit)} className="space-y-4">
              <input
                className="rounded-[13px] border-2 border-[#E0E0E0] bg-[#F7F7F7] pl-10 focus-visible:ring-[1px] focus-visible:ring-[#FD4F13]"
                type="hidden"
                {...form.register('signature')}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="relative flex h-12 w-full flex-col items-start justify-center">
                    <FormControl className="h-full w-full">
                      <Input
                        className="rounded-[13px] border-2 border-[#E0E0E0] bg-[#F7F7F7] pl-10 focus-visible:ring-[1px] focus-visible:ring-[#FD4F13]"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                    <Sms className="absolute left-3 text-[#B8B8B8]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="relative flex h-12 w-full flex-col items-start justify-center">
                    <FormControl className="h-full w-full">
                      <Input
                        className="rounded-[13px] border-2 border-[#E0E0E0] bg-[#F7F7F7] pl-10 focus-visible:ring-[1px] focus-visible:ring-[#FD4F13]"
                        {...field}
                        placeholder="John Doe"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                    <User className="absolute left-3 text-[#B8B8B8]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative flex h-12 w-full flex-col items-start justify-center">
                    <FormControl className="h-full w-full">
                      <Input
                        className="w-full rounded-[13px] border-2 border-[#E0E0E0] bg-[#F7F7F7] pl-10 focus-visible:ring-[1px] focus-visible:ring-[#FD4F13]"
                        {...field}
                        placeholder="Password"
                        type="password"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                    <Lock1 className="absolute left-3 text-[#B8B8B8]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="relative flex h-12 w-full flex-col items-start justify-center">
                    <FormControl className="h-full w-full">
                      <Input
                        className="rounded-[13px] border-2 border-[#E0E0E0] bg-[#F7F7F7] pl-10 focus-visible:ring-[1px] focus-visible:ring-[#FD4F13]"
                        {...field}
                        placeholder="Confirm Password"
                        type="password"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                    <Lock1 className="absolute left-3 text-[#B8B8B8]" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="h-[50px] w-full rounded-[13px] bg-[#2E2E2E] font-sans text-[16px] font-light text-white hover:bg-black"
                disabled={isPending}
              >
                {isPending && submitType === 'credentials' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign Up
              </Button>
            </form>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">Or continue with</span>
            </div>
          </div>

          {/* Formulir untuk Google */}
          <form onSubmit={handleGoogleClick}>
            <input
              className="rounded-[13px] border-2 border-[#E0E0E0] bg-[#F7F7F7] pl-10 focus-visible:ring-[1px] focus-visible:ring-[#FD4F13]"
              type="hidden"
              name="signature"
              value={signature}
            />
            <Button variant="outline" type="submit" className="w-full" disabled={isPending}>
              {isPending && submitType === 'google' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.8 0 256S110.3 0 244 0c73 0 134.3 29.3 179.3 74.5l-64 64C297.7 93.5 272.3 80 244 80c-66 0-120 54-120 120s54 120 120 120c73.6 0 98.2-50.5 101.9-74.2H244v-80h244.5c2.6 13.7 3.5 28.3 3.5 42.8z"
                  ></path>
                </svg>
              )}
              Continue with Google
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Terms of Use Modal */}
      <TermsOfUseModal
        open={showTermsModal}
        termsContent={termsContent}
        onOpenChange={setShowTermsModal}
        onAgree={handleAgree}
        isPending={isPending}
        submitType={submitType}
      />
    </>
  );
}
