// components/auth/register-form.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lock1, Sms, User } from 'iconsax-reactjs';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { RegisterSchema, RegisterSchemaType } from '@/types/register';
import {
  registerWithCredentials,
  registerWithGoogle,
} from '@/server-action/Auth/signUp';
import { Input } from '../ui/input';
import { toast } from 'react-toastify';

interface RegisterFormProps {
  signature?: string;
  email?: string;
  licenseKey?: string;
}

export function RegisterForm({ signature, email }: RegisterFormProps) {
  const [isPending, startTransition] = useTransition();

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

  const onSubmit = (values: RegisterSchemaType) => {
    startTransition(async () => {
      const result = await registerWithCredentials(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        const signInResult = await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          toast.error('Sukses mendaftar');
          window.location.href = '/dashboard';
        } else {
          toast.error(
            signInResult?.error || 'Login failed after registration.',
          );
        }
      }
    });
  };

  const onGoogleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await registerWithGoogle(formData);
    });
  };

  return (
    <Card className="w-full max-w-[480px] gap-8 px-5 py-12 rounded-[40px]">
      <CardHeader className="flex justify-center items-center flex-col">
        <CardTitle className="font-jakarta flex justify-center items-center text-[32px] font-extrabold">
          Create Your Account
        </CardTitle>
        <CardDescription className="font-sans text-center text-[16px] flex justify-center items-center">
          Complete your registration to activate your license. Your email is
          pre-filled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Formulir untuk Kredensial */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input
              className="pl-10 rounded-[13px] bg-[#F7F7F7] border-[#E0E0E0] focus-visible:ring-[1px] focus-visible:ring-[#FD4F13] border-2"
              type="hidden"
              {...form.register('signature')}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className=" flex-col w-full h-12 relative flex justify-center items-start">
                  <FormControl className="w-full h-full">
                    <Input
                      className="pl-10 rounded-[13px] bg-[#F7F7F7] border-[#E0E0E0] focus-visible:ring-[1px] focus-visible:ring-[#FD4F13] border-2"
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
                <FormItem className=" flex-col w-full h-12 relative flex justify-center items-start">
                  <FormControl className="w-full h-full">
                    <Input
                      className="pl-10 rounded-[13px] bg-[#F7F7F7] border-[#E0E0E0] focus-visible:ring-[1px] focus-visible:ring-[#FD4F13] border-2"
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
                <FormItem className=" flex-col w-full h-12 relative flex justify-center items-start">
                  <FormControl className="w-full h-full">
                    <Input
                      className="pl-10 w-full rounded-[13px] bg-[#F7F7F7] border-[#E0E0E0] focus-visible:ring-[1px] focus-visible:ring-[#FD4F13] border-2"
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
                <FormItem className=" flex-col w-full h-12 relative flex justify-center items-start">
                  <FormControl className="w-full h-full">
                    <Input
                      className="pl-10 rounded-[13px] bg-[#F7F7F7] border-[#E0E0E0] focus-visible:ring-[1px] focus-visible:ring-[#FD4F13] border-2"
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
            {/* ==== AKHIR BAGIAN YANG DITAMBAHKAN ==== */}

            <Button
              type="submit"
              className="w-full bg-[#2E2E2E] h-[50px] text-white font-light  rounded-[13px] font-sans text-[16px]"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Formulir untuk Google */}
        <form action={onGoogleSubmit}>
          <input
            className="pl-10 rounded-[13px] bg-[#F7F7F7] border-[#E0E0E0] focus-visible:ring-[1px] focus-visible:ring-[#FD4F13] border-2"
            type="hidden"
            name="signature"
            value={signature}
          />
          <Button
            variant="outline"
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {/* Anda bisa menambahkan ikon Google di sini */}
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
            Continue with Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
