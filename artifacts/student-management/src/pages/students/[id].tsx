import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  useGetStudent,
  useUpdateStudent,
  useDeleteStudent,
  useListDepartments,
  useListCourses,
  getListStudentsQueryKey,
  getGetStudentQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function StudentDetail({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const studentId = Number(params.id);
  const { data: student, isLoading } = useGetStudent(studentId);
  const { data: departments } = useListDepartments();

  const [form, setForm] = useState<any>(null);
  const { data: courses } = useListCourses(
    form?.departmentId ? { departmentId: Number(form.departmentId) } : undefined,
  );

  useEffect(() => {
    if (student) {
      setForm({
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth.split("T")[0],
        address: student.address,
        departmentId: String(student.departmentId),
        courseId: String(student.courseId),
        year: String(student.year),
        semester: String(student.semester),
        cgpa: String(student.cgpa),
        attendancePercentage: String(student.attendancePercentage),
      });
    }
  }, [student]);

  const queryClient = useQueryClient();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading || !form) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-muted-foreground">Student not found.</p>
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(
      {
        id: studentId,
        data: {
          studentCode: student.studentCode,
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
          queryClient.invalidateQueries({ queryKey: getGetStudentQueryKey(studentId) });
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          toast.success("Student updated");
        },
        onError: () => toast.error("Failed to update student"),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { id: studentId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          toast.success("Student deleted");
          setLocation("/students");
        },
        onError: () => toast.error("Failed to delete student"),
      },
    );
  };

  const initials = student.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setLocation("/students")} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
          data-testid="button-delete-student"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <Avatar className="w-16 h-16 border">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{student.fullName}</h1>
            <p className="text-sm text-muted-foreground">{student.studentCode}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {student.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {student.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {student.address}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary">Year {student.year}</Badge>
            <span className="text-sm text-muted-foreground">CGPA {student.cgpa.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                data-testid="input-edit-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                data-testid="input-edit-email"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                data-testid="input-edit-phone"
              />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                data-testid="input-edit-dob"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              data-testid="input-edit-address"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.departmentId}
                onValueChange={(v) => setForm({ ...form, departmentId: v })}
              >
                <SelectTrigger data-testid="select-edit-department">
                  <SelectValue />
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
              <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                <SelectTrigger data-testid="select-edit-course">
                  <SelectValue />
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                data-testid="input-edit-year"
              />
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Input
                type="number"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                data-testid="input-edit-semester"
              />
            </div>
            <div className="space-y-2">
              <Label>CGPA</Label>
              <Input
                type="number"
                step="0.01"
                value={form.cgpa}
                onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
                data-testid="input-edit-cgpa"
              />
            </div>
            <div className="space-y-2">
              <Label>Attendance %</Label>
              <Input
                type="number"
                step="0.01"
                value={form.attendancePercentage}
                onChange={(e) => setForm({ ...form, attendancePercentage: e.target.value })}
                data-testid="input-edit-attendance"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              data-testid="button-save-student"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{student.fullName}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
