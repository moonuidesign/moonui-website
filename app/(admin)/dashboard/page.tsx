import { auth } from '@/libs/auth';
import { getRevenueStats } from '@/server-action/admin/kpi';
import { getOverviewStats } from '@/server-action/admin/overview';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  Users,
  Briefcase,
  Activity,
  ShieldCheck,
  FileText,
  UserPlus,
  LayoutTemplate,
  Palette,
  Component,
  Eye,
  Download,
  Award,
  PieChart
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  const [stats, overviewStats] = await Promise.all([
    getRevenueStats(),
    getOverviewStats()
  ]);
  const role = session?.user?.roleUser;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || 'User'}
        </p>
      </div>

      {/* KPI Section */}
      {stats && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Financial KPI & Revenue Sharing
            </h2>
            <span className="text-sm text-muted-foreground">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.transactionsCount} successful transactions
                </p>
              </CardContent>
            </Card>

            <Card>
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
            </Card>

            <Card>
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
            </Card>

            <Card>
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
            </Card>
          </div>
          
           <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
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
            </Card>
        </div>
        </div>
      )}

      {/* Content Analytics Section */}
      {overviewStats && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Content Analytics
          </h2>
          
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Content Items</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(overviewStats.grandTotal.items)}</div>
                    <p className="text-xs text-muted-foreground">Templates, Designs, Components</p>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(overviewStats.grandTotal.views)}</div>
                    <p className="text-xs text-muted-foreground">Across all categories</p>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(overviewStats.grandTotal.interactions)}</div>
                    <p className="text-xs text-muted-foreground">Downloads & Copies</p>
                </CardContent>
             </Card>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Templates Detail */}
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                            <LayoutTemplate className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <CardTitle>Templates</CardTitle>
                            <CardDescription>{formatNumber(overviewStats.templates.total)} items</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Views</span>
                            <span className="font-semibold">{formatNumber(overviewStats.templates.totalViews)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Downloads</span>
                            <span className="font-semibold">{formatNumber(overviewStats.templates.totalDownloads)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Free</span>
                            <span className="font-semibold text-green-600">{formatNumber(overviewStats.templates.freeCount)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Pro</span>
                            <span className="font-semibold text-purple-600">{formatNumber(overviewStats.templates.proCount)}</span>
                        </div>
                    </div>
                    {overviewStats.templates.mostPopular && (
                        <div className="pt-4 border-t mt-auto">
                            <div className="flex items-start gap-2">
                                <Award className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Most Popular</p>
                                    <p className="text-sm font-medium line-clamp-1" title={overviewStats.templates.mostPopular.title}>
                                        {overviewStats.templates.mostPopular.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatNumber(overviewStats.templates.mostPopular.count)} downloads
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Designs Detail */}
             <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-2">
                         <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                            <Palette className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                            <CardTitle>Designs</CardTitle>
                             <CardDescription>{formatNumber(overviewStats.designs.total)} items</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Views</span>
                             <span className="font-semibold">{formatNumber(overviewStats.designs.totalViews)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Downloads</span>
                             <span className="font-semibold">{formatNumber(overviewStats.designs.totalDownloads)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Free</span>
                            <span className="font-semibold text-green-600">{formatNumber(overviewStats.designs.freeCount)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Pro</span>
                            <span className="font-semibold text-purple-600">{formatNumber(overviewStats.designs.proCount)}</span>
                        </div>
                    </div>
                     {overviewStats.designs.mostPopular && (
                        <div className="pt-4 border-t mt-auto">
                            <div className="flex items-start gap-2">
                                <Award className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Most Popular</p>
                                    <p className="text-sm font-medium line-clamp-1" title={overviewStats.designs.mostPopular.title}>
                                        {overviewStats.designs.mostPopular.title}
                                    </p>
                                     <p className="text-xs text-muted-foreground">
                                        {formatNumber(overviewStats.designs.mostPopular.count)} downloads
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Components Detail */}
             <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-2">
                         <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Component className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle>Components</CardTitle>
                             <CardDescription>{formatNumber(overviewStats.components.total)} items</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col">
                             <span className="text-muted-foreground">Views</span>
                            <span className="font-semibold">{formatNumber(overviewStats.components.totalViews)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Copies</span>
                            <span className="font-semibold">{formatNumber(overviewStats.components.totalDownloads)}</span>
                        </div>
                         <div className="flex flex-col">
                            <span className="text-muted-foreground">Free</span>
                            <span className="font-semibold text-green-600">{formatNumber(overviewStats.components.freeCount)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Pro</span>
                            <span className="font-semibold text-purple-600">{formatNumber(overviewStats.components.proCount)}</span>
                        </div>
                    </div>
                     {overviewStats.components.mostPopular && (
                        <div className="pt-4 border-t mt-auto">
                            <div className="flex items-start gap-2">
                                <Award className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Most Popular</p>
                                    <p className="text-sm font-medium line-clamp-1" title={overviewStats.components.mostPopular.title}>
                                        {overviewStats.components.mostPopular.title}
                                    </p>
                                     <p className="text-xs text-muted-foreground">
                                        {formatNumber(overviewStats.components.mostPopular.count)} copies
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Overview Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          System Overview
        </h2>

        {role === 'superadmin' && (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-dashed">
            <div className="flex items-center gap-2 mb-4">
                 <ShieldCheck className="h-5 w-5 text-indigo-500" />
                 <h3 className="font-medium">Super Admin Controls</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Registered Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            1,234
                            <UserPlus className="h-4 w-4 text-green-500" />
                        </div>
                    </CardContent>
                 </Card>

                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Licenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="text-2xl font-bold flex items-center gap-2">
                            892
                            <Activity className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardContent>
                 </Card>

                  <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="text-2xl font-bold text-green-500">Operational</div>
                         <p className="text-xs text-muted-foreground">Last check: 1 min ago</p>
                    </CardContent>
                 </Card>
            </div>
          </div>
        )}

        {role === 'admin' && (
           <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-dashed">
             <div className="flex items-center gap-2 mb-4">
                 <Briefcase className="h-5 w-5 text-blue-500" />
                 <h3 className="font-medium">Admin Workspace</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            12
                            <FileText className="h-4 w-4 text-yellow-500" />
                        </div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Support Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            5
                        </div>
                        <p className="text-xs text-muted-foreground">Open tickets</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
