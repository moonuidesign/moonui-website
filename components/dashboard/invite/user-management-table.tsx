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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Trash2,
  UserCog,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import {
  deleteUser,
  updateUserRole,
} from '@/server-action/admin/user-management';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  roleUser: 'admin' | 'user' | 'superadmin';
  emailVerified: Date | null;
  createdAt: Date | null;
}
interface UserManagementTableProps {
  users: User[];
  currentUserRole?: string;
  currentUserId?: string;
}

export default function UserManagementTable({
  users,
  currentUserRole,
  currentUserId,
}: UserManagementTableProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!selectedUser) return;

    startTransition(async () => {
      try {
        const res = await deleteUser(selectedUser.id);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.success);
          setIsDeleteDialogOpen(false);
        }
      } catch (error) {
        toast.error('Failed to delete user');
      }
    });
  };

  const handleRoleUpdate = (
    userId: string,
    newRole: 'admin' | 'user' | 'superadmin',
  ) => {
    startTransition(async () => {
      try {
        const res = await updateUserRole(userId, newRole);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.success);
        }
      } catch (error) {
        toast.error('Failed to update role');
      }
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <>
      <Card className="border-dashed shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <CardTitle>User Management</CardTitle>
          </div>
          <CardDescription>
            Manage existing users, roles, and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={user.image || ''}
                            alt={user.name || ''}
                          />
                          <AvatarFallback>
                            {user.name?.[0]?.toUpperCase() ||
                              user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {user.name || 'No Name'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${getRoleBadgeColor(
                          user.roleUser,
                        )}`}
                      >
                        {user.roleUser}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.emailVerified ? (
                          <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Verified
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                            <Loader2 className="w-3 h-3 mr-1" /> Pending
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.createdAt
                        ? format(new Date(user.createdAt), 'MMM d, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              navigator.clipboard.writeText(user.email)
                            }
                          >
                            Copy Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          {currentUserRole === 'superadmin' &&
                            user.id !== currentUserId && (
                              <>
                                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                  Change Role
                                </DropdownMenuLabel>
                                <DropdownMenuRadioGroup
                                  value={user.roleUser}
                                  onValueChange={(val) =>
                                    handleRoleUpdate(user.id, val as any)
                                  }
                                >
                                  <DropdownMenuRadioItem value="user">
                                    User
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="admin">
                                    Admin
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="superadmin">
                                    Superadmin
                                  </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  User
                                </DropdownMenuItem>
                              </>
                            )}

                          {/* Allow deleting admins if currentUser is Superadmin (covered above) */}
                          {/* Allow admins to delete users? Only if users are not admins. */}
                          {currentUserRole === 'admin' &&
                            user.roleUser === 'user' && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete User
                              </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{selectedUser?.email}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
