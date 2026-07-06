import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, BookOpen, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Link } from "wouter";

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Dashboard() {
  const { data, isLoading } = useGetDashboardSummary();

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of students, departments, and courses.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={data?.totalStudents}
          loading={isLoading}
          testId="stat-students"
        />
        <StatCard
          icon={Building2}
          label="Departments"
          value={data?.totalDepartments}
          loading={isLoading}
          testId="stat-departments"
        />
        <StatCard
          icon={BookOpen}
          label="Courses"
          value={data?.totalCourses}
          loading={isLoading}
          testId="stat-courses"
        />
        <StatCard
          icon={TrendingUp}
          label="Average CGPA"
          value={data?.averageCgpa !== undefined ? data.averageCgpa.toFixed(2) : undefined}
          loading={isLoading}
          testId="stat-cgpa"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Students by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.departmentDistribution ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="departmentName" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Students by Year</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={(data?.yearDistribution ?? []).map((d) => ({
                      name: `Year ${d.year}`,
                      value: d.count,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {(data?.yearDistribution ?? []).map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recently Added Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          )}
          {!isLoading && (data?.recentStudents?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">No students yet.</p>
          )}
          {data?.recentStudents?.map((student) => (
            <Link key={student.id} href={`/students/${student.id}`}>
              <div
                className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors cursor-pointer"
                data-testid={`row-recent-student-${student.id}`}
              >
                <div>
                  <p className="font-medium text-sm">{student.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.studentCode} · {student.departmentName}
                  </p>
                </div>
                <Badge variant="secondary">Year {student.year}</Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  testId,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number | undefined;
  loading: boolean;
  testId: string;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-6 w-16 mt-1" />
          ) : (
            <p className="text-xl font-bold" data-testid={testId}>
              {value ?? 0}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
