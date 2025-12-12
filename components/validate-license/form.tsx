'use client';

import { FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';

import {
  LicenseValidationSchema,
  licenseValidationSchema,
} from '@/types/validate';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
        toast.error(
          error instanceof Error ? error.message : 'An unknown error occurred.',
        );
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
    <Card className="w-full max-w-[480px] gap-8 px-5 py-12 rounded-[40px]">
      <CardHeader className="flex justify-center items-center flex-col">
        <CardTitle className="font-jakarta flex justify-center items-center text-[32px] font-extrabold">
          Active License & Sign up
        </CardTitle>
        <CardDescription className="font-sans text-center text-[16px] flex justify-center items-center">
          Hey, Enter the license key from your Lemon Squeezy order to access our
          library
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="licenseKey"
              render={({ field }) => (
                <FormItem className="w-full h-12 relative flex flex-col justify-center items-center">
                  <FormControl className="w-full h-full">
                    <Input
                      className="pl-10 rounded-[13px] bg-[#F7F7F7] border-[#E0E0E0] focus-visible:ring-[1px] focus-visible:ring-[#FD4F13] border-2"
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
              className="w-full bg-[#2E2E2E] h-[50px] text-white font-light  rounded-[13px] font-sans text-[16px]"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
            <div className="flex flex-row gap-2 text-[16px] justify-center items-center">
              <span className="font-normal text-[#707070]">
                Don’t have a license yet?
              </span>
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
