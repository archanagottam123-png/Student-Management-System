import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, studentsTable, departmentsTable, coursesTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalStudents: sql<number>`(select count(*) from ${studentsTable})::int`,
      totalDepartments: sql<number>`(select count(*) from ${departmentsTable})::int`,
      totalCourses: sql<number>`(select count(*) from ${coursesTable})::int`,
      averageCgpa: sql<number>`coalesce((select avg(${studentsTable.cgpa}) from ${studentsTable}), 0)::float`,
      averageAttendance: sql<number>`coalesce((select avg(${studentsTable.attendancePercentage}) from ${studentsTable}), 0)::float`,
    })
    .from(studentsTable)
    .limit(1);

  const departmentDistribution = await db
    .select({
      departmentName: departmentsTable.name,
      count: sql<number>`count(${studentsTable.id})::int`,
    })
    .from(departmentsTable)
    .leftJoin(studentsTable, eq(studentsTable.departmentId, departmentsTable.id))
    .groupBy(departmentsTable.id)
    .orderBy(departmentsTable.name);

  const yearDistribution = await db
    .select({
      year: studentsTable.year,
      count: sql<number>`count(*)::int`,
    })
    .from(studentsTable)
    .groupBy(studentsTable.year)
    .orderBy(studentsTable.year);

  const recentStudents = await db
    .select({
      id: studentsTable.id,
      studentCode: studentsTable.studentCode,
      fullName: studentsTable.fullName,
      email: studentsTable.email,
      phone: studentsTable.phone,
      gender: studentsTable.gender,
      dateOfBirth: studentsTable.dateOfBirth,
      address: studentsTable.address,
      departmentId: studentsTable.departmentId,
      departmentName: departmentsTable.name,
      courseId: studentsTable.courseId,
      courseName: coursesTable.name,
      year: studentsTable.year,
      semester: studentsTable.semester,
      cgpa: studentsTable.cgpa,
      attendancePercentage: studentsTable.attendancePercentage,
      createdAt: studentsTable.createdAt,
    })
    .from(studentsTable)
    .leftJoin(departmentsTable, eq(studentsTable.departmentId, departmentsTable.id))
    .leftJoin(coursesTable, eq(studentsTable.courseId, coursesTable.id))
    .orderBy(desc(studentsTable.createdAt))
    .limit(5);

  res.json(
    GetDashboardSummaryResponse.parse({
      totalStudents: totals?.totalStudents ?? 0,
      totalDepartments: totals?.totalDepartments ?? 0,
      totalCourses: totals?.totalCourses ?? 0,
      averageCgpa: totals?.averageCgpa ?? 0,
      averageAttendance: totals?.averageAttendance ?? 0,
      departmentDistribution,
      yearDistribution,
      recentStudents,
    }),
  );
});

export default router;
