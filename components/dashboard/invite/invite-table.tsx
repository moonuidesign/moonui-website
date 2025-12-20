'use client';

import { useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { cancelInvite, inviteUser } from '@/server-action/admin/invite';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  expires: Date;
  createdAt: Date | null;
}

interface InviteTableProps {
  invites: Invite[];
}

export default function InviteTable({ invites }: InviteTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = (id: string, isAccepted: boolean) => {
    const message = isAccepted 
        ? 'Are you sure you want to remove this user? This will delete their account.' 
        : 'Are you sure you want to cancel this invitation?';
        
    if(!confirm(message)) return;
    
    startTransition(async () => {
      const res = await cancelInvite(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
      }
    });
  };

  const handleResend = (email: string, role: string) => {
    startTransition(async () => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('role', role);
        
        const res = await inviteUser(null, formData);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Invitation resent successfully');
        }
    });
  }

  return (
    <Card className="border-dashed shadow-sm">
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>
          Manage sent invitations. Expired invitations can be resent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No pending invitations.
                  </TableCell>
                </TableRow>
              ) : (
                invites.map((invite) => {
                  const isExpired = new Date(invite.expires) < new Date();
                  // Prioritize 'accepted' over 'expired'
                  const status = invite.status === 'accepted' ? 'accepted' : (isExpired ? 'expired' : invite.status);

                  return (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell className="capitalize">{invite.role}</TableCell>
                      <TableCell>
                        <Badge 
                            variant={status === 'expired' ? 'destructive' : status === 'accepted' ? 'default' : 'secondary'}
                            className="capitalize"
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(invite.expires), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                              <span className="sr-only">Open menu</span>
                              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {status === 'expired' && (
                                <DropdownMenuItem onClick={() => handleResend(invite.email, invite.role)}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Resend Invite
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleCancel(invite.id, invite.status === 'accepted')}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> {invite.status === 'accepted' ? 'Remove User' : 'Cancel Invite'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
