import { useEffect, useMemo, useState } from "react";
import { Download, TrendingUp, Users, DollarSign, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import apiService, { InstructorAnalyticsData } from "../../services/api";

const COLORS = ['#10b981', '#6366f1', '#ef4444'];

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(Number.isFinite(value) ? value : 0);

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(Number.isFinite(value) ? value : 0);

const getRangeStartDate = (range: string): Date | null => {
  const now = new Date();

  if (range === 'all') {
    return null;
  }

  if (range === '30d') {
    return new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  }

  if (range === '3m') {
    return new Date(now.getFullYear(), now.getMonth() - 2, 1);
  }

  if (range === '6m') {
    return new Date(now.getFullYear(), now.getMonth() - 5, 1);
  }

  if (range === '1y') {
    return new Date(now.getFullYear() - 1, now.getMonth(), 1);
  }

  return null;
};

const escapeCsvValue = (value: string | number) => {
  const raw = `${value}`;
  if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

export function InstructorAnalytics() {
  const [timeRange, setTimeRange] = useState("6m");
  const [analytics, setAnalytics] = useState<InstructorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getInstructorAnalytics();
      setAnalytics(response);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnalytics();
  }, []);

  const trendData = useMemo(() => {
    if (!analytics?.trends) {
      return [];
    }

    const startDate = getRangeStartDate(timeRange);
    if (!startDate) {
      return analytics.trends;
    }

    const filtered = analytics.trends.filter((item) => {
      const pointDate = new Date(item.date);
      return Number.isFinite(pointDate.getTime()) && pointDate >= startDate;
    });

    return filtered.length > 0 ? filtered : analytics.trends;
  }, [analytics, timeRange]);

  const rangeTotals = useMemo(() => {
    return trendData.reduce(
      (acc, item) => {
        acc.revenue += item.revenue || 0;
        acc.enrollments += item.enrollments || 0;
        acc.completions += item.completions || 0;
        return acc;
      },
      { revenue: 0, enrollments: 0, completions: 0 },
    );
  }, [trendData]);

  const progressStatus = useMemo(() => {
    if (!analytics?.progressStatus || analytics.progressStatus.length === 0) {
      return [
        { name: 'Completed', value: 0 },
        { name: 'In Progress', value: 0 },
        { name: 'Not Started', value: 0 },
      ];
    }
    return analytics.progressStatus;
  }, [analytics]);

  const totalProgressRecords = useMemo(
    () => progressStatus.reduce((sum, item) => sum + (item.value || 0), 0),
    [progressStatus],
  );

  const handleExport = () => {
    if (!analytics) {
      return;
    }

    const rows: string[] = [
      'Section,Label,Revenue,Enrollments,Completions,Rating,Reviews',
      ...trendData.map((item) => [
        'Monthly Trend',
        item.month,
        item.revenue,
        item.enrollments,
        item.completions,
        '',
        '',
      ].map(escapeCsvValue).join(',')),
      ...analytics.coursePerformance.map((item) => [
        'Course Performance',
        item.name,
        item.revenue,
        item.enrollments,
        item.completions,
        item.rating,
        item.reviews,
      ].map(escapeCsvValue).join(',')),
    ];

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `instructor-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const showAllRange = timeRange === 'all';
  const summaryRevenue = showAllRange ? (analytics?.summary.totalRevenue || 0) : rangeTotals.revenue;
  const summaryEnrollments = showAllRange ? (analytics?.summary.totalEnrollments || 0) : rangeTotals.enrollments;
  const summaryCompletions = showAllRange ? (analytics?.summary.courseCompletions || 0) : rangeTotals.completions;
  const summaryLabel = showAllRange ? 'All time' : 'Selected range';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics & Insights
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Deep dive into your course performance, revenue, and student engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="30d">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <Button variant="outline" className="shrink-0" onClick={handleExport} disabled={!analytics || loading}>
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 dark:border-red-900/50">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            <Button variant="outline" onClick={fetchAnalytics}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading analytics data...</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Total Revenue",
                value: formatCurrency(summaryRevenue),
                subtitle: summaryLabel,
                icon: DollarSign,
                color: "text-emerald-600",
                bg: "bg-emerald-100 dark:bg-emerald-900/30",
              },
              {
                title: "Total Enrollments",
                value: formatNumber(summaryEnrollments),
                subtitle: summaryLabel,
                icon: Users,
                color: "text-blue-600",
                bg: "bg-blue-100 dark:bg-blue-900/30",
              },
              {
                title: "Avg. Course Rating",
                value: (analytics?.summary.avgCourseRating || 0).toFixed(2),
                subtitle: "Weighted by course reviews",
                icon: TrendingUp,
                color: "text-amber-600",
                bg: "bg-amber-100 dark:bg-amber-900/30",
              },
              {
                title: "Course Completions",
                value: formatNumber(summaryCompletions),
                subtitle: summaryLabel,
                icon: CheckCircle,
                color: "text-purple-600",
                bg: "bg-purple-100 dark:bg-purple-900/30",
              },
            ].map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">{stat.subtitle}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue & Enrollments Over Time</CardTitle>
                <CardDescription>Track your earnings and new student registrations.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number, name: string) => {
                          if (name === 'Revenue ($)') {
                            return [formatCurrency(value), name];
                          }
                          return [formatNumber(value), name];
                        }}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
                      <Area yAxisId="right" type="monotone" dataKey="enrollments" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" name="New Enrollments" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Progress Status</CardTitle>
                <CardDescription>Overall course completion rates.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={progressStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {progressStatus.map((entry, index) => (
                          <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => formatNumber(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full mt-6 space-y-3">
                  {progressStatus.map((item, index) => {
                    const pct = totalProgressRecords > 0 ? Math.round((item.value / totalProgressRecords) * 100) : 0;
                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {pct}% ({formatNumber(item.value)})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Enrollments vs completions across your catalog.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics?.coursePerformance || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(value: number) => formatNumber(value)}
                    />
                    <Legend />
                    <Bar dataKey="enrollments" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Enrollments" />
                    <Bar dataKey="completions" fill="#10b981" radius={[4, 4, 0, 0]} name="Completions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
