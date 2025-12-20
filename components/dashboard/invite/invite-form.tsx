'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { inviteUser } from '@/server-action/admin/invite';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Mail, Shield, UserPlus } from 'lucide-react';

const inviteSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  role: z.enum(['admin', 'user', 'superadmin'], {
    error: 'Please select a role',
  }),
});

type InviteSchemaType = z.infer<typeof inviteSchema>;

export default function InviteForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<InviteSchemaType>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'user',
    },
    mode: 'onChange',
  });

  const onSubmit = (data: InviteSchemaType) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('role', data.role);

    startTransition(async () => {
      try {
        const result = await inviteUser(null, formData);

        if (result?.error) {
          toast.error(result.error);
        } else if (result?.success) {
          toast.success(result.success);
          form.reset();
        }
      } catch (e) {
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  };

  return (
    <Card className="h-full border-dashed shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle>Invite New Member</CardTitle>
        </div>
        <CardDescription>
          Send an invitation email to add a new user to the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="colleague@company.com"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    The invitation link will be sent to this email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" /> Assign Role
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex flex-col text-left">
                          <span className="font-medium">User</span>
                          <span className="text-xs text-muted-foreground">
                            Standard access
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Admin</span>
                          <span className="text-xs text-muted-foreground">
                            Manage content & users
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="superadmin">
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Superadmin</span>
                          <span className="text-xs text-muted-foreground">
                            Full system control
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Controls what the user can see and do in the dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
              className="w-full h-11"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
