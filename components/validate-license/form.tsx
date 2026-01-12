'use client';

import { FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';

import { LicenseValidationSchema, licenseValidationSchema } from '@/types/validate';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { validateLicenseAction } from '@/server-action/ValidateLicense/verifyOtp';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { SecuritySafe } from 'iconsax-reactjs';

export function ValidateLicenseForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<LicenseValidationSchema>({
    resolver: zodResolver(licenseValidationSchema),
    defaultValues: {
      licenseKey: '',
    },
  });

  const onSubmit = (values: LicenseValidationSchema) => {
    startTransition(async () => {
      try {
        const result = await validateLicenseAction(values);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
      }
    });
  };

  const onInvalidSubmit = (errors: FieldErrors<LicenseValidationSchema>) => {
    // Ambil pesan error dari field 'licenseKey' dan tampilkan sebagai toast
    if (errors.licenseKey) {
      toast.error(errors.licenseKey.message);
    }
    // Jika ada field lain, Anda bisa menambahkan 'else if' di sini
  };

  return (
    <Card className="w-full max-w-[480px] gap-8 rounded-[40px] px-5 py-12">
      <CardHeader className="flex flex-col items-center justify-center">
        <CardTitle className="flex items-center justify-center font-['Plus_Jakarta_Sans'] text-[32px] font-extrabold">
          Active License & Sign up
        </CardTitle>
        <CardDescription className="flex items-center justify-center text-center font-sans text-[16px]">
          Hey, Enter the license key from your Lemon Squeezy order to access our library
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="licenseKey"
              render={({ field }) => (
                <FormItem className="relative flex h-12 w-full flex-col items-center justify-center">
                  <FormControl className="h-full w-full">
                    <Input
                      className="rounded-[13px] border-2 border-[#E0E0E0] bg-[#F7F7F7] pl-10 focus-visible:ring-[1px] focus-visible:ring-[#FD4F13]"
                      placeholder="License Key : xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>

                  <SecuritySafe className="absolute left-3 text-[#B8B8B8]" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="h-[50px] w-full rounded-[13px] bg-[#2E2E2E] font-sans text-[16px] font-light text-white hover:bg-black"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
            <div className="flex flex-row items-center justify-center gap-2 text-[16px]">
              <span className="font-normal text-[#707070]">Don’t have a license yet?</span>
              <Link href="#" className="font-medium hover:underline">
                Get License
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
