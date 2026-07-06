import { Router, type IRouter } from "express";
import { eq, and, sql, ilike, or, desc, type SQL } from "drizzle-orm";
import { db, studentsTable, departmentsTable, coursesTable } from "@workspace/db";
import {
  CreateStudentBody,
  UpdateStudentBody,
  GetStudentParams,
  UpdateStudentParams,
  DeleteStudentParams,
  ListStudentsQueryParams,
  ListStudentsResponse,
  GetStudentResponse,
  CreateStudentResponse,
  UpdateStudentResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function studentSelect() {
  return db
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
    .leftJoin(coursesTable, eq(studentsTable.courseId, coursesTable.id));
}

router.get("/students", async (req, res): Promise<void> => {
  const query = ListStudentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { search, departmentId, courseId, year, page = 1, pageSize = 10 } = query.data;

  const conditions: SQL[] = [];
  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(
        ilike(studentsTable.fullName, term),
        ilike(studentsTable.email, term),
        ilike(studentsTable.studentCode, term),
      )!,
    );
  }
  if (departmentId !== undefined) {
    conditions.push(eq(studentsTable.departmentId, departmentId));
  }
  if (courseId !== undefined) {
    conditions.push(eq(studentsTable.courseId, courseId));
  }
  if (year !== undefined) {
    conditions.push(eq(studentsTable.year, year));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count: total } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(studentsTable)
    .where(whereClause);

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 100);

  let listQuery = studentSelect().$dynamic();
  if (whereClause) {
    listQuery = listQuery.where(whereClause);
  }

  const items = await listQuery
    .orderBy(desc(studentsTable.createdAt))
    .limit(safePageSize)
    .offset((safePage - 1) * safePageSize);

  res.json(
    ListStudentsResponse.parse({
      items,
      total,
      page: safePage,
      pageSize: safePageSize,
    }),
  );
});

router.post("/students", async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { dateOfBirth, cgpa, attendancePercentage, ...rest } = parsed.data;

  const [created] = await db
    .insert(studentsTable)
    .values({
      ...rest,
      dateOfBirth: dateOfBirth.toISOString().slice(0, 10),
      cgpa,
      attendancePercentage,
    })
    .returning();

  if (!created) {
    res.status(500).json({ error: "Failed to create student" });
    return;
  }

  const [full] = await studentSelect().where(eq(studentsTable.id, created.id));

  res.status(201).json(CreateStudentResponse.parse(full));
});

router.get("/students/:id", async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [student] = await studentSelect().where(eq(studentsTable.id, params.data.id));

  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json(GetStudentResponse.parse(student));
});

router.put("/students/:id", async (req, res): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { dateOfBirth, cgpa, attendancePercentage, ...rest } = parsed.data;

  const [updated] = await db
    .update(studentsTable)
    .set({
      ...rest,
      dateOfBirth: dateOfBirth.toISOString().slice(0, 10),
      cgpa,
      attendancePercentage,
    })
    .where(eq(studentsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const [full] = await studentSelect().where(eq(studentsTable.id, updated.id));

  res.json(UpdateStudentResponse.parse(full));
});

router.delete("/students/:id", async (req, res): Promise<void> => {
  const params = DeleteStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [student] = await db
    .delete(studentsTable)
    .where(eq(studentsTable.id, params.data.id))
    .returning();

  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
