import { getRevenueStats } from '@/server-action/admin/kpi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Briefcase, TrendingUp } from 'lucide-react';
import { auth } from '@/libs/auth';

import { redirect } from 'next/navigation';

export default async function KpiPage() {
  const session = await auth();
  // const stats = await getRevenueStats();
  console.log(session);

  // Helper to format currency (assuming amount is in cents/IDR equivalent)
  // If stored as raw number (e.g. 100000), format directly.
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Financial KPI & Revenue Sharing
      </h1>
      <p className="text-muted-foreground">
        Revenue breakdown for the current month (
        {new Date().toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        })}
        ).
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          {/* <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.transactionsCount} successful transactions
            </p>
          </CardContent> */}
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Super Admin Share (30%)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.superAdminShare)}
            </div>
            <p className="text-xs text-muted-foreground">Allocated to Owner</p>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Admins Pool (70%)
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.adminShareTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Shared among all admins
            </p>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Per Admin Share
            </CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.adminSharePerPerson)}
            </div>
            <p className="text-xs text-muted-foreground">
              For {stats.adminCount} registered admins
            </p>
          </CardContent>
        </Card> */}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribution Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  Super Admin (Owner):
                </span>{' '}
                Receives a fixed <span className="font-bold">30%</span> of the
                total monthly revenue.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Admins Team:
                </span>{' '}
                The remaining <span className="font-bold">70%</span> is pooled
                together.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Individual Admin:
                </span>{' '}
                The pool is divided equally by the number of active admin
                accounts (currently {stats.adminCount}).
              </li>
              <li>
                Calculations are based on transactions from the 1st to the last
                day of the current month.
              </li>
            </ul>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
