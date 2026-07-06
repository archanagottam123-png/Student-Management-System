import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useListStudents,
  useListDepartments,
  useListCourses,
  useCreateStudent,
  getListStudentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 8;

type FormState = {
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  address: string;
  departmentId: string;
  courseId: string;
  year: string;
  semester: string;
  cgpa: string;
  attendancePercentage: string;
};

const emptyForm: FormState = {
  studentCode: "",
  fullName: "",
  email: "",
  phone: "",
  gender: "male",
  dateOfBirth: "",
  address: "",
  departmentId: "",
  courseId: "",
  year: "1",
  semester: "1",
  cgpa: "0",
  attendancePercentage: "0",
};

export default function Students() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: departments } = useListDepartments();
  const { data: courses } = useListCourses(
    form.departmentId ? { departmentId: Number(form.departmentId) } : undefined,
  );

  const { data, isLoading } = useListStudents({
    search: search || undefined,
    departmentId: departmentFilter !== "all" ? Number(departmentFilter) : undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const queryClient = useQueryClient();
  const createMutation = useCreateStudent();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departmentId || !form.courseId) {
      toast.error("Please select department and course");
      return;
    }

    createMutation.mutate(
      {
        data: {
          studentCode: form.studentCode,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          gender: form.gender,
          dateOfBirth: new Date(form.dateOfBirth) as any,
          address: form.address,
          departmentId: Number(form.departmentId),
          courseId: Number(form.courseId),
          year: Number(form.year),
          semester: Number(form.semester),
          cgpa: Number(form.cgpa),
          attendancePercentage: Number(form.attendancePercentage),
        },
      },
      {
        onSuccess: () => {
          invalidate();
          setDialogOpen(false);
          setForm(emptyForm);
          toast.success("Student created");
        },
        onError: () => toast.error("Failed to create student"),
      },
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Search, filter, and manage student records.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-add-student">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or student code..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            data-testid="input-search-students"
          />
        </div>
        <Select
          value={departmentFilter}
          onValueChange={(v) => {
            setDepartmentFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-56" data-testid="select-filter-department">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments?.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-center">Year</TableHead>
                <TableHead className="text-center">CGPA</TableHead>
                <TableHead className="text-center">Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && (data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No students found.
                  </TableCell>
                </TableRow>
              )}
              {data?.items.map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer"
                  onClick={() => setLocation(`/students/${student.id}`)}
                  data-testid={`row-student-${student.id}`}
                >
                  <TableCell>
                    <p className="font-medium">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground">{student.studentCode}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.departmentName ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.courseName ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">Year {student.year}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{student.cgpa.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    {student.attendancePercentage.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} of{" "}
            {data.total} students
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setForm(emptyForm);
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-code">Student Code</Label>
                <Input
                  id="s-code"
                  required
                  value={form.studentCode}
                  onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                  data-testid="input-student-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-name">Full Name</Label>
                <Input
                  id="s-name"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  data-testid="input-student-name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-email">Email</Label>
                <Input
                  id="s-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  data-testid="input-student-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-phone">Phone</Label>
                <Input
                  id="s-phone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  data-testid="input-student-phone"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v as FormState["gender"] })}
                >
                  <SelectTrigger data-testid="select-student-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-dob">Date of Birth</Label>
                <Input
                  id="s-dob"
                  type="date"
                  required
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  data-testid="input-student-dob"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-address">Address</Label>
              <Input
                id="s-address"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                data-testid="input-student-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={form.departmentId}
                  onValueChange={(v) => setForm({ ...form, departmentId: v, courseId: "" })}
                >
                  <SelectTrigger data-testid="select-student-department">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={form.courseId}
                  onValueChange={(v) => setForm({ ...form, courseId: v })}
                  disabled={!form.departmentId}
                >
                  <SelectTrigger data-testid="select-student-course">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-year">Year</Label>
                <Input
                  id="s-year"
                  type="number"
                  min={1}
                  max={6}
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  data-testid="input-student-year"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-semester">Semester</Label>
                <Input
                  id="s-semester"
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  data-testid="input-student-semester"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-cgpa">CGPA</Label>
                <Input
                  id="s-cgpa"
                  type="number"
                  step="0.01"
                  min={0}
                  max={4}
                  required
                  value={form.cgpa}
                  onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
                  data-testid="input-student-cgpa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-attendance">Attendance %</Label>
                <Input
                  id="s-attendance"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  required
                  value={form.attendancePercentage}
                  onChange={(e) => setForm({ ...form, attendancePercentage: e.target.value })}
                  data-testid="input-student-attendance"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit-student"
              >
                Create Student
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
