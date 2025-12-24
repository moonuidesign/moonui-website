'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { signIn } from 'next-auth/react'; // Untuk credentials

import { Loader2 } from 'lucide-react';
import { signInWithGoogle } from '@/server-action/Auth/signInWithGoogle';

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
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const { handleSubmit, control } = form;

  // Handler untuk Google Sign-In
  const handleGoogleSignIn = () => {
    startTransition(async () => {
      try {
        await signInWithGoogle();
      } catch (error) {
        // Error dari server action (user tidak ditemukan, dll)
        if (error instanceof Error) {
          // Parse error message dari auth.ts
          if (error.message.includes('not found') || error.message.includes('tidak ditemukan')) {
            toast.error('Akun tidak ditemukan. Silakan daftar terlebih dahulu.');
            router.push('/verify-license');
          } else if (error.message.includes('register')) {
            toast.error('Silakan daftar terlebih dahulu.');
            router.push('/verify-license');
          } else {
            toast.error(error.message || 'Terjadi kesalahan saat login.');
          }
        } else {
          toast.error('Terjadi kesalahan saat login dengan Google.');
        }
      }
    });
  };

  const onSubmit = async (data: SignInSchema) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (result?.error) {
        if (result.error === 'License expired') {
          toast.error('License expired. Please renew your subscription.');
          router.push('/verify-license');
        } else {
          toast.error('Invalid credentials or account issue.');
        }
        setLoading(false);
      } else {
        toast.success('Login successful!');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      toast.error('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[480px] gap-8 px-5 py-12 rounded-[40px]">
      <CardHeader className="flex justify-center items-center flex-col">
        <CardTitle className="font-['Plus_Jakarta_Sans'] flex justify-center items-center text-[32px] font-extrabold">
          Sign In
        </CardTitle>
        <CardDescription className="font-sans text-center text-[16px] flex justify-center items-center">
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
            onClick={handleGoogleSignIn}
            disabled={loading || isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Google size={20} />
            )}
            <span className="font-semibold">
              {isPending ? 'Memproses...' : 'Google'}
            </span>
          </Button>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/verify-license"
              className="font-semibold text-primary hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
