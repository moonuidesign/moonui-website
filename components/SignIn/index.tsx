'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { signIn } from 'next-auth/react'; // MENGGUNAKAN CLIENT SIDE SIGN IN

import { Loader2 } from 'lucide-react';

// UI Components (Shadcn/UI)
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; // Pastikan sudah install checkbox shadcn
import { Google } from 'iconsax-reactjs';

// Schema Validasi
const signInSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  rememberMe: z.boolean().default(false).optional(),
});

type SignInSchema = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const { handleSubmit, control } = form;

  const onSubmit = async (data: SignInSchema) => {
    setLoading(true);
    try {
      // MENGGUNAKAN LOGIKA DARI KODE REFERENSI ANDA
      const result = await signIn('credentials', {
        redirect: false, // Jangan redirect otomatis, kita handle manual
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        // Handle Error Spesifik dari auth.ts
        if (result.error === 'License expired') {
          toast.error('License expired. Please renew your subscription.');
          router.push('/verify-license');
        } else {
          toast.error('Invalid credentials or account issue.');
        }
        setLoading(false);
      } else {
        // Login Berhasil
        toast.success('Login successful!');

        // Redirect logic (bisa disesuaikan hardcode atau dynamic)
        // Karena client-side, kita redirect manual.
        // Middleware akan menangani redirect role jika user mengakses halaman yang salah.
        router.push('/coba');
        router.refresh();
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      toast.error('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
      <Card className="w-full max-w-md rounded-xl shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign In
          </CardTitle>
          <CardDescription>
            Welcome back! Please enter your details.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="******"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-row justify-between items-center">
                <FormField
                  control={control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold">
                Or sign in with
              </span>
            </div>
          </div>

          {/* Google Button */}
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-10"
              onClick={() => signIn('google', { callbackUrl: '/coba' })}
              disabled={loading}
            >
              <Google size={20} />
              <span className="font-semibold">Google</span>
            </Button>

            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-primary hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
