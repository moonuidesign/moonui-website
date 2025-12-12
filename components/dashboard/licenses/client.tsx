'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DashboardPagination } from '@/components/dashboard/dashboard-pagination';
import { format } from 'date-fns';

export interface LicenseItem {
  id: string;
  licenseKey: string;
  userEmail: string;
  status: string;
  planType: string;
  tier: string;
  expiresAt: string | null;
  createdAt: string;
}

interface LicensesClientProps {
  data: LicenseItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export default function LicensesClient({
  data,
  pagination,
}: LicensesClientProps) {
  const getStatusColor = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'active':
        return 'default'; // primary/black
      case 'expired':
        return 'destructive';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Key</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No licenses found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    {item.licenseKey}
                  </TableCell>
                  <TableCell>{item.userEmail}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{item.planType}</TableCell>
                  <TableCell className="capitalize">{item.tier}</TableCell>
                  <TableCell>
                    {item.expiresAt
                      ? format(new Date(item.expiresAt), 'PPP')
                      : 'Lifetime'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(item.createdAt), 'PPP')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DashboardPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
