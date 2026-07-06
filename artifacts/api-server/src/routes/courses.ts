import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, coursesTable, departmentsTable, studentsTable } from "@workspace/db";
import {
  CreateCourseBody,
  UpdateCourseBody,
  GetCourseParams,
  UpdateCourseParams,
  DeleteCourseParams,
  ListCoursesQueryParams,
  ListCoursesResponse,
  GetCourseResponse,
  CreateCourseResponse,
  UpdateCourseResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/courses", async (req, res): Promise<void> => {
  const query = ListCoursesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.departmentId !== undefined) {
    conditions.push(eq(coursesTable.departmentId, query.data.departmentId));
  }

  let baseQuery = db
    .select({
      id: coursesTable.id,
      name: coursesTable.name,
      code: coursesTable.code,
      departmentId: coursesTable.departmentId,
      departmentName: departmentsTable.name,
      credits: coursesTable.credits,
      studentCount: sql<number>`count(distinct ${studentsTable.id})::int`,
    })
    .from(coursesTable)
    .leftJoin(departmentsTable, eq(coursesTable.departmentId, departmentsTable.id))
    .leftJoin(studentsTable, eq(studentsTable.courseId, coursesTable.id))
    .groupBy(coursesTable.id, departmentsTable.name)
    .orderBy(coursesTable.name)
    .$dynamic();

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(conditions[0]);
  }

  const rows = await baseQuery;

  res.json(ListCoursesResponse.parse(rows));
});

router.post("/courses", async (req, res): Promise<void> => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [course] = await db.insert(coursesTable).values(parsed.data).returning();

  const [department] = await db
    .select({ name: departmentsTable.name })
    .from(departmentsTable)
    .where(eq(departmentsTable.id, parsed.data.departmentId));

  res.status(201).json(
    CreateCourseResponse.parse({
      ...course,
      departmentName: department?.name,
      studentCount: 0,
    }),
  );
});

router.get("/courses/:id", async (req, res): Promise<void> => {
  const params = GetCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      id: coursesTable.id,
      name: coursesTable.name,
      code: coursesTable.code,
      departmentId: coursesTable.departmentId,
      departmentName: departmentsTable.name,
      credits: coursesTable.credits,
      studentCount: sql<number>`count(distinct ${studentsTable.id})::int`,
    })
    .from(coursesTable)
    .leftJoin(departmentsTable, eq(coursesTable.departmentId, departmentsTable.id))
    .leftJoin(studentsTable, eq(studentsTable.courseId, coursesTable.id))
    .where(eq(coursesTable.id, params.data.id))
    .groupBy(coursesTable.id, departmentsTable.name);

  if (!row) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  res.json(GetCourseResponse.parse(row));
});

router.put("/courses/:id", async (req, res): Promise<void> => {
  const params = UpdateCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [course] = await db
    .update(coursesTable)
    .set(parsed.data)
    .where(eq(coursesTable.id, params.data.id))
    .returning();

  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const [department] = await db
    .select({ name: departmentsTable.name })
    .from(departmentsTable)
    .where(eq(departmentsTable.id, course.departmentId));

  const [counts] = await db
    .select({ studentCount: sql<number>`count(*)::int` })
    .from(studentsTable)
    .where(eq(studentsTable.courseId, course.id));

  res.json(
    UpdateCourseResponse.parse({
      ...course,
      departmentName: department?.name,
      studentCount: counts?.studentCount ?? 0,
    }),
  );
});

router.delete("/courses/:id", async (req, res): Promise<void> => {
  const params = DeleteCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [course] = await db
    .delete(coursesTable)
    .where(eq(coursesTable.id, params.data.id))
    .returning();

  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
